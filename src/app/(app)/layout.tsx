'use client';

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

function AppContainer({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 data-[sidebar-state=expanded]:sm:pl-56 data-[sidebar-state=collapsed]:sm:pl-14 transition-all duration-300">
        <AppHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
    </div>
  )
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <AppContainer>
          {children}
        </AppContainer>
      </div>
    </SidebarProvider>
  );
}
