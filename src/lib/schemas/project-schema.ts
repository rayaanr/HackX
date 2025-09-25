import { z } from "zod";

// Define the project schema
export const projectSchema = z.object({
  // Overview step
  logo: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  intro: z.string().min(1, "Project intro is required"),
  pitchVideo: z.url("Invalid URL").or(z.literal("")).optional(),
  sector: z.array(z.string()).min(1, "At least one sector is required"),
  progress: z.string().min(1, "Progress description is required"),
  fundraisingStatus: z.string().min(1, "Fundraising status is required"),
  description: z.string().min(1, "Full description is required"),

  // Tech stack step
  githubLink: z.url("Invalid GitHub URL"),
  demoVideo: z.url("Invalid URL"),
  techStack: z.array(z.string()).min(1, "At least one tech stack is required"),

  // Hackathon selection step
  hackathonIds: z
    .array(z.string())
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate hackathons are not allowed",
    ),
});

// Export types
export type ProjectFormData = z.infer<typeof projectSchema>;

// Export individual schemas for step-by-step validation
export const overviewStepSchema = projectSchema.pick({
  logo: true,
  name: true,
  intro: true,
  pitchVideo: true,
  sector: true,
  progress: true,
  fundraisingStatus: true,
  description: true,
});

export const techStackStepSchema = projectSchema.pick({
  githubLink: true,
  demoVideo: true,
  techStack: true,
});

export const hackathonSelectionStepSchema = projectSchema.pick({
  hackathonIds: true,
});
