import { nanoid } from "nanoid";
import { z } from "zod";

// Email validation using Zod
const emailSchema = z.string().email("Please enter a valid email address");

export function validateJudgeEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || !email.trim()) {
    return { isValid: false, error: "Email is required" };
  }

  const result = emailSchema.safeParse(email.trim());
  if (!result.success) {
    return {
      isValid: false,
      error:
        result.error.issues[0]?.message || "Please enter a valid email address",
    };
  }

  return { isValid: true };
}

// Generate judge invitation link
export function generateJudgeInviteLink(baseUrl?: string): string {
  const origin =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const token = nanoid();
  return `${origin}/hackathons/invite?token=${token}`;
}

// Format judge invitation email content
export function formatJudgeInvitationEmail(
  hackathonName: string,
  inviteLink: string,
): {
  subject: string;
  body: string;
} {
  const subject = `Invitation to Judge: ${hackathonName}`;
  const body = `
You have been invited to judge the hackathon "${hackathonName}".

Please click the link below to accept the invitation:
${inviteLink}

Best regards,
The Hackathon Team
  `.trim();

  return { subject, body };
}

// Judge status helpers
export function getJudgeStatusDisplay(status: string): {
  label: string;
  color: string;
  description: string;
} {
  switch (status.toLowerCase()) {
    case "pending":
    case "waiting":
      return {
        label: "Pending",
        color: "text-yellow-600",
        description: "Invitation sent, awaiting response",
      };
    case "accepted":
      return {
        label: "Accepted",
        color: "text-green-600",
        description: "Judge has accepted the invitation",
      };
    case "declined":
      return {
        label: "Declined",
        color: "text-red-600",
        description: "Judge has declined the invitation",
      };
    default:
      return {
        label: "Unknown",
        color: "text-gray-600",
        description: "Status unknown",
      };
  }
}

// Copy to clipboard functionality is now handled by @uidotdev/usehooks
// Import useCopyToClipboard from "@uidotdev/usehooks" in components

// Compose judge invitation data
export function composeJudgeInvitation(
  email: string,
  hackathonName: string,
  organizerName?: string,
): {
  email: string;
  status: string;
  invitedAt: string;
  invitedBy?: string;
} {
  return {
    email,
    status: "waiting",
    invitedAt: new Date().toISOString(),
    invitedBy: organizerName,
  };
}

// Judge invitation validation schema
const judgeInvitationSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    status: z.enum(["pending", "waiting", "accepted", "declined", "revoked"], {
      message:
        "Status must be one of: pending, waiting, accepted, declined, revoked",
    }),
    invitedAt: z
      .string()
      .refine(
        (date) => !isNaN(Date.parse(date)),
        "Invalid date format for invitedAt",
      )
      .optional(),
    invitedBy: z.string().optional(),
    // Support both camelCase and snake_case variations
    invited_at: z
      .string()
      .refine(
        (date) => !isNaN(Date.parse(date)),
        "Invalid date format for invited_at",
      )
      .optional(),
    invited_by: z.string().optional(),
  })
  .refine(
    (data) => data.invitedAt || data.invited_at || true, // At least one date field can be present
    { message: "Invalid invitation data structure" },
  );

// Validate judge invitation data
export function validateJudgeInvitation(invitation: any): {
  isValid: boolean;
  errors: string[];
} {
  const result = judgeInvitationSchema.safeParse(invitation);

  if (result.success) {
    return {
      isValid: true,
      errors: [],
    };
  }

  const errors = result.error.issues.map((err: any) => {
    const field = err.path.length > 0 ? `${err.path.join(".")}: ` : "";
    return `${field}${err.message}`;
  });

  return {
    isValid: false,
    errors,
  };
}

// Check if judge is already invited
export function isJudgeAlreadyInvited(
  email: string,
  existingJudges: any[],
): boolean {
  return existingJudges.some(
    (judge) => judge.email.toLowerCase() === email.toLowerCase(),
  );
}

// Get judge statistics
export function getJudgeStats(judges: any[]): {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
} {
  return judges.reduce(
    (stats, judge) => {
      stats.total++;
      const status = judge.status.toLowerCase();

      if (status === "pending" || status === "waiting") {
        stats.pending++;
      } else if (status === "accepted") {
        stats.accepted++;
      } else if (status === "declined") {
        stats.declined++;
      }

      return stats;
    },
    { total: 0, pending: 0, accepted: 0, declined: 0 },
  );
}

// Format judge list for display
export function formatJudgesForDisplay(judges: any[]): Array<{
  id: string;
  email: string;
  status: ReturnType<typeof getJudgeStatusDisplay>;
  invitedAt: string;
  canResendInvite: boolean;
}> {
  return judges.map((judge) => ({
    id: judge.id || judge.email,
    email: judge.email,
    status: getJudgeStatusDisplay(judge.status),
    invitedAt: judge.invitedAt || judge.created_at || new Date().toISOString(),
    canResendInvite:
      judge.status.toLowerCase() === "pending" ||
      judge.status.toLowerCase() === "waiting",
  }));
}
