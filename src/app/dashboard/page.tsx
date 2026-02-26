"use client";

import { useMemo } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection, useFirestore } from "@/firebase";
import type { Asset } from "@/lib/definitions";
import PageHeader from "@/components/dashboard/page-header";
import SummaryCards from "@/components/dashboard/summary-cards";
import AssetTable from "@/components/dashboard/asset-table";
import AiSummary from "@/components/dashboard/ai-summary";
import Loading from "./loading";


export default function DashboardPage() {
  const firestore = useFirestore();

  const assetsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'assets'), orderBy('acquisitionDate', 'desc'));
  }, [firestore]);

  const { data: assets, loading } = useCollection<Asset>(assetsQuery, {
    snapshotListenOptions: { includeMetadataChanges: true },
    idField: 'id',
    transform: (data: any) => ({
      ...data,
      acquisitionDate: data.acquisitionDate?.toDate ? data.acquisitionDate.toDate().toISOString() : new Date().toISOString(),
    })
  });

  if (loading) {
    return <Loading />;
  }
  
  const validAssets = assets || [];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 grid auto-rows-min gap-4 md:gap-8">
            <SummaryCards assets={validAssets} />
            <AssetTable assets={validAssets} />
          </div>
          <div className="lg:col-span-1">
            <AiSummary assets={validAssets} />
          </div>
        </div>
      </main>
    </div>
  );
}
