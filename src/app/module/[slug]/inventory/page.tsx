'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from "@/components/module/page-header";

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
        {/* Page is blank as requested */}
      </main>
    </div>
  );
}
