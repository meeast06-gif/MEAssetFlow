'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import Loading from './loading';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Archive, ClipboardCheck, Wrench, ChevronsLeft, ChevronsRight, LayoutGrid, Sparkles, Loader2, ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from '@/components/ui/separator';
import { getAiOrganizerAction } from '@/lib/actions';
import { findAsset, moveAsset, deleteAsset } from '@/lib/inventory-actions';
import { getModuleNameFromSlug } from '@/lib/utils';


function ModuleSidebar({ slug }: { slug: string }) {
    const pathname = usePathname();
    const firestore = useFirestore();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');

    const handleAiSubmit = async () => {
        if (!prompt || !firestore) return;

        setIsLoading(true);
        setResponse('');

        try {
            const result = await getAiOrganizerAction(prompt, slug);

            if (result.action === 'move') {
                setResponse(`Understood. Searching for the asset(s) to move...`);
                
                const assetsToMove = await findAsset(firestore, result.sourceModuleSlug, result.assetIdentifier);

                if (assetsToMove.length === 0) {
                    setResponse(`Could not find any matching assets to move. Please check the identifiers provided.`);
                } else {
                    const sourceModuleName = getModuleNameFromSlug(result.sourceModuleSlug);
                    const destModuleName = getModuleNameFromSlug(result.destinationModuleSlug);
                    const assetIds = assetsToMove.map(a => a.ams_asset_id || a.id).join(', ');

                    setResponse(`Found ${assetsToMove.length} asset(s): [${assetIds}]. Moving from ${sourceModuleName} to ${destModuleName}...`);
                    
                    const moveResult = await moveAsset(firestore, result.sourceModuleSlug, result.destinationModuleSlug, assetsToMove);

                    if (moveResult.success) {
                        setResponse(`Successfully moved ${assetsToMove.length} asset(s) to ${destModuleName}.`);
                    } else {
                        setResponse(`Failed to move asset(s). Error: ${moveResult.error}`);
                    }
                }

            } else if (result.action === 'delete') {
                setResponse(`Understood. Searching for the asset to delete...`);

                const assetsToDelete = await findAsset(firestore, result.sourceModuleSlug, result.assetIdentifier);

                if (assetsToDelete.length === 0) {
                    setResponse(`Could not find a matching asset to delete. Please be more specific with the asset ID, description, or end user.`);
                } else if (assetsToDelete.length > 1) {
                    setResponse(`Found multiple matching assets. Please provide a more specific identifier (like the 'ams_asset_id').`);
                } else {
                    const asset = assetsToDelete[0];
                    const sourceModuleName = getModuleNameFromSlug(result.sourceModuleSlug);

                    setResponse(`Found asset "${asset.asset_description || asset.ams_asset_id}". Deleting it from ${sourceModuleName}...`);

                    const deleteResult = await deleteAsset(firestore, result.sourceModuleSlug, asset.id);

                    if (deleteResult.success) {
                        setResponse(`Successfully deleted asset "${asset.asset_description || asset.ams_asset_id}" from ${sourceModuleName}.`);
                    } else {
                        setResponse(`Failed to delete asset. Error: ${deleteResult.error}`);
                    }
                }
            } else { // action === 'none'
                setResponse(result.reasoning);
            }

        } catch (error) {
            console.error("AI Organizer error:", error);
            setResponse("Sorry, an unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleAiSubmit();
      }
    };

    const menuItems = React.useMemo(() => {
        const items = [
            { href: `/module/${slug}`, label: 'Dashboard', icon: LayoutDashboard },
            { href: `/module/${slug}/inventory`, label: 'Inventory', icon: Archive },
            { href: `/module/${slug}/inspection`, label: 'Inspection', icon: ClipboardCheck },
            { href: `/module/${slug}/servicing`, label: 'Servicing', icon: Wrench },
        ];

        if (slug === 'plant_maintenance_t02_11') {
            items.push({ href: `/module/${slug}/pem-consumable`, label: 'PEM Consumable', icon: ShoppingBasket });
        }

        return items;
    }, [slug]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="p-0">
                 <div className="flex h-12 items-center justify-between group-data-[collapsible=icon]:justify-center p-2">
                    <h2 className="text-lg font-semibold px-2 group-data-[collapsible=icon]:hidden truncate">
                        <span className="bg-gradient-to-r from-orange-300 via-red-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm brightness-110 saturate-125">
                            ME Asset Flow
                        </span>
                    </h2>
                    <SidebarTrigger>
                         <ChevronsRight className="group-data-[state=expanded]:hidden" />
                         <ChevronsLeft className="group-data-[state=collapsed]:hidden" />
                    </SidebarTrigger>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href}
                                tooltip={{children: item.label}}
                            >
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex flex-col gap-y-2 p-2 group-data-[collapsible=icon]:hidden">
                     <Separator className="my-2" />
                     <label className="text-sm font-semibold px-2">AI Organizer</label>
                     <Textarea
                        placeholder="e.g., 'Move asset [ID] to [Module]'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[80px]"
                        disabled={isLoading}
                    />
                    <Button onClick={handleAiSubmit} disabled={isLoading || !prompt} size="sm">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Launch
                    </Button>
                    <div className="mt-2">
                        <label className="text-xs text-muted-foreground px-2">AI Response</label>
                        <div className="p-2 mt-1 border rounded-md min-h-[80px] bg-muted/50 text-sm">
                            {isLoading && !response ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            ) : response ? (
                                <p>{response}</p>
                            ) : (
                                <p className="text-muted-foreground">The AI's response will appear here.</p>
                            )}
                        </div>
                    </div>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={{children: "Module Selection"}}
                        >
                            <Link href="/modules">
                                <LayoutGrid />
                                <span>Module Selection</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}


export default function ModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
        <ModuleSidebar slug={slug} />
        <SidebarInset>
            {children}
        </SidebarInset>
    </SidebarProvider>
  );
}
