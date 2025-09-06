import type { Database } from "@/types/supabase";
import type {
  HackathonFormData,
  PrizeCohort,
  Judge,
  ScheduleSlot,
} from "@/lib/schemas/hackathon-schema";

// Database types from Supabase
export type DatabaseHackathon =
  Database["public"]["Tables"]["hackathons"]["Row"];
export type DatabasePrizeCohort =
  Database["public"]["Tables"]["prize_cohorts"]["Row"];
export type DatabaseJudge = Database["public"]["Tables"]["judges"]["Row"];
export type DatabaseScheduleSlot =
  Database["public"]["Tables"]["schedule_slots"]["Row"];
export type DatabaseSpeaker = Database["public"]["Tables"]["speakers"]["Row"];
export type DatabaseEvaluationCriteria =
  Database["public"]["Tables"]["evaluation_criteria"]["Row"];
export type DatabaseProject = Database["public"]["Tables"]["projects"]["Row"];
export type DatabaseHackathonRegistration =
  Database["public"]["Tables"]["hackathon_registrations"]["Row"];

// Extended database hackathon with relations
export interface HackathonWithRelations extends DatabaseHackathon {
  prize_cohorts: (DatabasePrizeCohort & {
    evaluation_criteria: DatabaseEvaluationCriteria[];
  })[];
  judges: DatabaseJudge[];
  schedule_slots: (DatabaseScheduleSlot & {
    speaker: DatabaseSpeaker | null;
  })[];
}

// UI types (for backwards compatibility with existing mock data structure)
export interface UIHackathon {
  id: string;
  name: string;
  visual: string | null;
  shortDescription: string;
  fullDescription: string;
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
    email: string;
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

// Hackathon status type
export type HackathonStatus =
  | "Registration Open"
  | "Registration Closed"
  | "Live"
  | "Voting"
  | "Ended";

// Experience level type
export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "all";

// Judging mode type
export type JudgingMode = "manual" | "automated" | "hybrid";

// Voting mode type
export type VotingMode = "public" | "private" | "judges_only";

// Judge status type
export type JudgeStatus =
  | "waiting"
  | "invited"
  | "pending"
  | "accepted"
  | "declined";

// Re-export schema types for convenience
export type { HackathonFormData, PrizeCohort, Judge, ScheduleSlot };

// API response types
export interface HackathonsResponse {
  data: HackathonWithRelations[];
}

export interface HackathonResponse {
  data: HackathonWithRelations;
}

export interface CreateHackathonResponse {
  success: boolean;
  data?: HackathonWithRelations;
  error?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// Project types
export interface ProjectWithHackathon extends DatabaseProject {
  hackathon: DatabaseHackathon | null;
}

export interface UIProject {
  id: string;
  name: string;
  description: string | null;
  hackathon_name?: string;
  hackathon_id?: string;
  tech_stack: string[];
  status: "draft" | "submitted" | "in_review" | "completed";
  updated_at: string;
  repository_url?: string;
  demo_url?: string;
  team_members?: any[];
}

// Registration types
export interface HackathonRegistrationWithHackathon
  extends DatabaseHackathonRegistration {
  hackathon: DatabaseHackathon;
}

// API response types for projects
export interface ProjectsResponse {
  data: ProjectWithHackathon[];
}

export interface ProjectResponse {
  data: ProjectWithHackathon;
}

export interface RegisteredHackathonsResponse {
  data: HackathonRegistrationWithHackathon[];
}
