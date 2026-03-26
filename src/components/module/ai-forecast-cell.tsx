'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { getAiOrganizerAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { PEMConsumable, MMConsumable, DesignLabConsumable } from '@/lib/definitions';
import { setAiResponse } from '@/hooks/use-ai-response';

type ConsumableItem = PEMConsumable | MMConsumable | DesignLabConsumable;

export default function AiForecastCell({ item }: { item: ConsumableItem }) {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState('');
    const [classes, setClasses] = useState('');
    const [usage, setUsage] = useState('');
    const { toast } = useToast();

    const handleForecast = async () => {
        if (!students || !classes || !usage) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill in all fields to generate a forecast.',
            });
            return;
        }

        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Database Error',
                description: 'Could not connect to the database.',
            });
            return;
        }

        setIsLoading(true);
        
        let prompt = `T=${item.quantity || 0}, S=${students}, C=${classes}, U=${usage}`;
        if (item.date_ordered) {
            prompt += `, order date was ${item.date_ordered}`;
        }

        try {
            const result = await getAiOrganizerAction(prompt, slug, item.item_name, item.units);

            if (result.action === 'none') {
                setAiResponse(result.reasoning); // Set response in sidebar
                
                if (result.nextOrderDate && result.nextOrderDate.trim() !== '') {
                    let collectionPath = '';
                    if (slug === 'plant_maintenance_t02_11') {
                        collectionPath = 'modules/pem_consumable/inventory_list';
                    } else if (slug === 'machinery_maintenance_t02_13') {
                        collectionPath = 'modules/mm_consumable/inventory_list';
                    } else if (slug === 'cad_cam_designlab_t01_23') {
                        collectionPath = 'modules/designlab_consumable/inventory_list';
                    }

                    if (collectionPath) {
                        const itemRef = doc(firestore, collectionPath, item.id);
                        const updateData = { next_order: result.nextOrderDate };
                        
                        // Non-blocking update
                        updateDoc(itemRef, updateData).catch(serverError => {
                            const permissionError = new FirestorePermissionError({
                                path: itemRef.path,
                                operation: 'update',
                                requestResourceData: updateData,
                            });
                            errorEmitter.emit('permission-error', permissionError);
                            toast({
                                variant: "destructive",
                                title: "Update Failed",
                                description: "Could not update the next order date due to permissions.",
                            });
                        });
                        
                        toast({
                            title: 'Forecast Complete',
                            description: 'Next order date is being updated.',
                        });
                    }
                }
                setOpen(false); // Close dialog
            } else {
                const responseText = result.reasoning || "The AI couldn't generate a forecast from the details provided.";
                setAiResponse(responseText);
                toast({
                    variant: 'destructive',
                    title: 'Forecast Error',
                    description: responseText,
                });
            }
        } catch (error) {
            console.error(error);
            const errorMessage = "An unexpected error occurred during the forecast.";
            setAiResponse(errorMessage);
            toast({
                variant: 'destructive',
                title: 'Forecast Error',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="text-center w-full max-w-xs mx-auto">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Forecast
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Forecast Consumable Usage</DialogTitle>
                        <DialogDescription>
                            For item '{item.item_name}' with a total quantity of {item.quantity} {item.units}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-1.5">
                            <Label htmlFor="students">Number of Students (S)</Label>
                            <Input id="students" type="number" value={students} onChange={(e) => setStudents(e.target.value)} placeholder="e.g. 20" />
                        </div>
                        <div className="grid items-center gap-1.5">
                            <Label htmlFor="classes">Classes per Week (C)</Label>
                            <Input id="classes" type="number" value={classes} onChange={(e) => setClasses(e.target.value)} placeholder="e.g. 2" />
                        </div>
                        <div className="grid items-center gap-1.5">
                            <Label htmlFor="usage">Usage per Student/Class (U)</Label>
                            <Input id="usage" type="text" value={usage} onChange={(e) => setUsage(e.target.value)} placeholder="e.g. 1 or 2ml" />
                        </div>
                    </div>
                     <DialogFooter>
                        <Button onClick={handleForecast} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Forecast'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
