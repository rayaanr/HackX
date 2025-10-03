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
import { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
          title: "Discussion & Support",
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

  // Motion variants for subtle, classy entrance (avoids jarring pop-in)
  const easeA: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
  const easeB: [number, number, number, number] = [0.23, 0.86, 0.39, 0.96];

  const sectionVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.04 * custom, duration: 0.4, ease: easeA },
    }),
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.06 * custom, duration: 0.35, ease: easeB },
    }),
  } as const;

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className={cn(
        "z-30 border-r border-white/10",
        // Dark gradients to match card hover theme
        "before:absolute before:inset-0 before:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.3),transparent_60%)] before:pointer-events-none before:z-0",
        "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.08),transparent_70%)] after:pointer-events-none after:z-0",
        "backdrop-blur-xl bg-[#0a0a0a]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_32px_-8px_rgba(0,0,0,0.8)]",
        "[&_[data-sidebar=menu-button]]:transition-all [&_[data-sidebar=menu-button]]:duration-200",
        // Active / hover refinement with darker theme
        "[&_[data-sidebar=menu-button][data-active=true]]:bg-gradient-to-r [&_[data-sidebar=menu-button][data-active=true]]:from-primary/20 [&_[data-sidebar=menu-button][data-active=true]]:to-primary/5",
        "[&_[data-sidebar=menu-button][data-active=true]]:shadow-[inset_0_1px_0_rgba(59,130,246,0.1),inset_0_-1px_0_rgba(0,0,0,0.2)] [&_[data-sidebar=menu-button][data-active=true]]:border [&_[data-sidebar=menu-button][data-active=true]]:border-primary/20",
        // Icon tinting
        "[&_[data-sidebar=menu-button][data-active=true]_svg]:text-primary",
        // Hover effects matching card hover theme
        "[&_[data-sidebar=menu-button]:not([data-active=true])]:hover:bg-white/8",
        "[&_[data-sidebar=menu-button]:not([data-active=true])]:hover:text-white/95",
        "[&_[data-sidebar=menu-button]:not([data-active=true])]:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]",
      )}
    >
      <div className="relative h-full flex flex-col before:absolute before:inset-0 before:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),transparent_50%)] before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.06),transparent_75%)] after:pointer-events-none">
        <SidebarHeader className="relative z-10">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={cn(
                  "data-[slot=sidebar-menu-button]:!p-1.5 justify-start",
                  "relative group",
                )}
              >
                <Link href="/" className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-8 shrink-0">
                    <Image
                      src="/logo-icon.svg"
                      alt="HackX Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                      HackX
                    </span>
                    <span className="text-xs text-white/40 -mt-0.5 ml-2">
                      by AthenaX
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="gap-1 px-1 pb-4 relative z-10">
          {nav.main.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              custom={sectionIdx}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
            >
              <SidebarGroup className="rounded-lg relative">
                <SidebarGroupLabel
                  className={cn(
                    "uppercase tracking-wider text-[10px] font-medium pl-2 py-0.5",
                    "text-white/35",
                    "after:bg-gradient-to-r after:from-white/10 after:to-transparent",
                  )}
                >
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item, itemIdx) => {
                      const isActive =
                        pathname === item.url ||
                        (item.url !== "/dashboard" &&
                          pathname.startsWith(item.url));
                      const isDisabled = item.disabled;
                      const Icon = item.Icon;

                      return (
                        <motion.div
                          key={item.title}
                          custom={itemIdx}
                          initial="hidden"
                          animate="visible"
                          variants={itemVariants}
                        >
                          <SidebarMenuItem>
                            {isDisabled ? (
                              <SidebarMenuButton
                                tooltip={`${item.title} (Coming Soon)`}
                                disabled
                                className={cn(
                                  "cursor-not-allowed opacity-50",
                                  "relative",
                                )}
                              >
                                <Icon className="!size-4 opacity-70" />
                                <span className="flex-1">{item.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
                                  Soon
                                </span>
                              </SidebarMenuButton>
                            ) : (
                              <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isActive}
                                className={cn(
                                  "relative group/item",
                                  // Left accent bar - positioned at the very edge
                                  "before:absolute before:inset-y-0 before:left-0 before:w-[4px] before:rounded-none before:bg-gradient-to-b before:from-primary/80 before:to-primary/40 before:opacity-0 before:transition-opacity before:duration-300",
                                  "data-[active=true]:before:opacity-100",
                                  // Glow ring subtle
                                  "data-[active=true]:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_0_4px_rgba(var(--primary-rgb,0,120,255),0.15)]",
                                  // Text + icon refinement
                                  "data-[active=true]:text-white",
                                  // Hover lift
                                  "hover:translate-x-[1px]",
                                  // Slight border on hover / active
                                  "border border-transparent hover:border-white/10 data-[active=true]:border-primary/30",
                                  // Background layering
                                  "data-[active=true]:backdrop-blur-md",
                                )}
                              >
                                <Link
                                  href={item.url}
                                  className="flex items-center"
                                >
                                  <Icon className="!size-4" />
                                  <span className="flex-1">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            )}
                          </SidebarMenuItem>
                        </motion.div>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </motion.div>
          ))}
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
