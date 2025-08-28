import { z } from "zod";

// Define shared schemas
const urlSchema = z.url("Invalid URL").or(z.literal(""));

// Define the evaluation criteria schema
const evaluationCriteriaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Evaluation criteria name is required"),
  points: z.number().min(1, "Points must be at least 1"),
  description: z.string().min(1, "Description is required"),
});

// Define the prize cohort schema
const prizeCohortSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Prize cohort name is required"),
  numberOfWinners: z.number().min(1, "Number of winners must be at least 1"),
  prizeAmount: z.string().min(1, "Prize amount is required"), // Changed to string for currency formatting
  description: z.string().min(1, "Description is required"),
  evaluationCriteria: z.array(evaluationCriteriaSchema).min(1, "At least one evaluation criteria is required"),
  judgingMode: z.enum(["manual", "automated", "hybrid"]),
  votingMode: z.enum(["public", "private", "judges_only"]),
  maxVotesPerJudge: z.number().min(1, "Max votes per judge must be at least 1"),
});

// Define the judge schema
const judgeSchema = z.object({
  id: z.string().optional(),
  email: z.email("Invalid email address"),
  status: z.enum(["invited", "accepted", "declined"]),
});

// Define the speaker schema
const speakerSchema = z.object({
  name: z.string().min(1, "Speaker name is required"),
  realName: z.string().optional(),
  workplace: z.string().optional(),
  position: z.string().optional(),
  xHandle: z.string().optional(),
  picture: urlSchema,
});

// Define the schedule slot schema
const scheduleSlotSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Schedule slot name is required"),
  description: z.string().min(1, "Description is required"),
  speaker: speakerSchema.optional(),
  dateTime: z.date(),
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
  socialLinks: z.object({
    website: urlSchema,
    discord: urlSchema,
    twitter: urlSchema,
    telegram: urlSchema,
    github: urlSchema,
  }).optional(),
  fullDescription: z.string().min(1, "Full description is required"),
  
  // Prizes step
  prizeCohorts: z.array(prizeCohortSchema).min(1, "At least one prize cohort is required"),
  
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

// Export types
export type HackathonFormData = z.infer<typeof hackathonSchema>;
export type PrizeCohort = z.infer<typeof prizeCohortSchema>;
export type EvaluationCriteria = z.infer<typeof evaluationCriteriaSchema>;
export type Judge = z.infer<typeof judgeSchema>;
export type Speaker = z.infer<typeof speakerSchema>;
export type ScheduleSlot = z.infer<typeof scheduleSlotSchema>;

// Export individual schemas for step-by-step validation
export const overviewStepSchema = hackathonSchema.pick({
  name: true,
  logo: true,
  shortDescription: true,
  registrationStartDate: true,
  registrationEndDate: true,
  hackathonStartDate: true,
  hackathonEndDate: true,
  votingStartDate: true,
  votingEndDate: true,
  techStack: true,
  experienceLevel: true,
  location: true,
  socialLinks: true,
  fullDescription: true,
});

export const prizesStepSchema = hackathonSchema.pick({
  prizeCohorts: true,
});

export const judgesStepSchema = hackathonSchema.pick({
  judges: true,
});

export const scheduleStepSchema = hackathonSchema.pick({
  schedule: true,
});

// Export sub-schemas
export { prizeCohortSchema, evaluationCriteriaSchema, judgeSchema, speakerSchema, scheduleSlotSchema };