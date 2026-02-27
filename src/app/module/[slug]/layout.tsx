'use client';

import React, { useEffect, useMemo } from 'react';
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
import { LayoutDashboard, Archive, ClipboardCheck, Wrench, ChevronsLeft, ChevronsRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ModuleSidebar({ slug }: { slug: string }) {
    const pathname = usePathname();
    const { state } = useSidebar();

    const menuItems = [
        { href: `/module/${slug}`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/module/${slug}/inventory`, label: 'Inventory', icon: Archive },
        { href: '#', label: 'Inspection', icon: ClipboardCheck },
        { href: '#', label: 'Servicing', icon: Wrench },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="p-0">
                 <div className="flex h-12 items-center justify-between p-2">
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
