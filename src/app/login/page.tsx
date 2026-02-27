'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useUser, useFirestore } from '@/firebase';
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
      router.push('/dashboard');
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
    const password = 'password2026'; // Firebase requires a password of at least 6 characters.

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Successful sign-in will be detected by useUser and trigger redirect.
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            try {
                // If user does not exist, create it.
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;
                // Create user profile in Firestore
                if (newUser) {
                    const userDocRef = doc(firestore, 'users', newUser.uid);
                    await setDoc(userDocRef, {
                        email: newUser.email,
                        displayName: 'MEAF User',
                        photoURL: '',
                    });
                }
            } catch (creationError: any) {
                setIsLoggingIn(false);
                toast({
                    variant: "destructive",
                    title: "Setup Error",
                    description: `Could not create the necessary user account: ${creationError.message}`,
                });
            }
        } else {
            setIsLoggingIn(false);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.message || "An unexpected error occurred. Please try again.",
            });
        }
    }
    // No need to set isLoggingIn to false here on success, as the component will redirect and unmount.
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
          
          <div className="w-full max-w-sm space-y-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input 
                    type="text" 
                    id="username" 
                    placeholder="MEAF" 
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
                    placeholder="••••••••" 
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
