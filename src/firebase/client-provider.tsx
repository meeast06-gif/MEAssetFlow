'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseProvider, initializeFirebase } from '.';

const FirebaseClientContext = createContext<{
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    setFirebase({ firebaseApp, auth, firestore });
  }, []);

  if (!firebase) {
    return null;
  }

  return (
    <FirebaseClientContext.Provider value={firebase}>
      <FirebaseProvider
        firebaseApp={firebase.firebaseApp}
        auth={firebase.auth}
        firestore={firebase.firestore}
      >
        {children}
      </FirebaseProvider>
    </FirebaseClientContext.Provider>
  );
}

export const useFirebaseClient = () => useContext(FirebaseClientContext);
