"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { WaveLoader } from "../ui/loader";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { loading } = useAuth();
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isHomePage = pathname === "/";

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <WaveLoader />
      </div>
    );
  }

  // Auth pages and home page don't use sidebar layout
  if (isAuthPage || isHomePage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
