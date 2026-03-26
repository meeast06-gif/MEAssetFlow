'use client';

import PageHeader from "@/components/module/page-header";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { getModuleNameFromSlug } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSmartDisplayData } from "@/hooks/use-smart-display-data";
import type { InventoryAsset } from "@/lib/definitions";

const tableHeaders = [
    "Module",
    "ams_asset_id",
    "asset_description",
    "end_user",
    "custodian",
    "net_book_value",
    "status",
];

const headerToFieldMap: Record<string, keyof InventoryAsset> = {
    "Module": "module",
    "ams_asset_id": "ams_asset_id",
    "asset_description": "asset_description",
    "end_user": "end_user",
    "custodian": "custodian",
    "net_book_value": "net_book_value",
    "status": "status",
};

export default function SmartDisplayPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { assets } = useSmartDisplayData();

    const moduleName = useMemo(() => {
        if (!slug) return "Smart Display";
        const baseName = getModuleNameFromSlug(slug);
        return `${baseName} - Smart Display`;
    }, [slug]);

    if (assets.length === 0) {
        return (
            <div className="flex min-h-screen w-full flex-col">
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PageHeader moduleName={moduleName} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Smart Display</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="flex h-48 items-center justify-center">
                                <p className="text-muted-foreground">No data to display. Try a prompt like: "Show all assets with a net value of 0".</p>
                           </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader moduleName={moduleName} />
                <Card>
                    <CardHeader>
                        <CardTitle>Smart Display Results</CardTitle>
                        <CardDescription>
                            Showing {assets.length} asset(s) from your query. This view is temporary and will reset upon navigation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="w-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {tableHeaders.map(header => (
                                            <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            {tableHeaders.map(header => {
                                                const fieldKey = headerToFieldMap[header];
                                                const value = fieldKey ? asset[fieldKey as keyof InventoryAsset] : '';
                                                return <TableCell key={header}>{value ?? ''}</TableCell>;
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
