'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Loading from '../loading';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [passKey, setPassKey] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/modules');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (!auth || !firestore) return;

    if (username !== 'MEAF' || passKey !== '2026') {
        toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: "Please check your username and passkey.",
        });
        return;
    }

    setIsLoggingIn(true);
    const email = 'meaf@assetflow.app';
    const password = 'password2026';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // On success, the useUser hook's effect will handle the redirect.
    } catch (error: any) {
        // If user does not exist (or another invalid credential error), try to create the account.
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;
                if (newUser) {
                    const userDocRef = doc(firestore, 'users', newUser.uid);
                    // Create user profile in Firestore, with specific error handling for this operation.
                    setDoc(userDocRef, {
                        email: newUser.email,
                        displayName: 'MEAF User',
                        photoURL: '',
                    }).catch(serverError => {
                        const permissionError = new FirestorePermissionError({
                            path: userDocRef.path,
                            operation: 'create',
                            requestResourceData: { email: newUser.email, displayName: 'MEAF User', photoURL: '' }
                        });
                        errorEmitter.emit('permission-error', permissionError);
                    });
                }
                // `createUserWithEmailAndPassword` signs the user in, so the useUser hook will now trigger the redirect.
            } catch (creationError: any) {
                // This catch is for when account creation itself fails.
                setIsLoggingIn(false);
                toast({
                    variant: "destructive",
                    title: "Account Setup Failed",
                    description: `An error occurred during initial setup: ${creationError.message}`,
                });
            }
        } else {
            // Handle other sign-in errors (e.g., network issue, different wrong password error).
            setIsLoggingIn(false);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Please check your credentials or network connection.",
            });
        }
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };

  if (loading || user) {
    return <Loading />;
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-300 via-red-500 to-red-600 py-1">
        <div className="flex flex-col items-center gap-6 bg-card p-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-orange-300 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-lg brightness-110 saturate-125">
                ME Asset Flow
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue to your dashboard</p>
          </div>
          
          <div className="w-full max-w-sm space-y-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input 
                    type="text" 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    disabled={isLoggingIn}
                />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="passkey">PassKey</Label>
                <Input 
                    type="password" 
                    id="passkey" 
                    value={passKey} 
                    onChange={(e) => setPassKey(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    disabled={isLoggingIn}
                />
            </div>

            <Button onClick={handleSignIn} size="lg" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </div>

        </div>
      </div>
    </main>
  );
}
