import { z } from "zod";

// Define shared schemas
const urlSchema = z.url("Invalid URL").or(z.literal("")).optional();

// Define the project schema
export const projectSchema = z.object({
  // Overview step
  logo: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  intro: z.string().min(1, "Project intro is required"),
  itchVideo: urlSchema,
  sector: z.string().min(1, "Sector is required"),
  progress: z.enum(["idea", "prototype", "mvp", "beta", "launched"], {
    message: "Progress status is required",
  }),
  fundraisingStatus: z.enum(["not-seeking", "bootstrapping", "pre-seed", "seed", "series-a", "series-b", "series-c", "public"], {
    message: "Fundraising status is required",
  }),
  description: z.string().min(1, "Full description is required"),
  
  // Tech stack step
  githubLink: urlSchema,
  demoVideo: urlSchema,
  techStack: z.array(z.string()).min(1, "At least one tech stack is required"),
  
  // Hackathon selection step
  hackathonIds: z.array(z.string()).min(1, "At least one hackathon must be selected"),
});

// Export types
export type ProjectFormData = z.infer<typeof projectSchema>;

// Export individual schemas for step-by-step validation
export const overviewStepSchema = projectSchema.pick({
  logo: true,
  name: true,
  intro: true,
  itchVideo: true,
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