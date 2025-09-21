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
  Package,
  Settings,
  Building,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/user-context';

const allMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
    { href: '/sales', label: 'Sales', icon: Receipt, roles: ['admin', 'manager', 'user', 'employee'] },
    { href: '/inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'manager', 'employee', 'user'] },
    { href: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['admin', 'manager', 'user', 'employee'] },
    { href: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'user', 'employee'] },
    { href: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager', 'user', 'employee'] },
    { href: '/finance', label: 'Finance', icon: Receipt, roles: ['admin'] },
    { href: '/reports', label: 'Reports', icon: Receipt, roles: ['admin', 'manager'] },
    { href: '/restock-alerts', label: 'Restock Alerts', icon: Boxes, roles: ['admin', 'manager'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser } = useUser();

  if (!currentUser) {
    return null; // Or a loading skeleton
  }

  const menuItems = allMenuItems.filter(item => {
    return item.roles.includes(currentUser.role)
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">InventoryFlow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
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
                <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')}>
                    <Link href="/settings">
                        <Users />
                        <span>User Management</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
