'use client';

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

function AppContainer({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <div 
        className="flex flex-col sm:gap-4 sm:py-4 transition-all duration-300"
        data-sidebar-state={state}
    >
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
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 data-[sidebar-state=expanded]:sm:pl-56 transition-all duration-300">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
