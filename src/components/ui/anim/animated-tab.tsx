"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnimatedTabProps {
  text: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  badge?: string;
  className?: string;
}

export function AnimatedTab({
  text,
  value,
  selected,
  onSelect,
  badge,
  className,
}: AnimatedTabProps) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        "relative w-fit px-4 py-2 text-sm font-semibold capitalize",
        "text-foreground transition-colors",
        badge && "flex items-center justify-center gap-2.5",
        className,
      )}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="animated-tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-full bg-background shadow-sm"
        />
      )}
      {badge && (
        <Badge
          variant="secondary"
          className={cn(
            "relative z-10 whitespace-nowrap shadow-none text-xs",
            selected && "bg-muted",
          )}
        >
          {badge}
        </Badge>
      )}
    </button>
  );
}

interface AnimatedTabsProps {
  tabs: Array<{
    text: string;
    value: string;
    badge?: string;
  }>;
  selectedTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function AnimatedTabs({
  tabs,
  selectedTab,
  onTabChange,
  className,
}: AnimatedTabsProps) {
  return (
    <div className={cn("flex w-fit rounded-full bg-muted p-1", className)}>
      {tabs.map((tab) => (
        <AnimatedTab
          key={tab.value}
          text={tab.text}
          value={tab.value}
          selected={selectedTab === tab.value}
          onSelect={onTabChange}
          badge={tab.badge}
        />
      ))}
    </div>
  );
}
