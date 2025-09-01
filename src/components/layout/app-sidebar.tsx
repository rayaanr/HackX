"use client";

import {
  Home,
  Code,
  Trophy,
  FolderOpen,
  Calendar,
  Plus,
  BookOpen,
  Award,
  Users,
  GraduationCap,
  MessageCircle,
  UserCheck,
  MoreHorizontal,
  ListTodo,
} from "lucide-react";
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
import { usePathname } from "next/navigation";

const nav = {
  main: {
    section1: [
      {
        title: "Quest",
        url: "/quest",
        Icon: ListTodo,
      },
    ],
    section2: [
      {
        title: "My Certification",
        url: "/certification",
        Icon: Award,
      },
      {
        title: "Explore Course",
        url: "/course",
        Icon: BookOpen,
      },
    ],
    section3: [
      {
        title: "Dashboard",
        url: "/dashboard",
        Icon: Home,
      },
      {
        title: "Explore Hackathons",
        url: "/hackathons",
        Icon: Code,
      },
      {
        title: "Project Archive",
        url: "/projects",
        Icon: FolderOpen,
      },
    ],
    section4: [
      {
        title: "Community Events",
        url: "/community",
        Icon: Users,
      },
      {
        title: "Learning Camps",
        url: "/camps",
        Icon: GraduationCap,
      },
      {
        title: "Discussion and Support",
        url: "/support",
        Icon: MessageCircle,
      },
      {
        title: "Advocate Program",
        url: "/advocate",
        Icon: UserCheck,
      },
      {
        title: "More",
        url: "/more",
        Icon: MoreHorizontal,
      },
    ],
  },
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

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
                    {sectionItems.map((item) => {
                      const isActive = pathname === item.url || 
                        (item.url !== "/dashboard" && pathname.startsWith(item.url));
                      
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                            <Link href={item.url}>
                              <item.Icon className="!size-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
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
    </Sidebar>
  );
}
