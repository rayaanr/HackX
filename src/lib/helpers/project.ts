import type { UIProject, ProjectWithHackathon } from "@/types/hackathon";
import type { BlockchainProject } from "@/types/blockchain";

/**
 * Project utility functions
 * Note: Status utilities have been moved to @/lib/helpers/status.ts
 */

/**
 * Transform database project to UI project (legacy support)
 */
export function transformProjectToUI(project: ProjectWithHackathon): UIProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    hackathon_name: project.hackathon?.name,
    hackathon_id: project.hackathon?.id,
    tech_stack: project.tech_stack || [],
    status: (project.status as UIProject["status"]) || "draft",
    updated_at:
      project.updated_at || project.created_at || new Date().toISOString(),
    repository_url: project.repository_url || undefined,
    demo_url: project.demo_url || undefined,
    team_members: project.team_members
      ? Array.isArray(project.team_members)
        ? project.team_members
        : []
      : [],
    created_by: project.created_by,
    created_at: project.created_at,
  };
}

/**
 * Check if a project has been scored by calculating if it has any scores
 * This replaces the old judgeCount field which was removed from the contract
 */
export function hasProjectBeenScored(
  projectScore: { judgeCount: number } | null,
): boolean {
  return projectScore !== null && projectScore.judgeCount > 0;
}

/**
 * Calculate average score from project score data
 * This replaces the old averageScore calculation which was done in the contract
 */
export function calculateAverageScore(
  projectScore: {
    avgScore: number;
    totalScore: number;
    judgeCount: number;
  } | null,
): number | undefined {
  if (!projectScore || projectScore.judgeCount === 0) {
    return undefined;
  }
  // The contract now returns avgScore directly, but we can verify it
  return projectScore.avgScore;
}

/**
 * Get project status with scoring information
 * Enhanced version that works with the new contract structure
 */
export function getProjectStatusWithScoring(
  project: BlockchainProject,
  projectScore: { judgeCount: number } | null,
): "draft" | "submitted" | "scored" {
  if (!project.isCreated) {
    return "draft";
  }

  if (hasProjectBeenScored(projectScore)) {
    return "scored";
  }

  return "submitted";
}

// Note: Database-specific transformations removed since we moved to blockchain approach
