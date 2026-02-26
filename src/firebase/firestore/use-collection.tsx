"use client";

import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Firestore,
  type Query,
  type Unsubscribe,
  type SnapshotListenOptions,
  type QueryConstraint,
} from "firebase/firestore";
import { useEffect, useState, useRef, useMemo } from "react";
import { useFirestore } from "../provider";
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

type CollectionOptions<T> = {
  idField?: string;
  transform?: (data: DocumentData) => T;
  snapshotListenOptions?: SnapshotListenOptions;
};

export function useCollection<T>(
  queryOrPath: Query | string | null,
  options?: CollectionOptions<T>
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queryRef = useRef(queryOrPath);
  useEffect(() => {
    queryRef.current = queryOrPath;
  }, [queryOrPath]);


  useEffect(() => {
    if (!firestore || !queryRef.current) {
      setLoading(false);
      return;
    }
    
    setLoading(true);

    let unsubscribe: Unsubscribe;
    try {
      const q = typeof queryRef.current === 'string'
        ? collection(firestore, queryRef.current)
        : queryRef.current;
        
      unsubscribe = onSnapshot(
        q,
        options?.snapshotListenOptions || {},
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => {
            const docData = doc.data();
            const transformedData = options?.transform
              ? options.transform(docData)
              : docData;
            
            if (options?.idField) {
              return {
                ...transformedData,
                [options.idField]: doc.id,
              } as T;
            }
            return transformedData as T;
          });
          setData(docs);
          setLoading(false);
          setError(null);
        },
        async (err) => {
            const path = (q as Query).path;
            const permissionError = new FirestorePermissionError({
                path,
                operation: 'list',
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
  }, [firestore, options?.idField, options?.transform, options?.snapshotListenOptions]); // Note: queryOrPath is handled via ref

  return { data, loading, error };
}

export function useMemoFirebase<T>(
  factory: () => T,
  deps: React.DependencyList
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
