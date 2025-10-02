import type { HackathonStatus } from "@/types/hackathon";

/**
 * Centralized status utilities for consistent badge styling across the platform
 */

export type StatusVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "green"
  | "red"
  | "blue"
  | "purple"
  | "orange"
  | "yellow";

/**
 * Get status variant for hackathon status badges
 */
export function getHackathonStatusVariant(
  status: HackathonStatus,
): StatusVariant {
  switch (status) {
    case "Live":
    case "Registration Open":
      return "green";
    case "Voting":
      return "blue";
    case "Registration Closed":
    case "Submission Starting":
    case "Judging Starting":
      return "yellow";
    case "Coming Soon":
      return "purple"; // Purple for upcoming/future events
    case "Submission Ended":
      return "orange";
    case "Ended":
      return "red";
    default:
      return "default";
  }
}

/**
 * Get status variant for project status badges
 */
export function getProjectStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "draft":
      return "secondary";
    case "submitted":
      return "default";
    case "in_review":
      return "outline";
    case "completed":
      return "destructive";
    default:
      return "secondary";
  }
}

/**
 * Get formatted status display text with consistent capitalization
 */
export function getStatusDisplayText(status: string): string {
  // Handle special cases with proper spacing and capitalization
  switch (status.toLowerCase()) {
    case "registration open":
    case "registration_open":
      return "Registration Open";
    case "registration closed":
    case "registration_closed":
      return "Registration Closed";
    case "live":
      return "Live";
    case "voting":
      return "Voting";
    case "ended":
      return "Ended";
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "in_review":
      return "In Review";
    case "completed":
      return "Completed";
    default:
      // Fallback: capitalize first letter of each word
      return status
        .split(/[\s_]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
  }
}

/**
 * Status color classes for consistent styling
 */
export const STATUS_COLORS = {
  green: {
    bg: "bg-green-500",
    hoverBg: "hover:bg-green-600",
    text: "text-white",
    border: "border-green-500",
    lightBg: "bg-green-100",
    lightText: "text-green-700",
  },
  blue: {
    bg: "bg-blue-500",
    hoverBg: "hover:bg-blue-600",
    text: "text-white",
    border: "border-blue-500",
    lightBg: "bg-blue-100",
    lightText: "text-blue-700",
  },
  yellow: {
    bg: "bg-yellow-500",
    hoverBg: "hover:bg-yellow-600",
    text: "text-white",
    border: "border-yellow-500",
    lightBg: "bg-yellow-100",
    lightText: "text-yellow-700",
  },
  red: {
    bg: "bg-red-500",
    hoverBg: "hover:bg-red-600",
    text: "text-white",
    border: "border-red-500",
    lightBg: "bg-red-100",
    lightText: "text-red-700",
  },
  default: {
    bg: "bg-gray-500",
    hoverBg: "hover:bg-gray-600",
    text: "text-white",
    border: "border-gray-500",
    lightBg: "bg-gray-100",
    lightText: "text-gray-700",
  },
} as const;

/**
 * Get status color classes for custom styling
 */
export function getStatusColors(variant: StatusVariant) {
  return (
    STATUS_COLORS[variant as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.default
  );
}
