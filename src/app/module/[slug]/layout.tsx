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
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { LayoutDashboard, Archive, ClipboardCheck, Wrench, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ModuleSidebar({ slug, moduleName }: { slug: string, moduleName: string }) {
    const pathname = usePathname();
    const { state } = useSidebar();

    const menuItems = [
        { href: `/module/${slug}`, label: 'Dashboard', icon: LayoutDashboard },
        { href: '#', label: 'Inventory', icon: Archive },
        { href: '#', label: 'Inspection', icon: ClipboardCheck },
        { href: '#', label: 'Servicing', icon: Wrench },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="p-0">
                 <div className="flex h-12 items-center justify-between p-2">
                    <h2 className="text-lg font-semibold px-2 group-data-[collapsible=icon]:hidden truncate">
                        {moduleName}
                    </h2>
                    <SidebarTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronsRight className="group-data-[state=expanded]:hidden" />
                            <ChevronsLeft className="group-data-[state=collapsed]:hidden" />
                         </Button>
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

  const moduleName = useMemo(() => {
    if (!slug) return "";
    // A simple un-slugify. This could be improved.
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').replace(/T0/g, 'T0');
  }, [slug]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
        <ModuleSidebar slug={slug} moduleName={moduleName} />
        <SidebarInset>
            {children}
        </SidebarInset>
    </SidebarProvider>
  );
}
