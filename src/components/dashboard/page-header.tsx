"use client";

import { useState } from "react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { PlusCircle, Power } from "lucide-react";
import { AssetForm } from "./asset-form";

export default function PageHeader() {
  const [open, setOpen] = useState(false);
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
        <span className="bg-gradient-to-r from-orange-300 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm brightness-110 saturate-125">
          ME Asset Flow
        </span>
      </h1>
      <div className="ml-auto flex items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add a New Asset</DialogTitle>
            </DialogHeader>
            <AssetForm
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
        {user && auth && (
           <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sign Out"
            >
                <Power className="h-6 w-6 text-destructive" />
            </Button>
        )}
      </div>
    </div>
  );
}
