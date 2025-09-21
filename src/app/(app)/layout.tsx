'use client';

import React from 'react';
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CompanyIdGate } from '@/components/company-id-gate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, companyIdVerified } = useUser();
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = React.useState(true);

  React.useEffect(() => {
    if (currentUser === undefined) {
      // Still loading user state
      return;
    }
    if (currentUser === null) {
      router.replace('/login');
    } else {
      setIsCheckingUser(false);
    }
  }, [currentUser, router]);

  if (isCheckingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser) {
    // This will be briefly shown before the redirect effect runs
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!companyIdVerified) {
    return <CompanyIdGate />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-56">
        <AppHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}

    