import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getHackathonStatusVariant,
  getProjectStatusVariant,
  getStatusDisplayText,
  getStatusColors,
  type StatusVariant,
} from "@/lib/helpers/status";
import type { HackathonStatus } from "@/types/hackathon";

interface StatusBadgeProps {
  status: string;
  type?: "hackathon" | "project";
  className?: string;
  size?: "xs" | "sm" | "default" | "lg";
  variant?: "badge" | "pill" | "dot";
}

/**
 * Reusable status badge component with consistent styling
 */
export function StatusBadge({
  status,
  type = "hackathon",
  className,
  size = "default",
  variant = "badge",
}: StatusBadgeProps) {
  const statusVariant: StatusVariant =
    type === "hackathon"
      ? getHackathonStatusVariant(status as HackathonStatus)
      : getProjectStatusVariant(status);

  const displayText = getStatusDisplayText(status);
  const colors = getStatusColors(statusVariant);

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-1",
    default: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  if (variant === "dot") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
        <span className="text-sm font-medium">{displayText}</span>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
          colors.lightBg,
          colors.lightText,
          sizeClasses[size],
          className,
        )}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full", colors.bg)} />
        {displayText}
      </div>
    );
  }

  return (
    <Badge
      variant={statusVariant}
      className={cn(
        "font-medium uppercase tracking-wide",
        sizeClasses[size],
        className,
      )}
    >
      {displayText}
    </Badge>
  );
}

export default StatusBadge;
