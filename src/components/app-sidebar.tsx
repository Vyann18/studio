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
  ShoppingCart,
  Receipt,
  Users,
  Building,
  Package,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/user-context';

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { href: '/sales', label: 'Sales', icon: Receipt, roles: ['admin', 'manager', 'employee'] },
  { href: '/inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'manager', 'employee'] },
  { href: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['admin', 'manager'] },
  { href: '/finance', label: 'Finance', icon: Receipt, roles: ['admin'] },
  { href: '/reports', label: 'Reports', icon: Receipt, roles: ['admin', 'manager'] },
  { href: '/restock-alerts', label: 'Restock Alerts', icon: Boxes, roles: ['admin', 'manager'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser } = useUser();

  const menuItems = allMenuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">MiniERP</h1>
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
          {currentUser.role === 'admin' && (
             <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{children: "Settings"}} isActive={pathname.startsWith('/settings')}>
                    <Link href="/settings">
                        <Settings />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
