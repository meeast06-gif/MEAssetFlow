'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
import { Card, CardContent } from '@/components/ui/card';

type ConsumableItem = PEMConsumable | MMConsumable | DesignLabConsumable;

export default function AiForecastCell({ item }: { item: ConsumableItem }) {
    const params = useParams();
    const slug = params.slug as string;
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [forecast, setForecast] = useState<string | null>(null);
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

        setIsLoading(true);
        
        let prompt = `T=${item.quantity || 0}, S=${students}, C=${classes}, U=${usage}`;
        if (item.date_ordered) {
            prompt += `, order date was ${item.date_ordered}`;
        }

        try {
            const result = await getAiOrganizerAction(prompt, slug, item.item_name, item.units);
            if (result.action === 'none') {
                setForecast(result.reasoning);
                setOpen(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Forecast Error',
                    description: "The AI couldn't generate a forecast from the details provided.",
                });
                setForecast(null);
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Forecast Error',
                description: 'An unexpected error occurred.',
            });
            setForecast(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="text-center w-full max-w-xs mx-auto">
            {forecast ? (
                 <Card className="bg-muted/50 text-left text-xs">
                    <CardContent className="p-3">
                        <p>{forecast}</p>
                    </CardContent>
                </Card>
            ) : (
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
            )}
        </div>
    );
}
