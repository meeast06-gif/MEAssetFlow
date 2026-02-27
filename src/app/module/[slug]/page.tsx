"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/firebase";
import PageHeader from "@/components/module/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Truck, ArchiveRestore, CircleOff, Wrench, ClipboardCheck } from "lucide-react";
import Loading from "./loading";

const dashboardItems = [
  { title: "Total Asset", icon: DollarSign, description: "Total assets registered" },
  { title: "Assign", icon: Truck, description: "Assets currently assigned" },
  { title: "Decom", icon: ArchiveRestore, description: "Assets decommissioned" },
  { title: "Dispose", icon: CircleOff, description: "Assets disposed of" },
  { title: "Inspection", icon: ClipboardCheck, description: "Assets due for inspection" },
  { title: "Servicing", icon: Wrench, description: "Assets requiring servicing" },
];

export default function ModuleDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, loading } = useUser();

  const moduleName = useMemo(() => {
    if (!slug) return "";
    return slug.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }, [slug]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader moduleName={moduleName} />
        <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {dashboardItems.map((item) => (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
