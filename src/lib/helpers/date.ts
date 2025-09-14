/**
 * Date utility functions for the application
 */

/**
 * Safely converts various date formats to a Date object
 * @param value - Date string, timestamp number, or Date object
 * @returns Date object or null if invalid
 */
export function safeToDate(
  value: string | number | Date | null | undefined,
): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date : null;
  }

  if (typeof value === "number") {
    // Handle both Unix timestamps (seconds) and milliseconds
    const timestamp = value > 1e12 ? value : value * 1000;
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) ? date : null;
  }

  return null;
}

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

/**
 * Get hackathon status based on current time and phase deadlines
 * Works with blockchain-transformed UIHackathon data
 */
export function getUIHackathonStatus(hackathon: {
  registrationPeriod?: {
    registrationEndDate?: string | Date | number | null | undefined;
    registrationStartDate?: string | Date | number | null | undefined;
  };
  hackathonPeriod?: {
    hackathonStartDate?: string | Date | number | null | undefined;
    hackathonEndDate?: string | Date | number | null | undefined;
  };
  votingPeriod?: {
    votingStartDate?: string | Date | number | null | undefined;
    votingEndDate?: string | Date | number | null | undefined;
  };
}): "Registration Open" | "Registration Closed" | "Live" | "Voting" | "Ended" {
  const now = new Date();

  // Check registration phase
  const registrationEnd = safeToDate(hackathon.registrationPeriod?.registrationEndDate);
  if (registrationEnd && now < registrationEnd) {
    return "Registration Open";
  }

  // Check hackathon phase
  const hackathonEnd = safeToDate(hackathon.hackathonPeriod?.hackathonEndDate);
  if (hackathonEnd && now < hackathonEnd) {
    // If we're past registration but before hackathon end
    const hackathonStart = safeToDate(hackathon.hackathonPeriod?.hackathonStartDate);
    if (hackathonStart && now < hackathonStart) {
      return "Registration Closed";
    }
    return "Live";
  }

  // Check voting phase
  const votingEnd = safeToDate(hackathon.votingPeriod?.votingEndDate);
  if (votingEnd && now < votingEnd) {
    return "Voting";
  }

  return "Ended";
}
