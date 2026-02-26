'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';
import Loading from '../loading';

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  if (loading || user) {
    return <Loading />;
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-300 via-red-500 to-red-600 p-1">
        <div className="flex flex-col items-center gap-6 bg-card p-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-orange-300 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-lg brightness-110 saturate-125">
                ME Asset Flow
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue to your dashboard</p>
          </div>
          <Button onClick={handleSignIn} size="lg" className="w-full max-w-sm">
            <Chrome className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </main>
  );
}
