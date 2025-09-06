"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  ProjectWithHackathon,
  UIProject,
  HackathonRegistrationWithHackathon,
} from "@/types/hackathon";
import { transformProjectToUI } from "@/lib/utils/project";

// Fetch user's projects directly from Supabase
async function fetchUserProjects(): Promise<UIProject[]> {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      hackathon:hackathons(*)
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return (projects || []).map(transformProjectToUI);
}

// Get user's projects
export function useUserProjects() {
  return useQuery({
    queryKey: ["projects", "user"],
    queryFn: fetchUserProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Fetch user's registered hackathons directly from Supabase
async function fetchRegisteredHackathons(): Promise<
  HackathonRegistrationWithHackathon[]
> {
  const supabase = createClient();

  const { data: registrations, error } = await supabase
    .from("hackathon_registrations")
    .select(`
      *,
      hackathon:hackathons(*)
    `)
    .order("registered_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch registered hackathons: ${error.message}`);
  }

  return registrations || [];
}

// Get user's registered hackathons
export function useRegisteredHackathons() {
  return useQuery({
    queryKey: ["hackathons", "registered"],
    queryFn: fetchRegisteredHackathons,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (
        error.message.includes("401") ||
        error.message.includes("Authentication")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Create a new project directly in Supabase
async function createProject(
  projectData: Partial<UIProject>,
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
    .select(`
      *,
      hackathon:hackathons(*)
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return project;
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

// Register for a hackathon directly in Supabase
async function registerForHackathon(hackathonId: string): Promise<void> {
  const supabase = createClient();

  if (!hackathonId?.trim()) {
    throw new Error("hackathonId is required");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to register for hackathon");
  }

  // …rest of implementation…
}
  const { error } = await supabase.from("hackathon_registrations").insert({
    user_id: user.id,
    hackathon_id: hackathonId,
    status: "registered",
  });

  if (error) {
    // Handle duplicate registration gracefully
    if (error.code === "23505") {
      throw new Error("You are already registered for this hackathon");
    }
    throw new Error(`Failed to register for hackathon: ${error.message}`);
  }
}

// Hook for registering for hackathons
export function useRegisterForHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerForHackathon,
    onSuccess: () => {
      // Invalidate and refetch registered hackathons
      queryClient.invalidateQueries({ queryKey: ["hackathons", "registered"] });
    },
    onError: (error) => {
      console.error("Failed to register for hackathon:", error);
    },
  });
}
