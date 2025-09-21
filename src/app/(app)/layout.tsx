'use client';

import React from 'react';
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (currentUser === null) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    // You can return a loading spinner here
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 data-[sidebar-state=expanded]:sm:pl-56 transition-all duration-300">
          <AppHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
