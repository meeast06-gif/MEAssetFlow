"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { addDoc, updateDoc, doc, collection, Timestamp } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import { Asset, AssetFormData, AssetFormSchema } from "@/lib/definitions";
import { ASSET_TYPES } from "@/lib/constants";

interface AssetFormProps {
  asset?: Asset;
  onSuccess: () => void;
}

export function AssetForm({ asset, onSuccess }: AssetFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(AssetFormSchema),
    defaultValues: {
      name: asset?.name || "",
      type: asset?.type || "Stocks",
      value: asset?.currentValue || 0,
      acquisitionDate: asset ? new Date(asset.acquisitionDate) : new Date(),
      notes: asset?.notes || "",
    },
  });

  const onSubmit = (values: AssetFormData) => {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to manage assets.",
      });
      return;
    };

    startTransition(() => {
        const { acquisitionDate, ...rest } = values;
        const dataToSave = {
            ...rest,
            userId: user.uid,
            acquisitionDate: Timestamp.fromDate(acquisitionDate),
            createdAt: asset?.createdAt || Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        if (asset) {
            const assetRef = doc(firestore, `users/${user.uid}/assets`, asset.id);
            updateDoc(assetRef, dataToSave).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: assetRef.path,
                    operation: 'update',
                    requestResourceData: dataToSave,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            toast({
                title: 'Asset Updated',
                description: `${values.name} has been updated.`,
            });
        } else {
            const assetsCollection = collection(firestore, `users/${user.uid}/assets`);
            addDoc(assetsCollection, dataToSave).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: assetsCollection.path,
                    operation: 'create',
                    requestResourceData: dataToSave,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            toast({
                title: 'Asset Added',
                description: `${values.name} has been added.`,
            });
        }
        onSuccess();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apple Inc. Shares" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an asset type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ASSET_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Value ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="acquisitionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Acquisition Date</FormLabel>
              <FormControl>
                <DatePicker 
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Purchased after 2023 stock split"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (asset ? "Save Changes" : "Add Asset")}
        </Button>
      </form>
    </Form>
  );
}
