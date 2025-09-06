import type {
  DatabaseProject,
  UIProject,
  ProjectWithHackathon,
} from "@/types/hackathon";

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
  };
}

/**
 * Transform UI project to database project insert
 */
export function transformUIToProjectInsert(
  project: Partial<UIProject>,
  userId: string,
): Pick<
  DatabaseProject,
  | "name"
  | "description"
  | "hackathon_id"
  | "tech_stack"
  | "status"
  | "repository_url"
  | "demo_url"
  | "team_members"
  | "created_by"
> & { created_by: string } {
  return {
    name: project.name!,
    description: project.description || null,
    hackathon_id: project.hackathon_id || null,
    tech_stack: project.tech_stack || [],
    status: project.status || "draft",
    repository_url: project.repository_url || null,
    demo_url: project.demo_url || null,
    team_members: project.team_members || null,
    created_by: userId,
  };
}
