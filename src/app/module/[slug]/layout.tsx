'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  useSidebar
} from "@/components/ui/sidebar";
import { LayoutDashboard, Archive, ClipboardCheck, Wrench, ChevronsLeft, ChevronsRight, LayoutGrid, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";


function ModuleSidebar({ slug }: { slug: string }) {
    const pathname = usePathname();
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
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
                    <SidebarMenuItem>
                        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                            <DialogTrigger asChild>
                                <SidebarMenuButton tooltip={{children: "AI Organizer"}}>
                                    <Sparkles />
                                    <span>AI Organizer</span>
                                </SidebarMenuButton>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>AI Organizer</DialogTitle>
                                    <DialogDescription>
                                        Enter a prompt to have the AI assist you with organizing your assets or generating reports.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Textarea
                                        placeholder="e.g., 'List all assets that need servicing in the next 30 days' or 'Generate a summary of decommissioned machinery.'"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="min-h-[120px]"
                                        disabled={isLoading}
                                    />
                                    <Button onClick={handleAiSubmit} disabled={isLoading || !prompt}>
                                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                                        Generate Response
                                    </Button>
                                </div>
                                <div className="w-full">
                                    <h3 className="text-lg font-semibold mb-2">AI Response</h3>
                                    <div className="p-4 border rounded-md min-h-[100px] bg-muted/50">
                                        {isLoading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        ) : response ? (
                                            <p className="text-sm">{response}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">The AI's response will appear here.</p>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
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
