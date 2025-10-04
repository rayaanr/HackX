import type {
  HackathonFormData,
  PrizeCohort,
  Judge,
  ScheduleSlot,
} from "@/lib/schemas/hackathon-schema";

// Import blockchain types
import type {
  BlockchainHackathon,
  BlockchainProject,
  HackathonMetadata,
  ProjectMetadata,
  HackathonPhaseStatus,
  ProjectStatus,
} from "@/types/blockchain";

// Re-export blockchain types for convenience
export type {
  BlockchainHackathon,
  BlockchainProject,
  HackathonMetadata,
  ProjectMetadata,
  HackathonPhaseStatus,
  ProjectStatus,
} from "@/types/blockchain";

// Blockchain-compatible types (no more database types)
export interface HackathonWithRelations {
  id: string;
  name: string;
  visual: string | null;
  short_description: string;
  full_description: string;
  location: string;
  tech_stack: string[];
  experience_level: string;
  registration_start_date: string | null;
  registration_end_date: string;
  hackathon_start_date: string | null;
  hackathon_end_date: string;
  voting_start_date: string | null;
  voting_end_date: string;
  social_links: Record<string, string | undefined>;
  created_by: string; // wallet address
  created_at: string;
  updated_at: string;
  participant_count?: number | null;
  prize_cohorts: {
    id: string;
    name: string;
    number_of_winners: number;
    prize_amount: string;
    description: string;
    judging_mode: string;
    voting_mode: string;
    max_votes_per_judge: number;
    evaluation_criteria: {
      name: string;
      points: number;
      description: string;
    }[];
  }[];
  judges: {
    address: string;
    status: string;
  }[];
  schedule_slots: {
    name: string;
    description: string;
    start_date_time: string;
    end_date_time: string;
    has_speaker: boolean;
    speaker?: {
      name: string;
      position?: string;
      x_name?: string;
      x_handle?: string;
      picture?: string;
    };
  }[];
  // Blockchain specific fields
  currentPhase?: number;
  isActive?: boolean;
}

// UI types (for backwards compatibility with existing mock data structure)
export interface UIHackathon {
  id: string;
  name: string;
  visual: string | null;
  shortDescription: string;
  fullDescription: string;
  participantCount?: number;
  location: string;
  techStack: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced" | "all";
  registrationPeriod: {
    registrationStartDate?: Date;
    registrationEndDate?: Date;
  };
  hackathonPeriod: {
    hackathonStartDate?: Date;
    hackathonEndDate?: Date;
  };
  votingPeriod: {
    votingStartDate?: Date;
    votingEndDate?: Date;
  } | null;
  socialLinks: Record<string, string | undefined>;
  prizeCohorts: {
    id: string;
    name: string;
    numberOfWinners: number;
    prizeAmount: string;
    description: string;
    judgingMode: "manual" | "automated" | "hybrid";
    votingMode: "public" | "private" | "judges_only";
    maxVotesPerJudge: number;
    evaluationCriteria: {
      name: string;
      points: number;
      description: string;
    }[];
  }[];
  judges: {
    address: string;
    status: "waiting" | "invited" | "pending" | "accepted" | "declined";
  }[];
  schedule: {
    name: string;
    description: string;
    startDateTime: Date;
    endDateTime: Date;
    hasSpeaker: boolean;
    speaker?: {
      name: string;
      position?: string;
      xName?: string;
      xHandle?: string;
      picture?: string;
    };
  }[];
}

// Dashboard statistics type
export interface DashboardStats {
  totalHackathons: number;
  activeHackathons: number;
  completedHackathons: number;
  totalPrizeValue: string;
}

// Legacy types - use blockchain types for new development
export type HackathonStatus =
  | "Coming Soon"
  | "Registration Open"
  | "Registration Closed"
  | "Submission Starting"
  | "Live"
  | "Submission Ended"
  | "Judging Starting"
  | "Voting"
  | "Ended";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "all";
export type JudgingMode = "manual" | "automated" | "hybrid";
export type VotingMode = "public" | "private" | "judges_only";
export type JudgeStatus =
  | "waiting"
  | "invited"
  | "pending"
  | "accepted"
  | "declined";

// Re-export schema types for convenience
export type { HackathonFormData, PrizeCohort, Judge, ScheduleSlot };
export type { ProjectFormData } from "@/lib/schemas/project-schema";

// Common component prop types
export interface ProjectComponentProps {
  name: string;
  description: string | null;
  demo_url?: string | null;
  repository_url?: string | null;
  team_members?: any[] | null;
  tech_stack: string[];
  status: string;
  sector?: string[];
}

export interface HackathonComponentProps {
  name: string;
  participantCount?: number;
}

// Legacy API response types (kept for backward compatibility)
export interface CreateHackathonResponse {
  success: boolean;
  data?: HackathonWithRelations;
  error?: string;
}

// Project types - blockchain compatible
export interface ProjectWithHackathon {
  id: string;
  name: string;
  description: string | null;
  hackathon_id: string;
  tech_stack: string[];
  status: "draft" | "submitted" | "in_review" | "completed";
  repository_url: string | null;
  demo_url: string | null;
  team_members: any[] | null;
  created_by: string; // wallet address
  created_at: string;
  updated_at: string;
  totalScore?: number;
  judgeCount?: number;
  averageScore?: number;
  hackathon?: {
    id: string;
    name: string;
    short_description: string;
    location: string;
    experience_level: string;
    hackathon_start_date: string | null;
    hackathon_end_date: string;
    tech_stack: string[];
    registration_start_date?: string | null;
    registration_end_date?: string | null;
    voting_start_date?: string | null;
    voting_end_date?: string | null;
  } | null;
}

export interface UIProject {
  id: string;
  name: string;
  intro?: string | null;
  description: string | null;
  logo?: string | null;
  hackathon_name?: string;
  hackathon_id?: string;
  tech_stack: string[];
  status: "draft" | "submitted" | "in_review" | "completed";
  updated_at: string;
  repository_url?: string | null;
  demo_url?: string | null;
  team_members?: any[] | null;
  created_by: string; // wallet address
  created_at: string;
  totalScore?: number;
  judgeCount?: number;
  averageScore?: number;
  hackathon?: {
    id: string;
    name: string;
    short_description: string;
    location: string;
    experience_level: string;
    hackathon_start_date: string | null;
    hackathon_end_date: string;
    tech_stack: string[];
    registration_start_date?: string | null;
    registration_end_date?: string | null;
    voting_start_date?: string | null;
    voting_end_date?: string | null;
  } | null;
}

// Registration types - simplified for blockchain
export interface HackathonRegistrationWithHackathon {
  id: string;
  user_id: string; // wallet address
  hackathon_id: string;
  status: string;
  registered_at: string;
  hackathon: {
    id: string;
    name: string;
    visual?: string | null;
    short_description: string;
    location: string;
    experience_level: string;
    hackathon_start_date: string | null;
    hackathon_end_date: string;
    tech_stack: string[];
    registration_start_date?: string | null;
    registration_end_date?: string | null;
    voting_start_date?: string | null;
    voting_end_date?: string | null;
  };
}
