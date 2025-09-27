import type { UIProject, ProjectWithHackathon } from "@/types/hackathon";

/**
 * Project utility functions
 */

/**
 * Get the variant for a project status badge
 */
export function getProjectStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "draft":
      return "secondary";
    case "submitted":
      return "default";
    case "in_review":
      return "outline";
    case "completed":
      return "destructive";
    default:
      return "secondary";
  }
}

/**
 * Transform database project to UI project
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

// Note: Database-specific transformations removed since we moved to blockchain approach
