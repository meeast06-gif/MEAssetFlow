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
import { format } from 'date-fns';


const tableHeaders = [
    "SN",
    "Order_Number",
    "Item_Name",
    "Quantity",
    "Unit",
    "Weeks",
    "Frequency_Per_Week",
    "Total_Students",
    "Date_Ordered",
    "Date_Received",
    "AI_Forecast",
];

const headerToFieldMap: Record<string, keyof PEMConsumable | null> = {
    "SN": null,
    "Order_Number": "orderNumber",
    "Item_Name": "itemName",
    "Quantity": "quantity",
    "Unit": "unit",
    "Weeks": "weeks",
    "Frequency_Per_Week": "frequencyPerWeek",
    "Total_Students": "totalStudents",
    "Date_Ordered": "dateOrdered",
    "Date_Received": "dateReceived",
    "AI_Forecast": "aiForecast",
};

export default function PemConsumablePage() {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();

    const pemConsumableQuery = useMemoFirebase(() => {
        if (!firestore || !slug) return null;
        return collection(firestore, `modules/${slug}/pem_consumable`);
    }, [firestore, slug]);

    const { data: rawConsumables, isLoading } = useCollection<any>(pemConsumableQuery);

    const pemConsumables: PEMConsumable[] | null = useMemo(() => {
        if (!rawConsumables) {
            return null;
        }
        return rawConsumables.map((item) => {
            const newItem: { [key: string]: any } = { ...item };
            if (item.dateOrdered && item.dateOrdered.toDate) {
                newItem.dateOrdered = format(item.dateOrdered.toDate(), "P");
            }
            if (item.dateReceived && item.dateReceived.toDate) {
                newItem.dateReceived = format(item.dateReceived.toDate(), "P");
            }
            return newItem as PEMConsumable;
        });
    }, [rawConsumables]);


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
                                            <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                {tableHeaders.map(header => (
                                                    <TableCell key={header}><Skeleton className="h-5 w-full" /></TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : pemConsumables && pemConsumables.length > 0 ? (
                                        pemConsumables.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                {tableHeaders.slice(1).map(header => {
                                                    const fieldKey = headerToFieldMap[header];
                                                    const value = fieldKey ? item[fieldKey] : '';
                                                    return <TableCell key={header}>{value ?? ''}</TableCell>;
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
