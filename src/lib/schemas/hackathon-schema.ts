import { z } from "zod";

// Define shared schemas
export const urlSchema = z.url("Invalid URL").or(z.literal(""));

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
  evaluationCriteria: z
    .array(evaluationCriteriaSchema)
    .min(1, "At least one evaluation criteria is required"),
  judgingMode: z.enum(["manual", "automated", "hybrid"]),
  votingMode: z.enum(["public", "private", "judges_only"]),
  maxVotesPerJudge: z.number().min(1, "Max votes per judge must be at least 1"),
});

// Define the judge schema
const judgeSchema = z.object({
  id: z.string().optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address"),
  status: z.enum(["waiting", "invited", "pending", "accepted", "declined"]),
});

// Define the speaker schema
const speakerSchema = z.object({
  name: z.string().min(1, "Speaker name is required"),
  position: z.string().optional(),
  xName: z.string().optional(),
  xHandle: z.string().optional(),
  picture: urlSchema,
});

// Define the schedule slot schema
const scheduleSlotSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Schedule slot name is required"),
    description: z.string().min(1, "Description is required"),
    speaker: speakerSchema.optional(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    hasSpeaker: z.boolean().optional(),
  })
  .refine((s) => s.startDateTime < s.endDateTime, {
    message: "End time must be after start time",
    path: ["endDateTime"],
  });

// Define period schemas
const periodSchema = z
  .object({
    registrationStartDate: z.date().optional(),
    registrationEndDate: z.date().optional(),
  })
  .refine(
    (data) =>
      !data.registrationStartDate ||
      !data.registrationEndDate ||
      data.registrationStartDate < data.registrationEndDate,
    {
      message: "End date must be after start date",
      path: ["registrationEndDate"],
    },
  );

const hackathonPeriodSchema = z
  .object({
    hackathonStartDate: z.date().optional(),
    hackathonEndDate: z.date().optional(),
  })
  .refine(
    (data) =>
      !data.hackathonStartDate ||
      !data.hackathonEndDate ||
      data.hackathonStartDate < data.hackathonEndDate,
    {
      message: "End date must be after start date",
      path: ["hackathonEndDate"],
    },
  );

const votingPeriodSchema = z
  .object({
    votingStartDate: z.date().optional(),
    votingEndDate: z.date().optional(),
  })
  .refine(
    (data) =>
      !data.votingStartDate ||
      !data.votingEndDate ||
      data.votingStartDate < data.votingEndDate,
    { message: "End date must be after start date", path: ["votingEndDate"] },
  );

// Define the main hackathon schema
export const hackathonSchema = z.object({
  // Overview step
  name: z.string().min(1, "Hackathon name is required"),
  visual: z.string().optional(),
  shortDescription: z.string().min(1, "Short description is required"),
  registrationPeriod: periodSchema,
  hackathonPeriod: hackathonPeriodSchema,
  votingPeriod: votingPeriodSchema,
  techStack: z.array(z.string()).min(1, "At least one tech stack is required"),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced", "all"]),
  location: z.string().min(1, "Location is required"),
  socialLinks: z
    .object({
      website: urlSchema,
      discord: urlSchema,
      twitter: urlSchema,
      telegram: urlSchema,
      github: urlSchema,
    })
    .optional(),
  fullDescription: z.string().min(1, "Full description is required"),

  // Prizes step
  prizeCohorts: z
    .array(prizeCohortSchema)
    .min(1, "At least one prize cohort is required"),

  // Judges step
  judges: z.array(judgeSchema).min(1, "At least one judge is required"),

  // Schedule step
  schedule: z
    .array(scheduleSlotSchema)
    .min(1, "At least one schedule slot is required"),
});

// Validate date consistency
export const validateDateConsistency = (data: any) => {
  const errors: Record<string, string> = {};

  const regStart = data.registrationPeriod?.registrationStartDate;
  const regEnd = data.registrationPeriod?.registrationEndDate;
  const hackStart = data.hackathonPeriod?.hackathonStartDate;
  const hackEnd = data.hackathonPeriod?.hackathonEndDate;
  const voteStart = data.votingPeriod?.votingStartDate;
  const voteEnd = data.votingPeriod?.votingEndDate;

  // Check that hackathon ends before voting starts
  if (hackEnd && voteStart) {
    if (hackEnd >= voteStart) {
      errors["votingPeriod.votingStartDate"] =
        "Voting must start after hackathon ends";
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
  visual: true,
  shortDescription: true,
  registrationPeriod: true,
  hackathonPeriod: true,
  votingPeriod: true,
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
export {
  prizeCohortSchema,
  evaluationCriteriaSchema,
  judgeSchema,
  speakerSchema,
  scheduleSlotSchema,
};
