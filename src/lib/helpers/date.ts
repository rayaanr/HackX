/**
 * Date utility functions for the application
 */

/**
 * Generic type for date inputs that can be strings, numbers, Date objects, or null/undefined
 */
export type DateInput = string | Date | number | null | undefined;

/**
 * Safely converts various date formats to a Date object
 * @param value - Date string, timestamp number, or Date object
 * @returns Date object or null if invalid
 */
export function safeToDate(value: DateInput): Date | null {
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
export function getDaysLeft(endDate: DateInput): number {
  const now = new Date();
  const end = safeToDate(endDate);
  if (!end) return 0;

  const diffInDays = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, diffInDays);
}

/**
 * Format a relative date string (e.g., "2 days ago", "Yesterday")
 */
export function formatRelativeDate(dateString: DateInput): string {
  const date = safeToDate(dateString);
  if (!date) return "Invalid date";

  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${
      Math.floor(diffInDays / 7) !== 1 ? "s" : ""
    } ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format a date for display (e.g., "January 15, 2024")
 */
export function formatDisplayDate(dateString: DateInput): string {
  const date = safeToDate(dateString);
  if (!date) return "Invalid date";

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
  startDate: DateInput,
  endDate: DateInput,
): string {
  const start = safeToDate(startDate);
  const end = safeToDate(endDate);

  if (!start || !end) return "Invalid date range";

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
export function isPastDate(dateString: DateInput): boolean {
  const date = safeToDate(dateString);
  if (!date) return false; // Invalid dates are considered not past

  return date.getTime() < Date.now();
}

/**
 * Check if a date is today
 */
export function isToday(dateString: DateInput): boolean {
  const date = safeToDate(dateString);
  if (!date) return false; // Invalid dates are considered not today

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
}):
  | "Coming Soon"
  | "Registration Open"
  | "Registration Closed"
  | "Submission Starting"
  | "Live"
  | "Submission Ended"
  | "Judging Starting"
  | "Voting"
  | "Ended" {
  const now = new Date();

  // Get all relevant dates
  const registrationStart = safeToDate(
    hackathon.registrationPeriod?.registrationStartDate,
  );
  const registrationEnd = safeToDate(
    hackathon.registrationPeriod?.registrationEndDate,
  );
  const hackathonStart = safeToDate(
    hackathon.hackathonPeriod?.hackathonStartDate,
  );
  const hackathonEnd = safeToDate(hackathon.hackathonPeriod?.hackathonEndDate);
  const votingStart = safeToDate(hackathon.votingPeriod?.votingStartDate);
  const votingEnd = safeToDate(hackathon.votingPeriod?.votingEndDate);

  // Enhanced timeline logic with more granular status phases

  // Before registration starts (upcoming)
  if (registrationStart && now < registrationStart) {
    return "Coming Soon";
  }

  // Registration phase: between registration start and end
  if (registrationEnd && now < registrationEnd) {
    return "Registration Open";
  }

  // Between registration end and submission start (preparation phase)
  if (hackathonStart && now < hackathonStart) {
    return "Submission Starting";
  }

  // Hackathon/Submission phase: between hackathon start and end
  if (hackathonEnd && now < hackathonEnd) {
    return "Live";
  }

  // After submission ends, check what comes next
  if (hackathonEnd && now >= hackathonEnd) {
    // Between submission end and voting start (review/preparation phase)
    if (votingStart && now < votingStart) {
      return "Judging Starting";
    }

    // If voting has started
    if (votingEnd && now < votingEnd) {
      return "Voting";
    }

    // If no voting period defined but submission ended, show judging phase
    if (!votingStart && !votingEnd) {
      return "Submission Ended";
    }
  }

  // Voting phase: between voting start and end (fallback)
  if (votingEnd && now < votingEnd) {
    return "Voting";
  }

  // After all phases completed
  return "Ended";
}

/**
 * Get hackathon status based on blockchain timestamps (Unix timestamps in seconds)
 * Pure timeline logic for blockchain hackathon data
 */
export function getBlockchainHackathonStatus(hackathon: {
  registrationStartDate?: number;
  registrationDeadline: number;
  submissionStartDate: number;
  submissionDeadline: number;
  judgingStartDate?: number;
  judgingDeadline: number;
  isActive?: boolean;
}): "Registration Open" | "Registration Closed" | "Live" | "Voting" | "Ended" {
  if (hackathon.isActive === false) {
    return "Ended";
  }

  const now = Date.now() / 1000; // Current UTC timestamp in seconds (matches blockchain timestamps)

  // Before registration starts (if registrationStartDate is set)
  if (
    hackathon.registrationStartDate &&
    now < hackathon.registrationStartDate
  ) {
    return "Registration Closed"; // Not started yet
  }

  // Registration phase: before registration deadline
  if (now < hackathon.registrationDeadline) {
    return "Registration Open";
  }

  // Between registration deadline and submission start (if there's a gap)
  if (hackathon.submissionStartDate && now < hackathon.submissionStartDate) {
    return "Registration Closed";
  }

  // Submission phase: between submission start and submission deadline
  if (now < hackathon.submissionDeadline) {
    return "Live";
  }

  // Between submission deadline and judging start (if there's a gap)
  if (hackathon.judgingStartDate && now < hackathon.judgingStartDate) {
    return "Registration Closed"; // Submissions closed, judging not started
  }

  // Judging phase: between judging start and judging deadline
  if (now < hackathon.judgingDeadline) {
    return "Voting";
  }

  // After judging deadline: completed
  return "Ended";
}

/**
 * Convert blockchain timestamp (Unix seconds) to Date object
 * Blockchain timestamps are always UTC seconds since epoch
 */
export function blockchainTimestampToDate(timestamp: bigint | number): Date {
  const timestampNum =
    typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(timestampNum * 1000); // Convert seconds to milliseconds
}

// ===== JUDGING PERIOD UTILITIES =====

/**
 * Check if hackathon is currently in judging/voting period
 * Works with both UI and blockchain hackathon formats
 */
export function isInJudgingPeriod(hackathon: any): boolean {
  if (!hackathon) return false;

  const now = new Date();

  // For blockchain hackathons (with Unix timestamps)
  if (
    typeof hackathon.judgingStartDate === "number" &&
    typeof hackathon.judgingDeadline === "number"
  ) {
    const nowTimestamp = now.getTime() / 1000; // Convert to seconds
    return (
      nowTimestamp >= hackathon.judgingStartDate &&
      nowTimestamp <= hackathon.judgingDeadline
    );
  }

  // For UI hackathons (with Date objects/strings)
  if (hackathon.votingPeriod) {
    const votingStart = safeToDate(hackathon.votingPeriod.votingStartDate);
    const votingEnd = safeToDate(hackathon.votingPeriod.votingEndDate);

    if (votingStart && votingEnd) {
      return now >= votingStart && now <= votingEnd;
    }
  }

  // Fallback: check if status indicates judging
  const status = hackathon.status || getHackathonCurrentStatus(hackathon);
  return status === "Voting" || status === "Judging";
}

/**
 * Check if judging period has ended
 * Works with both UI and blockchain hackathon formats
 */
export function hasJudgingPeriodEnded(hackathon: any): boolean {
  if (!hackathon) return false;

  const now = new Date();

  // For blockchain hackathons (with Unix timestamps)
  if (typeof hackathon.judgingDeadline === "number") {
    const nowTimestamp = now.getTime() / 1000; // Convert to seconds
    return nowTimestamp > hackathon.judgingDeadline;
  }

  // For UI hackathons (with Date objects/strings)
  if (hackathon.votingPeriod?.votingEndDate) {
    const votingEnd = safeToDate(hackathon.votingPeriod.votingEndDate);
    return votingEnd ? now > votingEnd : false;
  }

  // Fallback: check if status indicates completion
  const status = hackathon.status || getHackathonCurrentStatus(hackathon);
  return status === "Ended";
}

/**
 * Check if judging period hasn't started yet
 * Works with both UI and blockchain hackathon formats
 */
export function isJudgingPeriodPending(hackathon: any): boolean {
  if (!hackathon) return false;

  const now = new Date();

  // For blockchain hackathons (with Unix timestamps)
  if (typeof hackathon.judgingStartDate === "number") {
    const nowTimestamp = now.getTime() / 1000; // Convert to seconds
    return nowTimestamp < hackathon.judgingStartDate;
  }

  // For UI hackathons (with Date objects/strings)
  if (hackathon.votingPeriod?.votingStartDate) {
    const votingStart = safeToDate(hackathon.votingPeriod.votingStartDate);
    return votingStart ? now < votingStart : false;
  }

  // Fallback: check if still in submission phase
  const status = hackathon.status || getHackathonCurrentStatus(hackathon);
  return (
    status === "Live" ||
    status === "Submission Ended" ||
    status === "Judging Starting"
  );
}

/**
 * Get current hackathon status - unified function that works with any hackathon format
 */
export function getHackathonCurrentStatus(hackathon: any): string {
  if (!hackathon) return "Unknown";

  // If hackathon already has a status, return it
  if (hackathon.status) return hackathon.status;

  // For blockchain hackathons
  if (typeof hackathon.judgingDeadline === "number") {
    return getBlockchainHackathonStatus(hackathon);
  }

  // For UI hackathons
  if (hackathon.votingPeriod || hackathon.hackathonPeriod) {
    return getUIHackathonStatus(hackathon);
  }

  return "Unknown";
}

/**
 * Get judging period dates in a consistent format
 * Returns null if no judging period is defined
 */
export function getJudgingPeriodDates(hackathon: any): {
  startDate: Date | null;
  endDate: Date | null;
} | null {
  if (!hackathon) return null;

  // For blockchain hackathons (with Unix timestamps)
  if (
    typeof hackathon.judgingStartDate === "number" &&
    typeof hackathon.judgingDeadline === "number"
  ) {
    return {
      startDate: blockchainTimestampToDate(hackathon.judgingStartDate),
      endDate: blockchainTimestampToDate(hackathon.judgingDeadline),
    };
  }

  // For UI hackathons (with Date objects/strings)
  if (hackathon.votingPeriod) {
    const startDate = safeToDate(hackathon.votingPeriod.votingStartDate);
    const endDate = safeToDate(hackathon.votingPeriod.votingEndDate);

    if (startDate || endDate) {
      return { startDate, endDate };
    }
  }

  return null;
}
