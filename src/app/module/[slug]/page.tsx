"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import PageHeader from "@/components/module/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sigma, UserPlus, ArchiveRestore, CircleOff, Wrench, ClipboardCheck, DollarSign, Book } from "lucide-react";
import Loading from "./loading";
import { getModuleNameFromSlug, formatCurrency } from "@/lib/utils";

const dashboardItems = [
  { title: "Total Asset", icon: Sigma, description: "Total assets registered", key: "total" },
  { title: "Assign", icon: UserPlus, description: "Assets currently assigned", key: "assign" },
  { title: "Decom", icon: ArchiveRestore, description: "Assets decommissioned", key: "decom" },
  { title: "Dispose", icon: CircleOff, description: "Assets disposed of", key: "dispose" },
  { title: "Total Asset value", icon: DollarSign, description: "Total value of all assets", key: "totalAssetValue" },
  { title: "Net book Value", icon: Book, description: "Total net book value", key: "netBookValue" },
  { title: "Inspection", icon: ClipboardCheck, description: "Assets due for inspection", key: "inspection" },
  { title: "Servicing", icon: Wrench, description: "Assets requiring servicing", key: "servicing" },
];

export default function ModuleDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return collection(firestore, `modules/${slug}/inventory_list`);
  }, [firestore, slug]);

  const { data: inventoryAssets, isLoading: inventoryLoading } = useCollection(inventoryQuery);

  const dashboardValues = useMemo(() => ({
    total: inventoryAssets?.length || 0,
    assign: 0,
    decom: 0,
    dispose: 0,
    totalAssetValue: 0,
    netBookValue: 0,
    inspection: 0,
    servicing: 0,
  }), [inventoryAssets]);

  const moduleName = useMemo(() => {
    if (!slug) return "";
    return getModuleNameFromSlug(slug);
  }, [slug]);

  const isLoading = userLoading || inventoryLoading;

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader moduleName={moduleName} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboardItems.map((item) => {
            const value = dashboardValues[item.key as keyof typeof dashboardValues];
            
            return (
              <Card key={item.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {item.key === 'totalAssetValue' ? formatCurrency(value) : value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
