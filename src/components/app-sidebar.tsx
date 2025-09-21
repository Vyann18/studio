'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Boxes,
  FileText,
  Bell,
  Settings,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import type { Role } from '@/lib/types';

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { href: '/inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'manager', 'employee'] },
  { href: '/reports', label: 'Reports', icon: FileText, roles: ['admin', 'manager'] },
  { href: '/restock-alerts', label: 'Restock Alerts', icon: Bell, roles: ['admin', 'manager'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser } = useUser();

  const menuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16">
        <Link href="/dashboard" className="flex items-center gap-2 p-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">InventoryFlow</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label }}
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
             <SidebarMenuButton asChild tooltip={{children: "Settings"}}>
                <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                </Link>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
