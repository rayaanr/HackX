"use client";

import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconListDetails,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { ComponentProps } from "react";
import { NavUser } from "./nav-user";

const nav = {
  main: {
    section1: [
      {
        title: "Quest",
        url: "/quest",
        Icon: IconListDetails,
      },
    ],
    section2: [
      {
        title: "My Certification",
        url: "/certification",
        Icon: IconDashboard,
      },
      {
        title: "Explore Course",
        url: "/course",
        Icon: IconChartBar,
      },
    ],
    section3: [
      {
        title: "Dashboard",
        url: "/profile",
        Icon: IconUser,
      },
      {
        title: "Explore Hackathons",
        url: "/hackathons",
        Icon: IconSettings,
      },
      {
        title: "Project Archive",
        url: "/projects",
        Icon: IconHelp,
      },
    ],
    section4: [
      {
        title: "Community Events",
        url: "/profile",
        Icon: IconUser,
      },
      {
        title: "Learning Camps",
        url: "/hackathons",
        Icon: IconSettings,
      },
      {
        title: "Discussion and Support",
        url: "/projects",
        Icon: IconHelp,
      },
      {
        title: "Advocate Program",
        url: "/projects",
        Icon: IconHelp,
      },
      {
        title: "More",
        url: "/projects",
        Icon: IconHelp,
      },
    ],
  },
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 justify-start"
            >
              <Link href="#" className="flex items-center gap-2">
                <Image
                  src="/logo-icon.svg"
                  alt="Logo"
                  height={32}
                  width={32}
                  className="shrink-0"
                />
                <span className="text-base font-semibold">HackX</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(nav.main).map(
          ([sectionKey, sectionItems], sectionIndex) => (
            <div key={sectionKey}>
              <SidebarGroup>
                <SidebarGroupContent className="flex flex-col gap-2">
                  <SidebarMenu>
                    {sectionItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <Link href={item.url}>
                            <item.Icon className="!size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              {/* Add separator after each section except the last one */}
              {sectionIndex < Object.entries(nav.main).length - 1 && (
                <SidebarSeparator />
              )}
            </div>
          ),
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
