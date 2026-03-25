'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from "@/components/module/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getModuleNameFromSlug } from '@/lib/utils';

export default function MMConsumablePage() {
    const params = useParams();
    const slug = params.slug as string;

    const moduleName = useMemo(() => {
        if (!slug) return "MM Consumable";
        const baseName = getModuleNameFromSlug(slug);
        return `${baseName} - MM Consumable`;
    }, [slug]);

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader moduleName={moduleName} />
                <Card>
                    <CardHeader>
                        <CardTitle>MM Consumable</CardTitle>
                        <CardDescription>
                            This page is under construction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-48 items-center justify-center">
                            <p className="text-muted-foreground">Content for MM Consumable will be added here.</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
