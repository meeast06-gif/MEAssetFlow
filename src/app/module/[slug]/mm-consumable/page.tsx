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
import type { MMConsumable } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { formatInTimeZone } from 'date-fns-tz';

const tableHeaders = [
    "SN",
    "Order_Number",
    "Item_Name",
    "Quantity",
    "Date_Ordered",
    "Date_Received",
    "Next_Order",
];

const headerToFieldMap: Record<string, keyof MMConsumable> = {
    "SN": "sn",
    "Order_Number": "order_number",
    "Item_Name": "item_name",
    "Quantity": "quantity",
    "Date_Ordered": "date_ordered",
    "Date_Received": "date_received",
    "Next_Order": "next_order",
};

const dateColumns = ["Date_Ordered", "Date_Received", "Next_Order"];

export default function MMConsumablePage() {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();

    const mmConsumableQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, `modules/mm_consumable/inventory_list`);
    }, [firestore]);

    const { data: mmConsumables, isLoading } = useCollection<MMConsumable>(mmConsumableQuery);

    const moduleName = useMemo(() => {
        if (!slug) return "MM Consumable";
        const baseName = getModuleNameFromSlug(slug);
        return `${baseName} - MM Consumable`;
    }, [slug]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return formatInTimeZone(date, 'Asia/Singapore', 'd MMM yyyy');
        } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return dateString;
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader moduleName={moduleName} />
                <Card>
                    <CardHeader>
                        <CardTitle>MM Consumable Inventory</CardTitle>
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
                                        <TableHead className="whitespace-nowrap text-center border-l-2 border-border">AI Forecast</TableHead>
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
                                                <TableCell className="text-center border-l-2 border-border">
                                                    <Skeleton className="h-5 w-3/4 mx-auto" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : mmConsumables && mmConsumables.length > 0 ? (
                                        mmConsumables.map((item) => (
                                            <TableRow key={item.id}>
                                                {tableHeaders.map(header => {
                                                    const fieldKey = headerToFieldMap[header];
                                                    let value = fieldKey ? item[fieldKey as keyof MMConsumable] : '';
                                                    if (dateColumns.includes(header) && typeof value === 'string' && value) {
                                                        value = formatDate(value);
                                                    }
                                                    return <TableCell key={header} className="text-center">{value ?? ''}</TableCell>;
                                                })}
                                                <TableCell className="text-center border-l-2 border-border"></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={tableHeaders.length + 1} className="h-24 text-center">
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
