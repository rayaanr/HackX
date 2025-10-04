// ContractPhase removed - using pure timeline logic
import type {
  BlockchainHackathon,
  BlockchainProject,
  HackathonMetadata,
  ProjectMetadata,
  HackathonPhaseStatus,
  ProjectStatus,
} from "@/types/blockchain";
import type { UIHackathon, UIProject } from "@/types/hackathon";
import { resolveIPFSToHttp } from "./ipfs";

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
    visual: resolveIPFSToHttp(metadata?.visual) || null,
    shortDescription: metadata?.shortDescription || "No description available",
    fullDescription: metadata?.fullDescription || "",
    participantCount: blockchainHackathon.participantCount || 0,
    location: metadata?.location || "TBD",
    techStack: metadata?.techStack || [],
    experienceLevel: metadata?.experienceLevel || "all",
    registrationPeriod: {
      registrationStartDate: blockchainHackathon.registrationStartDate
        ? new Date(Number(blockchainHackathon.registrationStartDate) * 1000)
        : metadata?.registrationPeriod?.registrationStartDate
          ? new Date(metadata.registrationPeriod.registrationStartDate)
          : undefined,
      registrationEndDate: new Date(
        Number(blockchainHackathon.registrationDeadline) * 1000,
      ),
    },
    hackathonPeriod: {
      hackathonStartDate: blockchainHackathon.submissionStartDate
        ? new Date(Number(blockchainHackathon.submissionStartDate) * 1000)
        : metadata?.hackathonPeriod?.hackathonStartDate
          ? new Date(metadata.hackathonPeriod.hackathonStartDate)
          : new Date(Number(blockchainHackathon.registrationDeadline) * 1000), // Fallback to registration end
      hackathonEndDate: new Date(
        Number(blockchainHackathon.submissionDeadline) * 1000,
      ),
    },
    votingPeriod: {
      votingStartDate: blockchainHackathon.judgingStartDate
        ? new Date(Number(blockchainHackathon.judgingStartDate) * 1000)
        : new Date(Number(blockchainHackathon.submissionDeadline) * 1000), // Fallback to submission end
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
    logo: resolveIPFSToHttp(metadata?.logo) || null,
    intro: metadata?.intro || null,
    hackathon_id: blockchainProject.hackathonIds?.[0] || "0",
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
    averageScore: blockchainProject.averageScore,
  };
}

/**
 * Get UI-friendly hackathon status based on pure timeline logic with blockchain timestamps
 */
export function getHackathonStatus(
  hackathon: BlockchainHackathon,
): HackathonPhaseStatus {
  if (!hackathon.isActive) {
    return "cancelled";
  }

  const now = Date.now() / 1000; // Current UTC timestamp in seconds (matches blockchain timestamps)
  const registrationStartDate = Number(hackathon.registrationStartDate);
  const registrationDeadline = Number(hackathon.registrationDeadline);
  const submissionStartDate = Number(hackathon.submissionStartDate);
  const submissionDeadline = Number(hackathon.submissionDeadline);
  const judgingStartDate = Number(hackathon.judgingStartDate);
  const judgingDeadline = Number(hackathon.judgingDeadline);

  // Pure timeline logic: check what phase we're in based on current time vs deadlines

  // Before registration starts
  if (registrationStartDate && now < registrationStartDate) {
    return "upcoming";
  }

  // Registration phase: before registration deadline
  if (now < registrationDeadline) {
    return "registration_open";
  }

  // Between registration deadline and submission start (if there's a gap)
  if (submissionStartDate && now < submissionStartDate) {
    return "submission_not_started";
  }

  // Submission phase: between submission start and submission deadline
  if (now < submissionDeadline) {
    return "submission_open";
  }

  // Between submission deadline and judging start (if there's a gap)
  if (judgingStartDate && now < judgingStartDate) {
    return "submission_closed";
  }

  // Judging phase: between judging start and judging deadline
  if (now < judgingDeadline) {
    return "judging_open";
  }

  // After judging deadline: completed
  return "completed";
}

/**
 * Get project status based on contract data
 */
function getProjectStatusFromContract(
  project: BlockchainProject,
): ProjectStatus {
  if (!project.isCreated) {
    return "draft";
  }

  // We can't determine if it's scored directly anymore
  // This would need to be determined by calling getProjectScore separately
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
    case "submission_not_started":
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
 * Check if a hackathon is in registration phase
 */
export function isInRegistrationPhase(hackathon: BlockchainHackathon): boolean {
  const now = Date.now() / 1000;
  const registrationDeadline = Number(hackathon.registrationDeadline);
  return hackathon.isActive && now < registrationDeadline;
}

/**
 * Check if a hackathon is in submission phase
 */
export function isInSubmissionPhase(hackathon: BlockchainHackathon): boolean {
  const now = Date.now() / 1000;
  const registrationDeadline = Number(hackathon.registrationDeadline);
  const submissionStartDate = Number(hackathon.submissionStartDate);
  const submissionDeadline = Number(hackathon.submissionDeadline);

  // If submissionStartDate is 0 or not set, use registrationDeadline as fallback
  const effectiveSubmissionStart =
    submissionStartDate > 0 ? submissionStartDate : registrationDeadline;

  return (
    hackathon.isActive &&
    now >= effectiveSubmissionStart &&
    now < submissionDeadline
  );
}

/**
 * Check if a hackathon is in judging phase
 */
export function isInJudgingPhase(hackathon: BlockchainHackathon): boolean {
  const now = Date.now() / 1000;
  const submissionDeadline = Number(hackathon.submissionDeadline);
  const judgingStartDate = Number(hackathon.judgingStartDate);
  const judgingDeadline = Number(hackathon.judgingDeadline);

  // If judgingStartDate is 0 or not set, use submissionDeadline as fallback
  const effectiveJudgingStart =
    judgingStartDate > 0 ? judgingStartDate : submissionDeadline;

  return (
    hackathon.isActive && now >= effectiveJudgingStart && now < judgingDeadline
  );
}

/**
 * Check if a user can register for a hackathon
 */
export function canRegister(hackathon: BlockchainHackathon): boolean {
  return isInRegistrationPhase(hackathon);
}

/**
 * Check if a user can submit a project
 */
export function canSubmitProject(hackathon: BlockchainHackathon): boolean {
  return isInSubmissionPhase(hackathon);
}

/**
 * Check if judges can score projects
 */
export function canJudge(hackathon: BlockchainHackathon): boolean {
  return isInJudgingPhase(hackathon);
}
