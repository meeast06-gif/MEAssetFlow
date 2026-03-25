'use client';

import { useMemo, useState } from 'react';
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
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { InventoryAsset } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { getModuleNameFromSlug } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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
    "remarks"
];

// Mapping from table header to Firestore field name
const headerToFieldMap: Record<string, keyof InventoryAsset | null> = {
    "Order": null, // Special case for running number
    "agency": "agency",
    "ams_asset_id": "ams_asset_id",
    "asset_category": "asset_category",
    "asset_description": "asset_description",
    "asset_group": "asset_group",
    "end_user": "end_user",
    "asset_useful_lifespan (month)": "asset_useful_lifespan__month_",
    "remaining_lifespan": "remaining_lifespan",
    "depreciation_amount": "depreciation_amount",
    "net_book_value": "net_book_value",
    "in_service_date": "in_service_date",
    "status": "status",
    "remarks": "remarks",
};


export default function InventoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const firestore = useFirestore();
  const [filter, setFilter] = useState('');

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    // The collection name in Firestore is the slug itself.
    return collection(firestore, `modules/${slug}/inventory_list`);
  }, [firestore, slug]);

  const { data: rawInventoryAssets, isLoading } = useCollection<any>(inventoryQuery);

  const inventoryAssets: InventoryAsset[] | null = useMemo(() => {
    if (!rawInventoryAssets) {
      return null;
    }

    const formattedAssets = rawInventoryAssets.map((asset) => {
      const newAsset: { [key: string]: any } = { ...asset };
      if (asset.in_service_date && asset.in_service_date.toDate) {
        newAsset.in_service_date = format(asset.in_service_date.toDate(), "P");
      } else if (typeof asset.in_service_date !== 'string') {
        newAsset.in_service_date = '';
      }
      return newAsset as InventoryAsset;
    });

    if (!filter) {
        return formattedAssets;
    }

    const lowercasedFilter = filter.toLowerCase();

    return formattedAssets.filter(asset => {
        return (
            asset.ams_asset_id?.toLowerCase().includes(lowercasedFilter) ||
            asset.asset_category?.toLowerCase().includes(lowercasedFilter) ||
            asset.asset_description?.toLowerCase().includes(lowercasedFilter) ||
            asset.end_user?.toLowerCase().includes(lowercasedFilter) ||
            asset.net_book_value?.toLowerCase().includes(lowercasedFilter)
        );
    });
  }, [rawInventoryAssets, filter]);

  const moduleName = useMemo(() => {
    if (!slug) return "Inventory";
    const baseName = getModuleNameFromSlug(slug);
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
                <div className="mb-4">
                    <Input
                        placeholder="Filter by ID, category, description, end user, or value..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-md"
                    />
                </div>
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
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {tableHeaders.map(header => (
                                            <TableCell key={header}><Skeleton className="h-5 w-full" /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : inventoryAssets && inventoryAssets.length > 0 ? (
                                inventoryAssets.map((asset, index) => (
                                    <TableRow key={asset.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        {tableHeaders.slice(1).map(header => {
                                            const fieldKey = headerToFieldMap[header];
                                            const value = fieldKey ? asset[fieldKey] : '';
                                            return <TableCell key={header}>{value ?? ''}</TableCell>;
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={tableHeaders.length} className="h-24 text-center">
                                        {rawInventoryAssets && rawInventoryAssets.length > 0
                                            ? 'No assets match your filter.'
                                            : 'No inventory data available.'}
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
