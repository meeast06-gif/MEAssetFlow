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
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { PEMConsumable } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';


const tableHeaders = [
    "SN",
    "Order_Number",
    "Item_Name",
    "Quantity",
    "Date_Ordered",
    "Date_Received",
    "AI_Forecast",
];

const headerToFieldMap: Record<string, keyof PEMConsumable> = {
    "SN": "sn",
    "Order_Number": "order_number",
    "Item_Name": "item_name",
    "Quantity": "quantity",
    "Date_Ordered": "date_ordered",
    "Date_Received": "date_received",
    "AI_Forecast": "ai_forecast",
};

export default function PemConsumablePage() {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();

    const pemConsumableQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // This path is derived from the user's screenshot breadcrumb:
        // modules (collection) -> pem_consumable (document) -> inventory_list (collection)
        return collection(firestore, `modules/pem_consumable/inventory_list`);
    }, [firestore]);

    const { data: pemConsumables, isLoading } = useCollection<PEMConsumable>(pemConsumableQuery);

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
                        <CardTitle>PEM Consumable Inventory</CardTitle>
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
                                    {isLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                {tableHeaders.map(header => (
                                                    <TableCell key={header} className="text-center">
                                                        <Skeleton className="h-5 w-3/4 mx-auto" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : pemConsumables && pemConsumables.length > 0 ? (
                                        pemConsumables.map((item) => (
                                            <TableRow key={item.id}>
                                                {tableHeaders.map(header => {
                                                    const fieldKey = headerToFieldMap[header];
                                                    const value = fieldKey ? item[fieldKey] : '';
                                                    return <TableCell key={header} className="text-center">{value ?? ''}</TableCell>;
                                                })}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={tableHeaders.length} className="h-24 text-center">
                                                No consumable items have been added yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
