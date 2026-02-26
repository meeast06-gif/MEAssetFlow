'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { isFirebaseError } from '@/firebase/errors';

// This is a client component that listens for Firebase errors and displays them in a toast.
// It is intended for development purposes only.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      console.error("Caught a firebase permission error", error);
      if (isFirebaseError(error)) {
        toast({
          variant: 'destructive',
          title: 'Firestore Permission Error',
          description: error.message,
          duration: 20000,
        });
      }
    });

    return () => unsubscribe();
  }, [toast]);

  return null;
}
