/**
 * Date utility functions for the application
 */

/**
 * Calculate days left until a given date
 */
export function getDaysLeft(endDate: string | Date): number {
  const now = new Date();
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const diffInDays = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diffInDays);
}

/**
 * Format a relative date string (e.g., "2 days ago", "Yesterday")
 */
export function formatRelativeDate(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format a date for display (e.g., "January 15, 2024")
 */
export function formatDisplayDate(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date range (e.g., "Jan 15 - Jan 17, 2024")
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date,
): string {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateString: string | Date): boolean {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.getTime() < Date.now();
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string | Date): boolean {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
