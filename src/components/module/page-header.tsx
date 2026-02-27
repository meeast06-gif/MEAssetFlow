"use client";

import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";

export default function PageHeader({ moduleName }: { moduleName: string }) {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  return (
    <div className="flex items-center">
      <h1 className="text-2xl font-semibold md:text-3xl">
        {moduleName}
      </h1>
      <div className="ml-auto flex items-center gap-4">
        {user && auth && (
           <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sign Out"
            >
                <Power className="h-6 w-6 text-orange-500" />
            </Button>
        )}
      </div>
    </div>
  );
}
