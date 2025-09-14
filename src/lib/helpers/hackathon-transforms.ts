import type {
  HackathonWithRelations,
  UIHackathon,
  HackathonStatus,
  JudgeStatus,
} from "@/types/hackathon";

// Transform database hackathon to UI hackathon format
export function transformDatabaseToUI(
  dbHackathon: HackathonWithRelations,
): UIHackathon {
  return {
    id: dbHackathon.id,
    name: dbHackathon.name,
    visual: dbHackathon.visual,
    shortDescription: dbHackathon.short_description,
    fullDescription: dbHackathon.full_description,
    participantCount: dbHackathon.participant_count ?? undefined,
    location: dbHackathon.location,
    techStack: dbHackathon.tech_stack,
    experienceLevel: mapDbExperienceLevel(dbHackathon.experience_level),
    registrationPeriod: {
      registrationStartDate: dbHackathon.registration_start_date
        ? new Date(dbHackathon.registration_start_date)
        : undefined,
      registrationEndDate: dbHackathon.registration_end_date
        ? new Date(dbHackathon.registration_end_date)
        : undefined,
    },
    hackathonPeriod: {
      hackathonStartDate: dbHackathon.hackathon_start_date
        ? new Date(dbHackathon.hackathon_start_date)
        : undefined,
      hackathonEndDate: dbHackathon.hackathon_end_date
        ? new Date(dbHackathon.hackathon_end_date)
        : undefined,
    },
    votingPeriod:
      dbHackathon.voting_start_date || dbHackathon.voting_end_date
        ? {
            votingStartDate: dbHackathon.voting_start_date
              ? new Date(dbHackathon.voting_start_date)
              : undefined,
            votingEndDate: dbHackathon.voting_end_date
              ? new Date(dbHackathon.voting_end_date)
              : undefined,
          }
        : null,
    socialLinks: (dbHackathon.social_links as Record<string, string>) || {},
    prizeCohorts:
      dbHackathon.prize_cohorts?.map((cohort) => ({
        id: cohort.id,
        name: cohort.name,
        numberOfWinners: cohort.number_of_winners,
        prizeAmount: cohort.prize_amount,
        description: cohort.description,
        judgingMode: mapDbJudgingMode(cohort.judging_mode),
        votingMode: mapDbVotingMode(cohort.voting_mode),
        maxVotesPerJudge: cohort.max_votes_per_judge,
        evaluationCriteria:
          cohort.evaluation_criteria?.map((criteria) => ({
            name: criteria.name,
            points: criteria.points,
            description: criteria.description,
          })) || [],
      })) || [],
    judges:
      dbHackathon.judges?.map((judge) => ({
        address: judge.address,
        status: mapDbJudgeStatus(judge.status),
      })) || [],
    schedule:
      dbHackathon.schedule_slots?.map((slot) => ({
        name: slot.name,
        description: slot.description,
        startDateTime: new Date(slot.start_date_time),
        endDateTime: new Date(slot.end_date_time),
        hasSpeaker: slot.has_speaker || false,
        speaker: slot.speaker
          ? {
              name: slot.speaker.name,
              position: slot.speaker.position || undefined,
              xName: slot.speaker.x_name || undefined,
              xHandle: slot.speaker.x_handle || undefined,
              picture: slot.speaker.picture || undefined,
            }
          : undefined,
      })) || [],
  };
}

// Get hackathon status based on dates
export function getHackathonStatus(
  hackathon: UIHackathon | HackathonWithRelations,
): HackathonStatus {
  const now = new Date();

  // Handle database format
  if ("registration_end_date" in hackathon) {
    const dbHackathon = hackathon as HackathonWithRelations;
    const registrationEnd = dbHackathon.registration_end_date
      ? new Date(dbHackathon.registration_end_date)
      : null;
    const hackathonStart = dbHackathon.hackathon_start_date
      ? new Date(dbHackathon.hackathon_start_date)
      : null;
    const hackathonEnd = dbHackathon.hackathon_end_date
      ? new Date(dbHackathon.hackathon_end_date)
      : null;
    const votingEnd = dbHackathon.voting_end_date
      ? new Date(dbHackathon.voting_end_date)
      : null;

    if (registrationEnd && now < registrationEnd) return "Registration Open";
    if (hackathonStart && now < hackathonStart) return "Registration Closed";
    if (hackathonEnd && now < hackathonEnd) return "Live";
    if (votingEnd && now < votingEnd) return "Voting";
    return "Ended";
  }

  // Handle UI format
  const uiHackathon = hackathon as UIHackathon;
  const registrationEnd = uiHackathon.registrationPeriod?.registrationEndDate;
  const hackathonStart = uiHackathon.hackathonPeriod?.hackathonStartDate;
  const hackathonEnd = uiHackathon.hackathonPeriod?.hackathonEndDate;
  const votingEnd = uiHackathon.votingPeriod?.votingEndDate;

  if (registrationEnd && now < registrationEnd) return "Registration Open";
  if (hackathonStart && now < hackathonStart) return "Registration Closed";
  if (hackathonEnd && now < hackathonEnd) return "Live";
  if (votingEnd && now < votingEnd) return "Voting";
  return "Ended";
}

// Get status variant for badge styling
export function getStatusVariant(
  status: HackathonStatus,
):
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "green"
  | "red"
  | "blue"
  | "purple"
  | "orange"
  | "yellow" {
  switch (status) {
    case "Live":
    case "Registration Open":
      return "green";
    case "Voting":
      return "blue";
    case "Registration Closed":
      return "yellow";
    case "Ended":
      return "red";
    default:
      return "default";
  }
}

// Calculate total prize amount for a hackathon
export function calculateTotalPrizeAmount(
  hackathon: HackathonWithRelations,
): string {
  if (!hackathon.prize_cohorts || hackathon.prize_cohorts.length === 0) {
    return "$0";
  }

  const total = hackathon.prize_cohorts.reduce((sum, cohort) => {
    const amount =
      parseFloat(cohort.prize_amount.replace(/[^0-9.-]+/g, "")) || 0;
    return sum + amount;
  }, 0);

  return total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Format date for display
export function formatDateForDisplay(
  date: string | Date | null | undefined,
): string {
  if (!date) return "TBD";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime()))
    return "TBD";
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format experience level for display
export function formatExperienceLevel(level: string): string {
  switch (level.toLowerCase()) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    case "all":
      return "All Levels";
    default:
      return level;
  }
}

// Helper functions to map database enums to UI types
function mapDbExperienceLevel(
  level: string,
): "beginner" | "intermediate" | "advanced" | "all" {
  switch (level.toLowerCase()) {
    case "beginner":
      return "beginner";
    case "intermediate":
      return "intermediate";
    case "advanced":
      return "advanced";
    case "all":
      return "all";
    default:
      return "all";
  }
}

function mapDbJudgingMode(mode: string): "manual" | "automated" | "hybrid" {
  switch (mode.toLowerCase()) {
    case "manual":
      return "manual";
    case "automated":
      return "automated";
    case "hybrid":
      return "hybrid";
    default:
      return "manual";
  }
}

function mapDbVotingMode(mode: string): "public" | "private" | "judges_only" {
  switch (mode.toLowerCase()) {
    case "public":
      return "public";
    case "private":
      return "private";
    case "judges_only":
      return "judges_only";
    default:
      return "judges_only";
  }
}

function mapDbJudgeStatus(status: string): JudgeStatus {
  switch (status.toLowerCase()) {
    case "waiting":
      return "waiting";
    case "invited":
      return "invited";
    case "pending":
      return "pending";
    case "accepted":
      return "accepted";
    case "declined":
      return "declined";
    default:
      return "waiting";
  }
}

// Transform blockchain hackathon to UI hackathon format
export function transformBlockchainToUI(blockchainHackathon: any): UIHackathon {
  // Convert Unix timestamps to Date objects
  const convertUnixToDate = (
    timestamp: bigint | number | string | undefined,
  ): Date | undefined => {
    if (!timestamp) return undefined;
    const ts =
      typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);
    return ts > 0 ? new Date(ts * 1000) : undefined;
  };

  return {
    id: blockchainHackathon.id?.toString() || "",
    name:
      blockchainHackathon.name ||
      `Hackathon #${blockchainHackathon.id || "Unknown"}`,
    visual: blockchainHackathon.visual || null,
    shortDescription:
      blockchainHackathon.shortDescription || "No description available",
    fullDescription: blockchainHackathon.fullDescription || "",
    participantCount: blockchainHackathon.participantCount || 0,
    location: blockchainHackathon.location || "TBD",
    techStack: blockchainHackathon.techStack || [],
    experienceLevel: blockchainHackathon.experienceLevel || "all",
    registrationPeriod: {
      registrationStartDate:
        convertUnixToDate(
          blockchainHackathon.registrationPeriod?.registrationStartDate,
        ) ||
        (blockchainHackathon.registrationStartDate
          ? convertUnixToDate(blockchainHackathon.registrationStartDate)
          : undefined),
      registrationEndDate:
        convertUnixToDate(
          blockchainHackathon.registrationPeriod?.registrationEndDate,
        ) || convertUnixToDate(blockchainHackathon.registrationDeadline),
    },
    hackathonPeriod: {
      hackathonStartDate:
        convertUnixToDate(
          blockchainHackathon.hackathonPeriod?.hackathonStartDate,
        ) || convertUnixToDate(blockchainHackathon.registrationDeadline), // Fallback to registration end
      hackathonEndDate:
        convertUnixToDate(
          blockchainHackathon.hackathonPeriod?.hackathonEndDate,
        ) || convertUnixToDate(blockchainHackathon.submissionDeadline),
    },
    votingPeriod: {
      votingStartDate:
        convertUnixToDate(blockchainHackathon.votingPeriod?.votingStartDate) ||
        convertUnixToDate(blockchainHackathon.submissionDeadline), // Fallback to submission end
      votingEndDate:
        convertUnixToDate(blockchainHackathon.votingPeriod?.votingEndDate) ||
        convertUnixToDate(blockchainHackathon.judgingDeadline),
    },
    socialLinks: blockchainHackathon.socialLinks || {},
    prizeCohorts: (blockchainHackathon.prizeCohorts || []).map(
      (cohort: any, index: number) => ({
        id: cohort.id || index.toString(),
        name: cohort.name || `Prize ${index + 1}`,
        numberOfWinners: cohort.numberOfWinners || 1,
        prizeAmount: cohort.prizeAmount?.toString() || "0",
        description: cohort.description || "",
        judgingMode: cohort.judgingMode || "manual",
        votingMode: cohort.votingMode || "judges_only",
        maxVotesPerJudge: cohort.maxVotesPerJudge || 1,
        evaluationCriteria: (cohort.evaluationCriteria || []).map(
          (criteria: any, critIndex: number) => ({
            name: criteria.name || `Criteria ${critIndex + 1}`,
            points: criteria.points || 10,
            description: criteria.description || "",
          }),
        ),
      }),
    ),
    judges: (blockchainHackathon.judges || []).map((judge: any) => ({
      address: judge.address || "",
      status: judge.status || "waiting",
    })),
    schedule: (blockchainHackathon.schedule || []).map((slot: any) => ({
      name: slot.name || "Event",
      description: slot.description || "",
      startDateTime: slot.startDateTime
        ? new Date(slot.startDateTime)
        : new Date(),
      endDateTime: slot.endDateTime ? new Date(slot.endDateTime) : new Date(),
      hasSpeaker: slot.hasSpeaker || false,
      speaker: slot.speaker
        ? {
            name: slot.speaker.name || "",
            position: slot.speaker.position,
            xName: slot.speaker.xName,
            xHandle: slot.speaker.xHandle,
            picture: slot.speaker.picture,
          }
        : undefined,
    })),
  };
}
