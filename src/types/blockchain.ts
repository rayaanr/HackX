// Blockchain-specific types based on contract ABI and metadata structure

// Contract enums and constants
export enum ContractPhase {
  REGISTRATION = 0,
  SUBMISSION = 1,
  JUDGING = 2,
  COMPLETED = 3,
}

export const PHASE_LABELS: Record<ContractPhase, string> = {
  [ContractPhase.REGISTRATION]: "Registration Open",
  [ContractPhase.SUBMISSION]: "Submission Phase",
  [ContractPhase.JUDGING]: "Judging Phase",
  [ContractPhase.COMPLETED]: "Completed",
};

// Raw contract types (matching ABI)
export interface ContractHackathon {
  id: bigint;
  ipfsHash: string;
  organizer: string; // address
  currentPhase: ContractPhase;
  registrationDeadline: bigint; // timestamp
  submissionDeadline: bigint; // timestamp
  judgingDeadline: bigint; // timestamp
  isActive: boolean;
}

export interface ContractProject {
  id: bigint;
  hackathonId: bigint;
  ipfsHash: string;
  creator: string; // address
  isSubmitted: boolean;
  totalScore: bigint;
  judgeCount: bigint;
}

export interface ContractProjectScore {
  avgScore: bigint;
  totalScore: bigint;
  judgeCount: bigint;
}

// IPFS Metadata types (stored off-chain)
export interface HackathonMetadata {
  name: string;
  shortDescription: string;
  fullDescription: string;
  location: string;
  visual?: string; // IPFS hash for banner/logo
  techStack: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced" | "all";
  socialLinks: {
    website?: string;
    discord?: string;
    twitter?: string;
    telegram?: string;
    github?: string;
  };
  registrationPeriod: {
    registrationStartDate?: string; // ISO string
    registrationEndDate?: string;
  };
  hackathonPeriod: {
    hackathonStartDate?: string;
    hackathonEndDate?: string;
  };
  votingPeriod: {
    votingStartDate?: string;
    votingEndDate?: string;
  };
  prizeCohorts: PrizeCohortMetadata[];
  judges: JudgeMetadata[];
  schedule: ScheduleSlotMetadata[];
  createdAt: string; // ISO string
  version: string; // e.g., "1.0.0"
  uploadedAt: string; // ISO string
  type: "hackathon-metadata";
}

export interface PrizeCohortMetadata {
  name: string;
  numberOfWinners: number;
  prizeAmount: string;
  description: string;
  judgingMode: "manual" | "automated" | "hybrid";
  votingMode: "public" | "private" | "judges_only";
  maxVotesPerJudge: number;
  evaluationCriteria: EvaluationCriteriaMetadata[];
}

export interface EvaluationCriteriaMetadata {
  name: string;
  points: number;
  description: string;
}

export interface JudgeMetadata {
  address: string; // EVM address
  status: "waiting" | "invited" | "pending" | "accepted" | "declined";
}

export interface ScheduleSlotMetadata {
  name: string;
  description: string;
  startDateTime: string; // ISO string
  endDateTime: string;
  hasSpeaker: boolean;
  speaker?: SpeakerMetadata;
}

export interface SpeakerMetadata {
  name: string;
  position?: string;
  xName?: string;
  xHandle?: string;
  picture?: string; // URL or IPFS hash
}

// Project metadata stored on IPFS
export interface ProjectMetadata {
  name: string;
  description: string;
  techStack: string[];
  repositoryUrl?: string;
  demoUrl?: string;
  teamMembers: TeamMemberMetadata[];
  sector?: string[];
  createdAt: string; // ISO string
  version: string;
  uploadedAt: string;
  type: "project-metadata";
}

export interface TeamMemberMetadata {
  name: string;
  role: string;
  address?: string; // EVM address if available
}

// Participant registration metadata
export interface ParticipantMetadata {
  address: string; // EVM address
  registeredAt: string; // ISO string
  profileData?: {
    name?: string;
    bio?: string;
    skills?: string[];
    github?: string;
    twitter?: string;
  };
  version: string;
  uploadedAt: string;
  type: "participant-metadata";
}

// Judge evaluation metadata
export interface JudgeEvaluationMetadata {
  projectId: string; // project ID
  judgeAddress: string; // EVM address
  hackathonId: string; // hackathon ID
  score: number; // 1-100
  criteria: {
    [criteriaName: string]: {
      score: number;
      feedback?: string;
    };
  };
  overallFeedback?: string;
  submittedAt: string; // ISO string
  version: string;
  uploadedAt: string;
  type: "judge-evaluation-metadata";
}

// Combined types for UI consumption (contract + metadata)
export interface BlockchainHackathon extends ContractHackathon {
  metadata?: HackathonMetadata;
  // Computed properties
  participantCount?: number;
  projectCount?: number;
  judges?: string[]; // array of judge addresses
  participants?: string[]; // array of participant addresses
  projects?: bigint[]; // array of project IDs
}

export interface BlockchainProject extends ContractProject {
  metadata?: ProjectMetadata;
  // Computed properties
  hackathonMetadata?: HackathonMetadata;
  averageScore?: number; // calculated from totalScore/judgeCount
}

// API response types
export interface BlockchainHackathonsResponse {
  hackathons: BlockchainHackathon[];
  total: number;
}

export interface BlockchainProjectsResponse {
  projects: BlockchainProject[];
  total: number;
}

// Transaction result types
export interface CreateHackathonResult {
  success: boolean;
  hackathonId?: bigint;
  transactionHash?: string;
  error?: string;
}

export interface SubmitProjectResult {
  success: boolean;
  projectId?: bigint;
  transactionHash?: string;
  error?: string;
}

export interface RegisterParticipantResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface SubmitScoreResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Contract interaction types
export interface ContractWriteOptions {
  gasLimit?: bigint;
  gasPrice?: bigint;
  value?: bigint;
}

// Event types (for listening to contract events)
export interface HackathonCreatedEvent {
  hackathonId: bigint;
  organizer: string;
  ipfsHash: string;
  blockNumber: number;
  transactionHash: string;
}

export interface ProjectSubmittedEvent {
  hackathonId: bigint;
  projectId: bigint;
  creator: string;
  ipfsHash: string;
  blockNumber: number;
  transactionHash: string;
}

export interface ParticipantRegisteredEvent {
  hackathonId: bigint;
  participant: string;
  ipfsHash: string;
  blockNumber: number;
  transactionHash: string;
}

export interface ScoreSubmittedEvent {
  hackathonId: bigint;
  projectId: bigint;
  judge: string;
  score: bigint;
  ipfsHash: string;
  blockNumber: number;
  transactionHash: string;
}

export interface JudgeAddedEvent {
  hackathonId: bigint;
  judge: string;
  blockNumber: number;
  transactionHash: string;
}

export interface PhaseChangedEvent {
  hackathonId: bigint;
  newPhase: ContractPhase;
  blockNumber: number;
  transactionHash: string;
}

// Utility types for transformations
export interface DatePeriod {
  startDate?: Date;
  endDate?: Date;
}

export interface TransformOptions {
  includeMetadata?: boolean;
  resolveParticipants?: boolean;
  resolveProjects?: boolean;
  resolveJudges?: boolean;
}

// Error types
export interface BlockchainError {
  code: string;
  message: string;
  data?: any;
  transactionHash?: string;
}

// Status types for UI
export type HackathonPhaseStatus =
  | "upcoming"
  | "registration_open"
  | "registration_closed"
  | "submission_open"
  | "submission_closed"
  | "judging_open"
  | "judging_closed"
  | "completed"
  | "cancelled";

export type ProjectStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "scored"
  | "completed";

// Smart contract constants
export const CONTRACT_CONSTANTS = {
  MIN_SCORE: 1,
  MAX_SCORE: 100,
  MIN_DEADLINE_BUFFER: 3600, // 1 hour in seconds
} as const;

// IPFS constants
export const IPFS_CONSTANTS = {
  GATEWAY_URL: "https://ipfs.io/ipfs/",
  PINNING_SERVICE: "pinata", // or "web3storage", etc.
} as const;
