import { getAssets } from "@/lib/actions";
import PageHeader from "@/components/dashboard/page-header";
import SummaryCards from "@/components/dashboard/summary-cards";
import AssetTable from "@/components/dashboard/asset-table";
import AiSummary from "@/components/dashboard/ai-summary";

export default async function Home() {
  const assets = await getAssets();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 grid auto-rows-min gap-4 md:gap-8">
            <SummaryCards assets={assets} />
            <AssetTable assets={assets} />
          </div>
          <div className="lg:col-span-1">
            <AiSummary assets={assets} />
          </div>
        </div>
      </main>
    </div>
  );
}
