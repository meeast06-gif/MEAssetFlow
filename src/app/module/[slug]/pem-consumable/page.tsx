'use client';

import PageHeader from "@/components/module/page-header";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getModuleNameFromSlug } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PemConsumablePage() {
    const params = useParams();
    const slug = params.slug as string;

    const moduleName = useMemo(() => {
        if (!slug) return "PEM Consumable";
        const baseName = getModuleNameFromSlug(slug);
        return `${baseName} - PEM Consumable`;
    }, [slug]);

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader moduleName={moduleName} />
                <Card>
                    <CardHeader>
                        <CardTitle>PEM Consumable</CardTitle>
                        <CardDescription>
                            This page is under construction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                            Future content will be displayed here.
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
