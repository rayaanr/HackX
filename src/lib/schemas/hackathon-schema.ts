import { z } from "zod";

// Define the prize cohort schema
const prizeCohortSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Prize cohort name is required"),
  numberOfWinners: z.number().min(1, "Number of winners must be at least 1"),
  prizeAmount: z.number().min(0, "Prize amount must be positive"),
  description: z.string().min(1, "Description is required"),
  evaluationCriteria: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Evaluation criteria name is required"),
      points: z.number().min(1, "Points must be at least 1"),
      description: z.string().min(1, "Description is required"),
    })
  ).min(1, "At least one evaluation criteria is required"),
});

// Define the judge schema
const judgeSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email address"),
  status: z.enum(["invited", "accepted", "declined"]).default("invited"),
});

// Define the schedule slot schema
const scheduleSlotSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Schedule slot name is required"),
  description: z.string().min(1, "Description is required"),
  speaker: z.object({
    name: z.string().min(1, "Speaker name is required"),
    realName: z.string().min(1, "Speaker real name is required"),
    workplace: z.string().min(1, "Workplace is required"),
    position: z.string().min(1, "Position is required"),
    xHandle: z.string().optional(),
    picture: z.string().optional(),
  }),
  dateTime: z.date({
    message: "Date and time are required",
  }),
});

// Define the main hackathon schema
export const hackathonSchema = z.object({
  // Overview step
  name: z.string().min(1, "Hackathon name is required"),
  logo: z.string().optional(),
  shortDescription: z.string().min(1, "Short description is required"),
  registrationStartDate: z.date({
    message: "Registration start date is required",
  }),
  registrationEndDate: z.date({
    message: "Registration end date is required",
  }),
  hackathonStartDate: z.date({
    message: "Hackathon start date is required",
  }),
  hackathonEndDate: z.date({
    message: "Hackathon end date is required",
  }),
  votingStartDate: z.date({
    message: "Voting start date is required",
  }),
  votingEndDate: z.date({
    message: "Voting end date is required",
  }),
  techStack: z.array(z.string()).min(1, "At least one tech stack is required"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced", "all"]),
  location: z.string().min(1, "Location is required"),
  socialLinks: z.array(z.string().url("Invalid URL")).optional(),
  fullDescription: z.string().min(1, "Full description is required"),
  
  // Prizes step
  prizeCohorts: z.array(prizeCohortSchema).min(1, "At least one prize cohort is required"),
  judgingMode: z.enum(["manual", "automated", "hybrid"]),
  votingMode: z.enum(["public", "private", "judges_only"]),
  maxVotesPerJudge: z.number().min(1, "Max votes per judge must be at least 1"),
  
  // Judges step
  judges: z.array(judgeSchema).min(1, "At least one judge is required"),
  
  // Schedule step
  schedule: z.array(scheduleSlotSchema).min(1, "At least one schedule slot is required"),
});

// Validate date consistency
export const validateDateConsistency = (data: any) => {
  const errors: Record<string, string> = {};
  
  if (data.registrationStartDate && data.registrationEndDate) {
    if (data.registrationStartDate >= data.registrationEndDate) {
      errors.registrationEndDate = "Registration end date must be after start date";
    }
  }
  
  if (data.hackathonStartDate && data.hackathonEndDate) {
    if (data.hackathonStartDate >= data.hackathonEndDate) {
      errors.hackathonEndDate = "Hackathon end date must be after start date";
    }
  }
  
  if (data.votingStartDate && data.votingEndDate) {
    if (data.votingStartDate >= data.votingEndDate) {
      errors.votingEndDate = "Voting end date must be after start date";
    }
  }
  
  // Check that registration ends before hackathon starts
  if (data.registrationEndDate && data.hackathonStartDate) {
    if (data.registrationEndDate >= data.hackathonStartDate) {
      errors.hackathonStartDate = "Hackathon must start after registration ends";
    }
  }
  
  // Check that hackathon ends before voting starts
  if (data.hackathonEndDate && data.votingStartDate) {
    if (data.hackathonEndDate >= data.votingStartDate) {
      errors.votingStartDate = "Voting must start after hackathon ends";
    }
  }
  
  return errors;
};

export type HackathonFormData = z.infer<typeof hackathonSchema>;
export type PrizeCohort = z.infer<typeof prizeCohortSchema>;
export type Judge = z.infer<typeof judgeSchema>;
export type ScheduleSlot = z.infer<typeof scheduleSlotSchema>;