"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { JudgeEvaluationFormData } from "@/lib/schemas/judge-evaluation-schema";

// Define types for judging operations
interface JudgeEvaluation {
  id: string;
  project_id: string;
  judge_id: string;
  hackathon_id: string;
  prize_cohort_id: string;
  criteria_evaluations: Record<string, { score: number; feedback: string }>;
  overall_feedback: string;
  total_score: number;
  created_at: string;
  updated_at: string;
}

interface JudgeAssignment {
  id: string;
  judge_id: string;
  hackathon_id: string;
  prize_cohort_id: string;
  status: "pending" | "accepted" | "declined";
  assigned_at: string;
}

interface ProjectWithEvaluations {
  id: string;
  name: string;
  description: string;
  hackathon_id: string;
  evaluations: JudgeEvaluation[];
}

// Fetch judge assignments for current user
async function fetchJudgeAssignments(): Promise<JudgeAssignment[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch judge assignments");
  }

  const { data: assignments, error } = await supabase
    .from("judge_assignments")
    .select(
      `
      *,
      hackathon:hackathons(*),
      prize_cohort:prize_cohorts(*)
    `
    )
    .eq("judge_email", user.email)
    .order("assigned_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch judge assignments: ${error.message}`);
  }

  return assignments || [];
}

// Accept or decline a judge assignment
async function updateJudgeAssignmentStatus({
  assignmentId,
  status,
}: {
  assignmentId: string;
  status: "accepted" | "declined";
}): Promise<JudgeAssignment> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to update assignment status");
  }

  const { data: assignment, error } = await supabase
    .from("judge_assignments")
    .update({ status })
    .eq("id", assignmentId)
    .eq("judge_email", user.email)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update assignment status: ${error.message}`);
  }

  return assignment;
}

// Fetch projects to evaluate for a specific hackathon and prize cohort
async function fetchProjectsToEvaluate({
  hackathonId,
  prizeCohortId,
}: {
  hackathonId: string;
  prizeCohortId: string;
}): Promise<ProjectWithEvaluations[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch projects");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      evaluations:judge_evaluations(
        *,
        judge:judges(*)
      )
    `
    )
    .eq("hackathon_id", hackathonId)
    .eq("status", "submitted")
    .eq("evaluations.prize_cohort_id", prizeCohortId)
    .eq("evaluations.judge_id", user.id);

  if (error) {
    throw new Error(`Failed to fetch projects to evaluate: ${error.message}`);
  }

  return projects || [];
}

// Create or update a judge evaluation
async function submitJudgeEvaluation({
  projectId,
  hackathonId,
  evaluationData,
}: {
  projectId: string;
  hackathonId: string;
  evaluationData: JudgeEvaluationFormData;
}): Promise<JudgeEvaluation> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to submit evaluation");
  }

  // Calculate total score
  const totalScore = Object.values(evaluationData.criteriaEvaluations).reduce(
    (sum, criteria) => sum + criteria.score,
    0
  );

  // Check if evaluation already exists
  const { data: existingEvaluation, error: checkError } = await supabase
    .from("judge_evaluations")
    .select("id")
    .eq("project_id", projectId)
    .eq("judge_email", user.email)
    .eq("prize_cohort_id", evaluationData.selectedPrizeCohortId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error(
      `Failed to check existing evaluation: ${checkError.message}`
    );
  }

  const evaluationPayload = {
    project_id: projectId,
    judge_email: user.email,
    hackathon_id: hackathonId,
    prize_cohort_id: evaluationData.selectedPrizeCohortId,
    criteria_evaluations: evaluationData.criteriaEvaluations,
    overall_feedback: evaluationData.overallFeedback,
    total_score: totalScore,
  };

  if (existingEvaluation) {
    // Update existing evaluation
    const { data: evaluation, error } = await supabase
      .from("judge_evaluations")
      .update(evaluationPayload)
      .eq("id", existingEvaluation.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update evaluation: ${error.message}`);
    }

    return evaluation;
  } else {
    // Create new evaluation
    const { data: evaluation, error } = await supabase
      .from("judge_evaluations")
      .insert(evaluationPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create evaluation: ${error.message}`);
    }

    return evaluation;
  }
}

// Fetch existing evaluation for a project
async function fetchProjectEvaluation({
  projectId,
  prizeCohortId,
}: {
  projectId: string;
  prizeCohortId: string;
}): Promise<JudgeEvaluation | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch evaluation");
  }

  const { data: evaluation, error } = await supabase
    .from("judge_evaluations")
    .select("*")
    .eq("project_id", projectId)
    .eq("judge_email", user.email)
    .eq("prize_cohort_id", prizeCohortId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch evaluation: ${error.message}`);
  }

  return evaluation || null;
}

// Fetch all evaluations for a hackathon (for hackathon organizers)
async function fetchHackathonEvaluations(
  hackathonId: string
): Promise<JudgeEvaluation[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch evaluations");
  }

  // First check if user is the hackathon owner
  const { data: hackathon, error: hackathonError } = await supabase
    .from("hackathons")
    .select("created_by")
    .eq("id", hackathonId)
    .single();

  if (hackathonError || hackathon.created_by !== user.id) {
    throw new Error(
      "Access denied: Only hackathon organizers can view all evaluations"
    );
  }

  const { data: evaluations, error } = await supabase
    .from("judge_evaluations")
    .select(
      `
      *,
      project:projects(*),
      prize_cohort:prize_cohorts(*)
    `
    )
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch hackathon evaluations: ${error.message}`);
  }

  return evaluations || [];
}

// Calculate final scores and rankings for a hackathon
async function calculateHackathonRankings(hackathonId: string): Promise<any[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to calculate rankings");
  }

  // First check if user is the hackathon owner
  const { data: hackathon, error: hackathonError } = await supabase
    .from("hackathons")
    .select("created_by")
    .eq("id", hackathonId)
    .single();

  if (hackathonError || hackathon.created_by !== user.id) {
    throw new Error(
      "Access denied: Only hackathon organizers can calculate rankings"
    );
  }

  // This would involve complex aggregation - for now, return a simplified version
  const { data: evaluations, error } = await supabase
    .from("judge_evaluations")
    .select(
      `
      project_id,
      prize_cohort_id,
      total_score,
      project:projects(name, description),
      prize_cohort:prize_cohorts(name)
    `
    )
    .eq("hackathon_id", hackathonId);

  if (error) {
    throw new Error(
      `Failed to fetch evaluations for ranking: ${error.message}`
    );
  }

  // Group by project and prize cohort, calculate average scores
  const projectScores: Record<string, any> = {};

  evaluations?.forEach((evaluation) => {
    const key = `${evaluation.project_id}-${evaluation.prize_cohort_id}`;
    if (!projectScores[key]) {
      projectScores[key] = {
        project_id: evaluation.project_id,
        prize_cohort_id: evaluation.prize_cohort_id,
        project: evaluation.project,
        prize_cohort: evaluation.prize_cohort,
        scores: [],
        average_score: 0,
      };
    }
    projectScores[key].scores.push(evaluation.total_score);
  });

  // Calculate averages and sort
  const rankings = Object.values(projectScores)
    .map((projectScore: any) => ({
      ...projectScore,
      average_score:
        projectScore.scores.reduce((a: number, b: number) => a + b, 0) /
        projectScore.scores.length,
      judge_count: projectScore.scores.length,
    }))
    .sort((a, b) => b.average_score - a.average_score);

  return rankings;
}

// HOOKS

// Get judge assignments for current user
export function useJudgeAssignments() {
  return useQuery({
    queryKey: ["judge", "assignments"],
    queryFn: fetchJudgeAssignments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Authentication")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Get projects to evaluate for a hackathon and prize cohort
export function useProjectsToEvaluate({
  hackathonId,
  prizeCohortId,
}: {
  hackathonId: string;
  prizeCohortId: string;
}) {
  return useQuery({
    queryKey: ["judge", "projects", hackathonId, prizeCohortId],
    queryFn: () => fetchProjectsToEvaluate({ hackathonId, prizeCohortId }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    enabled: !!(hackathonId && prizeCohortId),
  });
}

// Get existing evaluation for a project
export function useProjectEvaluation({
  projectId,
  prizeCohortId,
}: {
  projectId: string;
  prizeCohortId: string;
}) {
  return useQuery({
    queryKey: ["judge", "evaluation", projectId, prizeCohortId],
    queryFn: () => fetchProjectEvaluation({ projectId, prizeCohortId }),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    enabled: !!(projectId && prizeCohortId),
  });
}

// Get all evaluations for a hackathon (organizers only)
export function useHackathonEvaluations(hackathonId: string) {
  return useQuery({
    queryKey: ["hackathon", "evaluations", hackathonId],
    queryFn: () => fetchHackathonEvaluations(hackathonId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth/access errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Authentication") ||
        errorMessage.includes("Access denied")
      ) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!hackathonId,
  });
}

// Get rankings for a hackathon (organizers only)
export function useHackathonRankings(hackathonId: string) {
  return useQuery({
    queryKey: ["hackathon", "rankings", hackathonId],
    queryFn: () => calculateHackathonRankings(hackathonId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth/access errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Authentication") ||
        errorMessage.includes("Access denied")
      ) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!hackathonId,
  });
}

// Hook for updating judge assignment status
export function useUpdateJudgeAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateJudgeAssignmentStatus,
    onSuccess: () => {
      // Invalidate judge assignments
      queryClient.invalidateQueries({ queryKey: ["judge", "assignments"] });
    },
    onError: (error) => {
      console.error("Failed to update assignment status:", error);
    },
  });
}

// Hook for submitting judge evaluations
export function useSubmitJudgeEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitJudgeEvaluation,
    onSuccess: (data, { projectId, hackathonId, evaluationData }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [
          "judge",
          "evaluation",
          projectId,
          evaluationData.selectedPrizeCohortId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["hackathon", "evaluations", hackathonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hackathon", "rankings", hackathonId],
      });
    },
    onError: (error) => {
      console.error("Failed to submit evaluation:", error);
    },
  });
}
