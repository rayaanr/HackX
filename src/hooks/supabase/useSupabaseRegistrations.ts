"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { HackathonRegistrationWithHackathon } from "@/types/hackathon";

// Fetch user's registered hackathons
async function fetchRegisteredHackathons(): Promise<
  HackathonRegistrationWithHackathon[]
> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch registered hackathons");
  }

  const { data: registrations, error } = await supabase
    .from("hackathon_registrations")
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch registered hackathons: ${error.message}`);
  }

  return registrations || [];
}

// Register for a hackathon
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

// Unregister from a hackathon
async function unregisterFromHackathon(hackathonId: string): Promise<void> {
  const supabase = createClient();

  if (!hackathonId?.trim()) {
    throw new Error("hackathonId is required");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to unregister from hackathon");
  }

  const { error } = await supabase
    .from("hackathon_registrations")
    .delete()
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId);

  if (error) {
    throw new Error(`Failed to unregister from hackathon: ${error.message}`);
  }
}

// Check if user is registered for a hackathon
async function checkHackathonRegistration(
  hackathonId: string
): Promise<boolean> {
  const supabase = createClient();

  if (!hackathonId?.trim()) {
    throw new Error("hackathonId is required");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false; // Not authenticated, so not registered
  }

  const { data: registration, error } = await supabase
    .from("hackathon_registrations")
    .select("id")
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to check registration status: ${error.message}`);
  }

  return !!registration;
}

// Fetch registration details for a hackathon
async function fetchHackathonRegistration(
  hackathonId: string
): Promise<HackathonRegistrationWithHackathon | null> {
  const supabase = createClient();

  if (!hackathonId?.trim()) {
    throw new Error("hackathonId is required");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch registration details");
  }

  const { data: registration, error } = await supabase
    .from("hackathon_registrations")
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch registration details: ${error.message}`);
  }

  return registration || null;
}

// Update registration status
async function updateRegistrationStatus({
  hackathonId,
  status,
}: {
  hackathonId: string;
  status: "registered" | "cancelled" | "waitlist";
}): Promise<HackathonRegistrationWithHackathon> {
  const supabase = createClient();

  if (!hackathonId?.trim()) {
    throw new Error("hackathonId is required");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to update registration status");
  }

  const { data: registration, error } = await supabase
    .from("hackathon_registrations")
    .update({ status })
    .eq("user_id", user.id)
    .eq("hackathon_id", hackathonId)
    .select(
      `
      *,
      hackathon:hackathons(*)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update registration status: ${error.message}`);
  }

  return registration;
}

// HOOKS

// Get user's registered hackathons
export function useRegisteredHackathons() {
  return useQuery({
    queryKey: ["hackathons", "registered"],
    queryFn: fetchRegisteredHackathons,
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

// Check if user is registered for a hackathon
export function useHackathonRegistrationStatus(hackathonId: string) {
  return useQuery({
    queryKey: ["hackathons", "registration-status", hackathonId],
    queryFn: () => checkHackathonRegistration(hackathonId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
    enabled: !!hackathonId, // Only run when hackathonId is available
  });
}

// Get registration details for a hackathon
export function useHackathonRegistration(hackathonId: string) {
  return useQuery({
    queryKey: ["hackathons", "registration", hackathonId],
    queryFn: () => fetchHackathonRegistration(hackathonId),
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
    enabled: !!hackathonId, // Only run when hackathonId is available
  });
}

// Hook for registering for hackathons
export function useRegisterForHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerForHackathon,
    onSuccess: (_, hackathonId) => {
      // Invalidate and refetch registered hackathons
      queryClient.invalidateQueries({ queryKey: ["hackathons", "registered"] });
      // Invalidate specific hackathon registration status
      queryClient.invalidateQueries({
        queryKey: ["hackathons", "registration-status", hackathonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hackathons", "registration", hackathonId],
      });
    },
    onError: (error) => {
      console.error("Failed to register for hackathon:", error);
    },
  });
}

// Hook for unregistering from hackathons
export function useUnregisterFromHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unregisterFromHackathon,
    onSuccess: (_, hackathonId) => {
      // Invalidate and refetch registered hackathons
      queryClient.invalidateQueries({ queryKey: ["hackathons", "registered"] });
      // Invalidate specific hackathon registration status
      queryClient.invalidateQueries({
        queryKey: ["hackathons", "registration-status", hackathonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hackathons", "registration", hackathonId],
      });
    },
    onError: (error) => {
      console.error("Failed to unregister from hackathon:", error);
    },
  });
}

// Hook for updating registration status
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRegistrationStatus,
    onSuccess: (data, { hackathonId }) => {
      // Invalidate and refetch registered hackathons
      queryClient.invalidateQueries({ queryKey: ["hackathons", "registered"] });
      // Invalidate specific hackathon registration status
      queryClient.invalidateQueries({
        queryKey: ["hackathons", "registration-status", hackathonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hackathons", "registration", hackathonId],
      });
    },
    onError: (error) => {
      console.error("Failed to update registration status:", error);
    },
  });
}
