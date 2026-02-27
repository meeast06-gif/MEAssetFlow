'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from "@/components/module/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tableHeaders = [
    "Order",
    "agency",
    "ams_asset_id",
    "asset_category",
    "asset_description",
    "asset_group",
    "end_user",
    "asset_useful_lifespan (month)",
    "remaining_lifespan",
    "depreciation_amount",
    "net_book_value",
    "in_service_date",
    "status",
    "sensor_mac",
    "sensor_pin",
    "remarks"
];


export default function InventoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const moduleName = useMemo(() => {
    if (!slug) return "Inventory";
    const baseName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `${baseName} - Inventory`;
  }, [slug]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader moduleName={moduleName} />
        <Card>
            <CardHeader>
                <CardTitle>Inventory List</CardTitle>
                <CardDescription>A complete list of all assets in the inventory.</CardDescription>
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
                            <TableRow>
                                <TableCell colSpan={tableHeaders.length} className="h-24 text-center">
                                    No inventory data available.
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
