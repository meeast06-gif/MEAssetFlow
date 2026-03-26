'use client';

import PageHeader from "@/components/module/page-header";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getModuleNameFromSlug } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SmartDisplayPage() {
    const params = useParams();
    const slug = params.slug as string;

    const moduleName = useMemo(() => {
        if (!slug) return "Smart Display";
        const baseName = getModuleNameFromSlug(slug);
        return `${baseName} - Smart Display`;
    }, [slug]);

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader moduleName={moduleName} />
                <Card>
                    <CardHeader>
                        <CardTitle>Smart Display</CardTitle>
                        <CardDescription>
                            This page is under construction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex h-48 items-center justify-center">
                            <p className="text-muted-foreground">Future functionality will be implemented here.</p>
                       </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
