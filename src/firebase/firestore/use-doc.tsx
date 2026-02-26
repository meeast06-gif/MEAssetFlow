"use client";

import {
  doc,
  onSnapshot,
  type DocumentReference,
  type DocumentData,
  type Firestore,
  type Unsubscribe,
  type SnapshotListenOptions,
} from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { useFirestore } from "../provider";
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type DocOptions<T> = {
  idField?: string;
  transform?: (data: DocumentData) => T;
  snapshotListenOptions?: SnapshotListenOptions;
};

export function useDoc<T>(
  docRefOrPath: DocumentReference | string | null,
  options?: DocOptions<T>
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const docRefRef = useRef(docRefOrPath);
  useEffect(() => {
    docRefRef.current = docRefOrPath;
  }, [docRefOrPath]);

  useEffect(() => {
    if (!firestore || !docRefRef.current) {
        setLoading(false);
        return;
    }
    
    setLoading(true);

    let unsubscribe: Unsubscribe;
    try {
        const d = typeof docRefRef.current === 'string'
            ? doc(firestore, docRefRef.current)
            : docRefRef.current;
        
        unsubscribe = onSnapshot(
            d,
            options?.snapshotListenOptions || {},
            (snapshot) => {
                if (snapshot.exists()) {
                    const docData = snapshot.data();
                    const transformedData = options?.transform
                        ? options.transform(docData)
                        : docData;
                    
                    if (options?.idField) {
                        setData({
                            ...transformedData,
                            [options.idField]: snapshot.id,
                        } as T);
                    } else {
                        setData(transformedData as T);
                    }
                } else {
                    setData(null);
                }
                setLoading(false);
                setError(null);
            },
            async (err) => {
                const path = (d as DocumentReference).path;
                const permissionError = new FirestorePermissionError({
                    path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
                setError(permissionError);
                setLoading(false);
            }
        );
    } catch (e: any) {
        setError(e);
        setLoading(false);
    }


    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [firestore, options?.idField, options?.transform, options?.snapshotListenOptions]); // Note: docRefOrPath is handled by ref

  return { data, loading, error };
}
