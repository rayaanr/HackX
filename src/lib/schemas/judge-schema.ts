import { z } from "zod";

// Schema for 10-star rating evaluation
export const judgeRatingSchema = z.object({
  technicalExecution: z
    .number()
    .min(1, "Technical execution rating is required")
    .max(10, "Rating cannot exceed 10 stars"),

  innovation: z
    .number()
    .min(1, "Innovation rating is required")
    .max(10, "Rating cannot exceed 10 stars"),

  usability: z
    .number()
    .min(1, "Usability rating is required")
    .max(10, "Rating cannot exceed 10 stars"),

  marketPotential: z
    .number()
    .min(1, "Market potential rating is required")
    .max(10, "Rating cannot exceed 10 stars"),

  presentation: z
    .number()
    .min(1, "Presentation rating is required")
    .max(10, "Rating cannot exceed 10 stars"),

  overallFeedback: z
    .string()
    .min(10, "Overall feedback must be at least 10 characters")
    .max(2000, "Overall feedback is too long"),

  strengths: z.string().max(1000, "Strengths feedback is too long").optional(),

  improvements: z
    .string()
    .max(1000, "Improvements feedback is too long")
    .optional(),
});

export type JudgeRatingFormData = z.infer<typeof judgeRatingSchema>;

// Default values for the form
export const defaultJudgeRatingValues: JudgeRatingFormData = {
  technicalExecution: 0,
  innovation: 0,
  usability: 0,
  marketPotential: 0,
  presentation: 0,
  overallFeedback: "",
  strengths: "",
  improvements: "",
};

// Evaluation criteria configuration
export const evaluationCriteria = [
  {
    key: "technicalExecution" as const,
    label: "Technical Execution",
    description: "Code quality, architecture, implementation",
  },
  {
    key: "innovation" as const,
    label: "Innovation",
    description: "Originality and creativity of the solution",
  },
  {
    key: "usability" as const,
    label: "Usability",
    description: "User experience and design quality",
  },
  {
    key: "marketPotential" as const,
    label: "Market Potential",
    description: "Commercial viability and impact",
  },
  {
    key: "presentation" as const,
    label: "Presentation",
    description: "Quality of demo and pitch",
  },
];
