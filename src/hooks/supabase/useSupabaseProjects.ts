"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  ProjectWithHackathon,
  UIProject,
  HackathonRegistrationWithHackathon,
} from "@/types/hackathon";
import { transformProjectToUI } from "@/lib/helpers/project";

// Fetch projects by hackathon ID
async function fetchProjectsByHackathon(
  hackathonId: string
): Promise<UIProject[]> {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .eq("hackathon_id", hackathonId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return (projects || []).map(transformProjectToUI);
}

// Fetch submitted projects by hackathon ID
async function fetchSubmittedProjectsByHackathon(
  hackathonId: string
): Promise<UIProject[]> {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .eq("hackathon_id", hackathonId)
    .eq("status", "submitted")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch submitted projects: ${error.message}`);
  }

  return (projects || []).map(transformProjectToUI);
}

// Fetch project by ID
async function fetchProjectById(projectId: string): Promise<UIProject> {
  const supabase = createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .eq("id", projectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Project not found");
    }
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return transformProjectToUI(project);
}

// Fetch user's projects
async function fetchUserProjects(): Promise<UIProject[]> {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return (projects || []).map(transformProjectToUI);
}

// Create a new project
async function createProject(
  projectData: Partial<UIProject>
): Promise<ProjectWithHackathon> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to create project");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: projectData.name!,
      description: projectData.description || null,
      hackathon_id: projectData.hackathon_id || null,
      tech_stack: projectData.tech_stack || [],
      status: projectData.status || "draft",
      repository_url: projectData.repository_url || null,
      demo_url: projectData.demo_url || null,
      team_members: projectData.team_members || null,
      created_by: user.id,
    })
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return project;
}

// Update a project
async function updateProject({
  projectId,
  projectData,
}: {
  projectId: string;
  projectData: Partial<UIProject>;
}): Promise<ProjectWithHackathon> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to update project");
  }

  // First check if user owns this project
  const { data: existingProject, error: checkError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("created_by", user.id)
    .single();

  if (checkError || !existingProject) {
    throw new Error("Project not found or access denied");
  }

  // Build sparse payload - only include fields that are explicitly provided
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  // Only set fields that are explicitly provided in projectData
  if (projectData.hasOwnProperty("name")) {
    updatePayload.name = projectData.name;
  }
  if (projectData.hasOwnProperty("description")) {
    updatePayload.description = projectData.description;
  }
  if (projectData.hasOwnProperty("hackathon_id")) {
    updatePayload.hackathon_id = projectData.hackathon_id;
  }
  if (projectData.hasOwnProperty("tech_stack")) {
    updatePayload.tech_stack = projectData.tech_stack;
  }
  if (projectData.hasOwnProperty("status")) {
    updatePayload.status = projectData.status;
  }
  if (projectData.hasOwnProperty("repository_url")) {
    updatePayload.repository_url = projectData.repository_url;
  }
  if (projectData.hasOwnProperty("demo_url")) {
    updatePayload.demo_url = projectData.demo_url;
  }
  if (projectData.hasOwnProperty("team_members")) {
    updatePayload.team_members = projectData.team_members;
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("id", projectId)
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return project;
}

// Delete a project
async function deleteProject(projectId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to delete project");
  }

  const { data: deletedProject, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("created_by", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete project"
    );
  }

  if (!deletedProject) {
    throw new Error("Project not found or access denied");
  }
}

// Fetch hackathons that a project was submitted to
async function fetchProjectHackathons(projectId: string): Promise<any[]> {
  const supabase = createClient();

  const { data: submissions, error } = await supabase
    .from("project_hackathon_submissions")
    .select(
      `
      *,
      hackathon:hackathons(
        id,
        name,
        short_description,
        location,
        experience_level,
        hackathon_start_date,
        hackathon_end_date,
        tech_stack,
        prize_cohorts(
          name,
          prize_amount,
          description
        )
      )
    `
    )
    .eq("project_id", projectId)
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch project hackathons: ${error.message}`);
  }

  return submissions || [];
}

// Submit project to hackathon
async function submitProjectToHackathon({
  projectId,
  hackathonId,
}: {
  projectId: string;
  hackathonId: string;
}): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to submit project");
  }

  const { error } = await supabase
    .from("project_hackathon_submissions")
    .insert({
      project_id: projectId,
      hackathon_id: hackathonId,
      user_id: user.id,
      status: "submitted",
    });

  if (error) {
    // Handle duplicate submission gracefully
    if (error.code === "23505") {
      throw new Error("Project already submitted to this hackathon");
    }
    throw new Error(`Failed to submit project: ${error.message}`);
  }
}

// HOOKS

// Get projects by hackathon ID
export function useProjectsByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: ["projects", "by-hackathon", hackathonId],
    queryFn: () => fetchProjectsByHackathon(hackathonId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!hackathonId, // Only run when hackathonId is available
  });
}

// Get submitted projects by hackathon ID
export function useSubmittedProjectsByHackathon(hackathonId: string) {
  return useQuery({
    queryKey: ["projects", "submitted", "by-hackathon", hackathonId],
    queryFn: () => fetchSubmittedProjectsByHackathon(hackathonId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!hackathonId, // Only run when hackathonId is available
  });
}

// Get project by ID
export function useProjectById(projectId: string) {
  return useQuery({
    queryKey: ["projects", "by-id", projectId],
    queryFn: () => fetchProjectById(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on not found errors
      if (error?.message?.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!projectId, // Only run when projectId is available
  });
}

// Get user's projects
export function useUserProjects() {
  return useQuery({
    queryKey: ["projects", "user"],
    queryFn: fetchUserProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors - safely check error message
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

// Hook to get hackathons that a project was submitted to
export function useProjectHackathons(projectId: string) {
  return useQuery({
    queryKey: ["projects", "hackathons", projectId],
    queryFn: () => fetchProjectHackathons(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!projectId, // Only run when projectId is available
  });
}

// Hook for creating projects
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects", "user"] });
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    },
  });
}

// Hook for updating projects
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (data) => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects", "user"] });
      queryClient.invalidateQueries({
        queryKey: ["projects", "by-id", data.id],
      });
      if (data.hackathon_id) {
        queryClient.invalidateQueries({
          queryKey: ["projects", "by-hackathon", data.hackathon_id],
        });
      }
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
    },
  });
}

// Hook for deleting projects
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects", "user"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
    },
  });
}

// Hook for submitting projects to hackathons
export function useSubmitProjectToHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitProjectToHackathon,
    onSuccess: (_, { projectId, hackathonId }) => {
      // Invalidate project hackathons and hackathon projects
      queryClient.invalidateQueries({
        queryKey: ["projects", "hackathons", projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", "by-hackathon", hackathonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", "submitted", "by-hackathon", hackathonId],
      });
    },
    onError: (error) => {
      console.error("Failed to submit project:", error);
    },
  });
}
