import { z } from "zod";

// Schema for individual criterion score and feedback
const criterionEvaluationSchema = z.object({
  score: z.number()
    .min(0, "Score cannot be negative")
    .max(100, "Score cannot exceed maximum points"), // Will be dynamically validated
  feedback: z.string()
    .min(1, "Feedback is required for each criterion")
    .max(1000, "Feedback is too long"),
});

// Main judge evaluation schema
export const judgeEvaluationSchema = z.object({
  selectedPrizeCohortId: z.string()
    .min(1, "Please select a prize cohort"),
  
  // Dynamic object where keys are criterion names and values are score/feedback
  criteriaEvaluations: z.record(
    z.string(), // criterion name as key
    criterionEvaluationSchema
  ).refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one criterion must be evaluated" }
  ),
  
  overallFeedback: z.string()
    .min(10, "Overall feedback must be at least 10 characters")
    .max(2000, "Overall feedback is too long"),
});

// Create a function to generate schema with dynamic max scores
export const createJudgeEvaluationSchema = (criteria: Array<{ name: string; points: number }>) => {
  const criteriaValidationSchema = z.record(
    z.string(),
    z.object({
      score: z.number()
        .min(0, "Score cannot be negative"),
      feedback: z.string()
        .min(1, "Feedback is required for each criterion")
        .max(1000, "Feedback is too long"),
    })
  ).superRefine((data, ctx) => {
    // Validate each criterion score against its max points
    criteria.forEach((criterion) => {
      const evaluation = data[criterion.name];
      if (evaluation && evaluation.score > criterion.points) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Score cannot exceed ${criterion.points} points`,
          path: [criterion.name, "score"],
        });
      }
    });
    
    // Ensure all criteria are evaluated
    criteria.forEach((criterion) => {
      if (!data[criterion.name]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This criterion must be evaluated",
          path: [criterion.name],
        });
      }
    });
  });

  return z.object({
    selectedPrizeCohortId: z.string()
      .min(1, "Please select a prize cohort"),
    
    criteriaEvaluations: criteriaValidationSchema,
    
    overallFeedback: z.string()
      .min(10, "Overall feedback must be at least 10 characters")
      .max(2000, "Overall feedback is too long"),
  });
};

export type JudgeEvaluationFormData = z.infer<typeof judgeEvaluationSchema>;

// Helper type for form default values
export type CriterionEvaluation = {
  score: number;
  feedback: string;
};