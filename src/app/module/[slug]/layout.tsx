'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useUser } from '@/firebase';
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
import { LayoutDashboard, Archive, ClipboardCheck, Wrench, ChevronsLeft, ChevronsRight, LayoutGrid, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from '@/components/ui/separator';


function ModuleSidebar({ slug }: { slug: string }) {
    const pathname = usePathname();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');

    const handleAiSubmit = async () => {
        // Placeholder for AI logic
        setIsLoading(true);
        setResponse('');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI response time
        setResponse(`This is a simulated response to your prompt: "${prompt}"`);
        setIsLoading(false);
    };

    const menuItems = [
        { href: `/module/${slug}`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/module/${slug}/inventory`, label: 'Inventory', icon: Archive },
        { href: `/module/${slug}/inspection`, label: 'Inspection', icon: ClipboardCheck },
        { href: `/module/${slug}/servicing`, label: 'Servicing', icon: Wrench },
    ];

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
                        placeholder="e.g., 'List assets needing inspection...'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[80px]"
                        disabled={isLoading}
                    />
                    <Button onClick={handleAiSubmit} disabled={isLoading || !prompt} size="sm">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                    <div className="mt-2">
                        <label className="text-xs text-muted-foreground px-2">AI Response</label>
                        <div className="p-2 mt-1 border rounded-md min-h-[80px] bg-muted/50 text-sm">
                            {isLoading ? (
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
