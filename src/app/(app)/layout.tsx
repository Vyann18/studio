'use client';

import React from 'react';
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser();
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = React.useState(true);

  React.useEffect(() => {
    // On the client, once we know the user state, we can stop checking.
    // If there's no user, redirect.
    if (currentUser === null) {
      router.replace('/login');
    } else {
      setIsCheckingUser(false);
    }
  }, [currentUser, router]);
  
  // This structure will be rendered on both server and client, avoiding a mismatch.
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-56">
          <AppHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {isCheckingUser ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
