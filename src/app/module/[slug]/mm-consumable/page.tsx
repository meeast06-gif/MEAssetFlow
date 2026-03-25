'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from "@/components/module/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getModuleNameFromSlug } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tableHeaders = [
    "SN",
    "Order_Number",
    "Item_Name",
    "Quantity",
    "Date_Ordered",
    "Date_Received",
    "Next_Order",
];


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
                            A list of all consumable items for this module.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {tableHeaders.map(header => (
                                            <TableHead key={header} className="whitespace-nowrap text-center">{header}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={tableHeaders.length} className="h-24 text-center">
                                            No consumable items have been added yet.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
