"use client";

import {
  Home,
  Code,
  FolderOpen,
  BookOpen,
  Award,
  Users,
  GraduationCap,
  MessageCircle,
  UserCheck,
  ListTodo,
  Gavel,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { ComponentProps } from "react";
import { usePathname } from "next/navigation";

const nav = {
  main: [
    {
      title: "Evaluation",
      items: [
        {
          title: "Judge Dashboard",
          url: "/judge",
          Icon: Gavel,
        },
        {
          title: "Quest",
          url: "/quest",
          Icon: ListTodo,
          disabled: true,
        },
      ],
    },
    {
      title: "Development",
      items: [
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
    },
    {
      title: "Learning",
      items: [
        {
          title: "My Certification",
          url: "/certification",
          Icon: Award,
          disabled: true,
        },
        {
          title: "Explore Course",
          url: "/course",
          Icon: BookOpen,
          disabled: true,
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          title: "Community Events",
          url: "/community",
          Icon: Users,
          disabled: true,
        },
        {
          title: "Learning Camps",
          url: "/camps",
          Icon: GraduationCap,
          disabled: true,
        },
        {
          title: "Discussion and Support",
          url: "/support",
          Icon: MessageCircle,
          disabled: true,
        },
        {
          title: "Advocate Program",
          url: "/advocate",
          Icon: UserCheck,
          disabled: true,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props} className="z-20">
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
      <SidebarContent className="gap-0">
        {nav.main.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/dashboard" &&
                      pathname.startsWith(item.url));

                  const isDisabled = item.disabled;

                  return (
                    <SidebarMenuItem key={item.title}>
                      {isDisabled ? (
                        <SidebarMenuButton
                          tooltip={`${item.title} (Coming Soon)`}
                          disabled
                          className="cursor-not-allowed opacity-60"
                        >
                          <item.Icon className="!size-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive}
                        >
                          <Link href={item.url}>
                            <item.Icon className="!size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
