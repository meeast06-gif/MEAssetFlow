'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from "@/components/module/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { getModuleNameFromSlug } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function AiOrganizerPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');

    const moduleName = useMemo(() => {
        if (!slug) return "AI Organizer";
        const baseName = getModuleNameFromSlug(slug);
        return `${baseName} - AI Organizer`;
    }, [slug]);

    const handleSubmit = async () => {
        // Placeholder for AI logic
        setIsLoading(true);
        setResponse('');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI response time
        setResponse(`This is a simulated response to your prompt: "${prompt}"`);
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader moduleName={moduleName} />
                <Card>
                    <CardHeader>
                        <CardTitle>AI Organizer</CardTitle>
                        <CardDescription>Enter a prompt to have the AI assist you with organizing your assets or generating reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Textarea
                            placeholder="e.g., 'List all assets that need servicing in the next 30 days' or 'Generate a summary of decommissioned machinery.'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="min-h-[120px]"
                            disabled={isLoading}
                        />
                         <Button onClick={handleSubmit} disabled={isLoading || !prompt}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                            Generate Response
                        </Button>
                    </CardContent>
                    <CardFooter>
                       <div className="w-full">
                            <h3 className="text-lg font-semibold mb-2">AI Response</h3>
                            <div className="p-4 border rounded-md min-h-[100px] bg-muted/50">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                ) : response ? (
                                    <p className="text-sm">{response}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">The AI's response will appear here.</p>
                                )}
                            </div>
                       </div>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
