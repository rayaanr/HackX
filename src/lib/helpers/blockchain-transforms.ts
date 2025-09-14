import { ContractPhase } from "@/types/blockchain";
import type {
  BlockchainHackathon,
  BlockchainProject,
  HackathonMetadata,
  ProjectMetadata,
  HackathonPhaseStatus,
  ProjectStatus,
} from "@/types/blockchain";
import type {
  UIHackathon,
  UIProject,
  HackathonWithRelations,
} from "@/types/hackathon";

/**
 * Transform blockchain hackathon data to UI format
 */
export function transformBlockchainToUI(
  blockchainHackathon: BlockchainHackathon,
): UIHackathon {
  const metadata = blockchainHackathon.metadata;

  return {
    id: blockchainHackathon.id.toString(),
    name: metadata?.name || `Hackathon #${blockchainHackathon.id}`,
    visual: metadata?.visual || null,
    shortDescription: metadata?.shortDescription || "No description available",
    fullDescription: metadata?.fullDescription || "",
    participantCount: blockchainHackathon.participantCount || 0,
    location: metadata?.location || "TBD",
    techStack: metadata?.techStack || [],
    experienceLevel: metadata?.experienceLevel || "all",
    registrationPeriod: {
      registrationStartDate: metadata?.registrationPeriod?.registrationStartDate
        ? new Date(metadata.registrationPeriod.registrationStartDate)
        : undefined,
      registrationEndDate: new Date(
        Number(blockchainHackathon.registrationDeadline) * 1000,
      ),
    },
    hackathonPeriod: {
      hackathonStartDate: metadata?.hackathonPeriod?.hackathonStartDate
        ? new Date(metadata.hackathonPeriod.hackathonStartDate)
        : new Date(Number(blockchainHackathon.registrationDeadline) * 1000), // Fallback to registration end
      hackathonEndDate: new Date(
        Number(blockchainHackathon.submissionDeadline) * 1000,
      ),
    },
    votingPeriod: {
      votingStartDate: new Date(
        Number(blockchainHackathon.submissionDeadline) * 1000,
      ),
      votingEndDate: new Date(
        Number(blockchainHackathon.judgingDeadline) * 1000,
      ),
    },
    socialLinks: metadata?.socialLinks || {},
    prizeCohorts:
      metadata?.prizeCohorts?.map((cohort, index) => ({
        id: index.toString(),
        name: cohort.name,
        numberOfWinners: cohort.numberOfWinners,
        prizeAmount: cohort.prizeAmount,
        description: cohort.description,
        judgingMode: cohort.judgingMode,
        votingMode: cohort.votingMode,
        maxVotesPerJudge: cohort.maxVotesPerJudge,
        evaluationCriteria: cohort.evaluationCriteria.map((criteria) => ({
          name: criteria.name,
          points: criteria.points,
          description: criteria.description,
        })),
      })) || [],
    judges:
      metadata?.judges?.map((judge) => ({
        address: judge.address,
        status: judge.status,
      })) || [],
    schedule:
      metadata?.schedule?.map((slot) => ({
        name: slot.name,
        description: slot.description,
        startDateTime: new Date(slot.startDateTime),
        endDateTime: new Date(slot.endDateTime),
        hasSpeaker: slot.hasSpeaker,
        speaker: slot.speaker,
      })) || [],
  };
}

/**
 * Transform blockchain project data to UI format
 */
export function transformBlockchainProjectToUI(
  blockchainProject: BlockchainProject,
): UIProject {
  const metadata = blockchainProject.metadata;

  return {
    id: blockchainProject.id.toString(),
    name: metadata?.name || `Project #${blockchainProject.id}`,
    description: metadata?.description || null,
    hackathon_id: blockchainProject.hackathonId.toString(),
    hackathon_name: blockchainProject.hackathonMetadata?.name,
    tech_stack: metadata?.techStack || [],
    status: mapProjectStatusToUI(
      getProjectStatusFromContract(blockchainProject),
    ),
    updated_at:
      metadata?.uploadedAt || metadata?.createdAt || new Date().toISOString(),
    repository_url: metadata?.repositoryUrl || null,
    demo_url: metadata?.demoUrl || null,
    team_members: metadata?.teamMembers || [],
    created_by: blockchainProject.creator,
    created_at: metadata?.createdAt || new Date().toISOString(),
    totalScore: Number(blockchainProject.totalScore),
    judgeCount: Number(blockchainProject.judgeCount),
    averageScore: blockchainProject.averageScore,
  };
}

/**
 * Get UI-friendly hackathon status based on contract phase and timestamps
 */
export function getHackathonStatus(
  hackathon: BlockchainHackathon,
): HackathonPhaseStatus {
  if (!hackathon.isActive) {
    return "cancelled";
  }

  const now = Date.now() / 1000; // Current timestamp in seconds
  const registrationDeadline = Number(hackathon.registrationDeadline);
  const submissionDeadline = Number(hackathon.submissionDeadline);
  const judgingDeadline = Number(hackathon.judgingDeadline);

  switch (hackathon.currentPhase) {
    case ContractPhase.REGISTRATION:
      if (now < registrationDeadline) {
        return "registration_open";
      } else {
        return "registration_closed";
      }

    case ContractPhase.SUBMISSION:
      if (now < submissionDeadline) {
        return "submission_open";
      } else {
        return "submission_closed";
      }

    case ContractPhase.JUDGING:
      if (now < judgingDeadline) {
        return "judging_open";
      } else {
        return "judging_closed";
      }

    case ContractPhase.COMPLETED:
      return "completed";

    default:
      return "upcoming";
  }
}

/**
 * Get project status based on contract data
 */
function getProjectStatusFromContract(
  project: BlockchainProject,
): ProjectStatus {
  if (!project.isSubmitted) {
    return "draft";
  }

  if (project.judgeCount > BigInt(0)) {
    return "scored";
  }

  return "submitted";
}

/**
 * Map blockchain project status to UI project status
 */
function mapProjectStatusToUI(
  status: ProjectStatus,
): "draft" | "submitted" | "in_review" | "completed" {
  switch (status) {
    case "under_review":
      return "in_review";
    case "scored":
      return "completed";
    case "draft":
    case "submitted":
    case "completed":
      return status;
    default:
      return "submitted";
  }
}

/**
 * Transform UI hackathon form data to blockchain metadata format
 */
export function transformUIToMetadata(formData: any): HackathonMetadata {
  return {
    name: formData.name,
    shortDescription: formData.shortDescription,
    fullDescription: formData.fullDescription,
    location: formData.location,
    visual: formData.visual,
    techStack: formData.techStack,
    experienceLevel: formData.experienceLevel,
    socialLinks: formData.socialLinks || {},
    registrationPeriod: {
      registrationStartDate:
        formData.registrationPeriod?.registrationStartDate?.toISOString(),
      registrationEndDate:
        formData.registrationPeriod?.registrationEndDate?.toISOString(),
    },
    hackathonPeriod: {
      hackathonStartDate:
        formData.hackathonPeriod?.hackathonStartDate?.toISOString(),
      hackathonEndDate:
        formData.hackathonPeriod?.hackathonEndDate?.toISOString(),
    },
    votingPeriod: {
      votingStartDate: formData.votingPeriod?.votingStartDate?.toISOString(),
      votingEndDate: formData.votingPeriod?.votingEndDate?.toISOString(),
    },
    prizeCohorts: formData.prizeCohorts || [],
    judges: formData.judges || [],
    schedule:
      formData.schedule?.map((slot: any) => ({
        ...slot,
        startDateTime: slot.startDateTime?.toISOString(),
        endDateTime: slot.endDateTime?.toISOString(),
      })) || [],
    createdAt: new Date().toISOString(),
    version: "1.0.0",
    uploadedAt: new Date().toISOString(),
    type: "hackathon-metadata" as const,
  };
}

/**
 * Transform UI project form data to blockchain metadata format
 */
export function transformProjectUIToMetadata(formData: any): ProjectMetadata {
  return {
    name: formData.name,
    description: formData.description,
    techStack: formData.techStack || [],
    repositoryUrl: formData.repositoryUrl,
    demoUrl: formData.demoUrl,
    teamMembers: formData.teamMembers || [],
    sector: formData.sector,
    createdAt: new Date().toISOString(),
    version: "1.0.0",
    uploadedAt: new Date().toISOString(),
    type: "project-metadata" as const,
  };
}

/**
 * Get status variant for UI badge styling
 */
export function getStatusVariant(
  status: HackathonPhaseStatus,
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
    case "registration_open":
    case "submission_open":
    case "judging_open":
      return "green";
    case "registration_closed":
    case "submission_closed":
    case "judging_closed":
      return "yellow";
    case "completed":
      return "blue";
    case "cancelled":
      return "red";
    case "upcoming":
      return "purple";
    default:
      return "default";
  }
}

/**
 * Format timestamps for display
 */
export function formatTimestamp(timestamp: bigint | number): Date {
  const timestampNum =
    typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(timestampNum * 1000);
}

/**
 * Format date for display
 */
export function formatDateForDisplay(
  date: Date | string | null | undefined,
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

/**
 * Calculate total prize amount from prize cohorts
 */
export function calculateTotalPrizeAmount(
  prizeCohorts: Array<{ prizeAmount: string }>,
): string {
  if (!prizeCohorts || prizeCohorts.length === 0) {
    return "$0";
  }

  const total = prizeCohorts.reduce((sum, cohort) => {
    const amount =
      parseFloat(cohort.prizeAmount.replace(/[^0-9.-]+/g, "")) || 0;
    return sum + amount;
  }, 0);

  return total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/**
 * Check if a hackathon is in a specific phase
 */
export function isInPhase(
  hackathon: BlockchainHackathon,
  phase: ContractPhase,
): boolean {
  return hackathon.currentPhase === phase && hackathon.isActive;
}

/**
 * Check if a user can register for a hackathon
 */
export function canRegister(hackathon: BlockchainHackathon): boolean {
  const now = Date.now() / 1000;
  return (
    hackathon.isActive &&
    hackathon.currentPhase === ContractPhase.REGISTRATION &&
    Number(hackathon.registrationDeadline) > now
  );
}

/**
 * Check if a user can submit a project
 */
export function canSubmitProject(hackathon: BlockchainHackathon): boolean {
  const now = Date.now() / 1000;
  return (
    hackathon.isActive &&
    hackathon.currentPhase === ContractPhase.SUBMISSION &&
    Number(hackathon.submissionDeadline) > now
  );
}

/**
 * Check if judges can score projects
 */
export function canJudge(hackathon: BlockchainHackathon): boolean {
  const now = Date.now() / 1000;
  return (
    hackathon.isActive &&
    hackathon.currentPhase === ContractPhase.JUDGING &&
    Number(hackathon.judgingDeadline) > now
  );
}
