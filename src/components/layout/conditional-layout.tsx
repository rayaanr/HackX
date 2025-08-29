"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface ConditionalLayoutProps {
  children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
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