"use client";

import { useMemo } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { Asset } from "@/lib/definitions";
import PageHeader from "@/components/module/page-header";
import SummaryCards from "@/components/module/summary-cards";
import AssetTable from "@/components/module/asset-table";
import AiSummary from "@/components/module/ai-summary";
import Loading from "./loading";


export default function ModuleDashboardPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const assetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/assets`), orderBy('acquisitionDate', 'desc'));
  }, [firestore, user]);

  const { data: rawAssets, loading } = useCollection<any>(assetsQuery);

  const assets: Asset[] | null = useMemo(() => {
    if (!rawAssets) {
      return null;
    }
    return rawAssets.map((asset) => ({
      ...asset,
      acquisitionDate: asset.acquisitionDate?.toDate ? asset.acquisitionDate.toDate().toISOString() : new Date().toISOString(),
    }));
  }, [rawAssets]);


  if (loading || !user) {
    return <Loading />;
  }
  
  const validAssets = assets || [];
  
  const moduleName = useMemo(() => {
    return params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }, [params.slug]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader moduleName={moduleName} />
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
