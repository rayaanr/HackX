"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type {
  HackathonWithRelations,
  HackathonFormData,
} from "@/types/hackathon";
import { EXPERIENCE_LEVEL_MAP } from "@/constants/hackathon";

// Helper function to insert related data for a hackathon
async function insertHackathonRelatedData(
  supabase: any,
  hackathonId: string,
  formData: HackathonFormData,
) {
  // Insert prize cohorts
  for (const cohort of formData.prizeCohorts) {
    const { data: cohortData, error: cohortError } = await supabase
      .from("prize_cohorts")
      .insert({
        hackathon_id: hackathonId,
        name: cohort.name,
        number_of_winners: cohort.numberOfWinners,
        prize_amount: cohort.prizeAmount,
        description: cohort.description,
        judging_mode: cohort.judgingMode.toUpperCase(),
        voting_mode: cohort.votingMode.toUpperCase(),
        max_votes_per_judge: cohort.maxVotesPerJudge,
      })
      .select()
      .single();

    if (cohortError) {
      throw cohortError;
    }

    // Insert evaluation criteria
    for (const criteria of cohort.evaluationCriteria) {
      const { error: criteriaError } = await supabase
        .from("evaluation_criteria")
        .insert({
          prize_cohort_id: cohortData.id,
          name: criteria.name,
          points: criteria.points,
          description: criteria.description,
        });

      if (criteriaError) {
        throw criteriaError;
      }
    }
  }

  // Insert judges
  for (const judge of formData.judges) {
    const { error: judgeError } = await supabase.from("judges").insert({
      hackathon_id: hackathonId,
      email: judge.email,
      status: judge.status.toUpperCase(),
    });

    if (judgeError) {
      throw judgeError;
    }
  }

  // Insert schedule slots with speakers
  for (const slot of formData.schedule) {
    let speakerId = null;

    // Create speaker if has speaker
    if (slot.hasSpeaker && slot.speaker) {
      const { data: speakerData, error: speakerError } = await supabase
        .from("speakers")
        .insert({
          name: slot.speaker.name,
          position: slot.speaker.position || null,
          x_name: slot.speaker.xName || null,
          x_handle: slot.speaker.xHandle || null,
          picture: slot.speaker.picture || null,
        })
        .select()
        .single();

      if (speakerError) {
        throw speakerError;
      }

      speakerId = speakerData.id;
    }

    // Create schedule slot
    const { error: slotError } = await supabase.from("schedule_slots").insert({
      hackathon_id: hackathonId,
      name: slot.name,
      description: slot.description,
      start_date_time: slot.startDateTime.toISOString(),
      end_date_time: slot.endDateTime.toISOString(),
      has_speaker: slot.hasSpeaker || false,
      speaker_id: speakerId,
    });

    if (slotError) {
      // If slot insert failed and we created a speaker, clean up the orphaned speaker
      if (speakerId) {
        const { error: deleteError } = await supabase
          .from("speakers")
          .delete()
          .eq("id", speakerId);

        if (deleteError) {
          console.error("Failed to delete orphaned speaker:", deleteError);
        }
      }
      throw slotError;
    }
  }
}

// Fetch user's hackathons
async function fetchUserHackathons(): Promise<HackathonWithRelations[]> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch hackathons");
  }

  const { data: hackathons, error } = await supabase
    .from("hackathons")
    .select(
      `
        *,
        prize_cohorts:prize_cohorts!hackathon_id (
          *,
          evaluation_criteria:evaluation_criteria!prize_cohort_id (*)
        ),
        judges:judges!hackathon_id (*),
        schedule_slots:schedule_slots!hackathon_id (
          *,
          speaker:speakers (*)
        )
      `,
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch hackathons: ${error.message}`);
  }

  return hackathons || [];
}

// Fetch all hackathons (for explore page)
async function fetchAllHackathons(): Promise<HackathonWithRelations[]> {
  const supabase = createClient();

  const { data: hackathons, error } = await supabase
    .from("hackathons")
    .select(
      `
        *,
        prize_cohorts:prize_cohorts!hackathon_id (
          *,
          evaluation_criteria:evaluation_criteria!prize_cohort_id (*)
        ),
        judges:judges!hackathon_id (*),
        schedule_slots:schedule_slots!hackathon_id (
          *,
          speaker:speakers (*)
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch all hackathons: ${error.message}`);
  }

  return hackathons || [];
}

// Fetch single hackathon by ID
async function fetchHackathonById(id: string): Promise<HackathonWithRelations> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to fetch hackathon");
  }

  const { data: hackathon, error } = await supabase
    .from("hackathons")
    .select(
      `
        *,
        prize_cohorts:prize_cohorts!hackathon_id (
          *,
          evaluation_criteria:evaluation_criteria!prize_cohort_id (*)
        ),
        judges:judges!hackathon_id (*),
        schedule_slots:schedule_slots!hackathon_id (
          *,
          speaker:speakers (*)
        )
      `,
    )
    .eq("id", id)
    .eq("created_by", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Hackathon not found");
    }
    throw new Error(`Failed to fetch hackathon: ${error.message}`);
  }

  return hackathon;
}

// Fetch single hackathon by ID for public access
async function fetchHackathonByIdPublic(
  id: string,
): Promise<HackathonWithRelations> {
  const supabase = createClient();

  const { data: hackathon, error } = await supabase
    .from("hackathons")
    .select(
      `
        *,
        prize_cohorts:prize_cohorts!hackathon_id (
          *,
          evaluation_criteria:evaluation_criteria!prize_cohort_id (*)
        ),
        judges:judges!hackathon_id (*),
        schedule_slots:schedule_slots!hackathon_id (
          *,
          speaker:speakers (*)
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Hackathon not found");
    }
    throw new Error(`Failed to fetch hackathon: ${error.message}`);
  }

  return hackathon;
}

// Create a new hackathon
async function createHackathon(
  formData: HackathonFormData,
): Promise<HackathonWithRelations> {
  const supabase = createClient();
  let hackathonId: string | null = null;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to create hackathon");
  }

  try {
    // Insert hackathon
    const { data: hackathonData, error: hackathonError } = await supabase
      .from("hackathons")
      .insert({
        name: formData.name,
        visual: formData.visual || null,
        short_description: formData.shortDescription,
        full_description: formData.fullDescription,
        location: formData.location,
        tech_stack: formData.techStack,
        experience_level: EXPERIENCE_LEVEL_MAP[formData.experienceLevel],
        registration_start_date:
          formData.registrationPeriod?.registrationStartDate?.toISOString() ||
          null,
        registration_end_date:
          formData.registrationPeriod?.registrationEndDate?.toISOString() ||
          null,
        hackathon_start_date:
          formData.hackathonPeriod?.hackathonStartDate?.toISOString() || null,
        hackathon_end_date:
          formData.hackathonPeriod?.hackathonEndDate?.toISOString() || null,
        voting_start_date:
          formData.votingPeriod?.votingStartDate?.toISOString() || null,
        voting_end_date:
          formData.votingPeriod?.votingEndDate?.toISOString() || null,
        social_links: formData.socialLinks || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (hackathonError) {
      throw hackathonError;
    }

    hackathonId = hackathonData.id;

    // Insert related data
    if (!hackathonId) {
      throw new Error("Failed to get hackathon ID");
    }

    await insertHackathonRelatedData(supabase, hackathonId, formData);

    // Fetch the complete hackathon with relations
    const { data: completeHackathon, error: fetchError } = await supabase
      .from("hackathons")
      .select(
        `
          *,
          prize_cohorts:prize_cohorts!hackathon_id (
            *,
            evaluation_criteria:evaluation_criteria!prize_cohort_id (*)
          ),
          judges:judges!hackathon_id (*),
          schedule_slots:schedule_slots!hackathon_id (
            *,
            speaker:speakers (*)
          )
        `,
      )
      .eq("id", hackathonId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return completeHackathon;
  } catch (error) {
    console.error("Error creating hackathon:", error);
    // Best-effort rollback
    try {
      if (hackathonId) {
        await supabase.from("hackathons").delete().eq("id", hackathonId);
      }
    } catch (_) {}
    throw new Error(
      error instanceof Error ? error.message : "Failed to create hackathon",
    );
  }
}

// Update a hackathon
async function updateHackathon({
  hackathonId,
  formData,
}: {
  hackathonId: string;
  formData: HackathonFormData;
}): Promise<HackathonWithRelations> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to update hackathon");
  }

  try {
    // First check if user owns this hackathon
    const { data: existingHackathon, error: checkError } = await supabase
      .from("hackathons")
      .select("id")
      .eq("id", hackathonId)
      .eq("created_by", user.id)
      .single();

    if (checkError || !existingHackathon) {
      throw new Error("Hackathon not found or access denied");
    }

    // Update hackathon basic info
    const { data: updatedHackathon, error: updateError } = await supabase
      .from("hackathons")
      .update({
        name: formData.name,
        visual: formData.visual || null,
        short_description: formData.shortDescription,
        full_description: formData.fullDescription,
        location: formData.location,
        tech_stack: formData.techStack,
        experience_level: EXPERIENCE_LEVEL_MAP[formData.experienceLevel],
        registration_start_date:
          formData.registrationPeriod?.registrationStartDate?.toISOString() ||
          null,
        registration_end_date:
          formData.registrationPeriod?.registrationEndDate?.toISOString() ||
          null,
        hackathon_start_date:
          formData.hackathonPeriod?.hackathonStartDate?.toISOString() || null,
        hackathon_end_date:
          formData.hackathonPeriod?.hackathonEndDate?.toISOString() || null,
        voting_start_date:
          formData.votingPeriod?.votingStartDate?.toISOString() || null,
        voting_end_date:
          formData.votingPeriod?.votingEndDate?.toISOString() || null,
        social_links: formData.socialLinks || {},
      })
      .eq("id", hackathonId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Delete existing related records
    // Get prize cohort IDs first
    const { data: prizeCohortIds } = await supabase
      .from("prize_cohorts")
      .select("id")
      .eq("hackathon_id", hackathonId);

    if (prizeCohortIds && prizeCohortIds.length > 0) {
      const cohortIds = prizeCohortIds.map((pc) => pc.id);
      await supabase
        .from("evaluation_criteria")
        .delete()
        .in("prize_cohort_id", cohortIds);
    }

    await supabase
      .from("prize_cohorts")
      .delete()
      .eq("hackathon_id", hackathonId);
    await supabase.from("judges").delete().eq("hackathon_id", hackathonId);

    // Get speaker IDs from schedule slots before deleting them
    const { data: speakerIds } = await supabase
      .from("schedule_slots")
      .select("speaker_id")
      .eq("hackathon_id", hackathonId);

    if (speakerIds && speakerIds.length > 0) {
      // Deduplicate and filter out nulls
      const validSpeakerIds = [
        ...new Set(
          speakerIds.map((slot) => slot.speaker_id).filter((id) => id !== null),
        ),
      ];

      // Delete speakers if any valid IDs exist
      if (validSpeakerIds.length > 0) {
        await supabase.from("speakers").delete().in("id", validSpeakerIds);
      }
    }

    await supabase
      .from("schedule_slots")
      .delete()
      .eq("hackathon_id", hackathonId);

    // Recreate prize cohorts, judges, and schedule slots
    await insertHackathonRelatedData(supabase, hackathonId, formData);

    // Fetch the complete updated hackathon with relations
    const { data: completeHackathon, error: fetchError } = await supabase
      .from("hackathons")
      .select(
        `
          *,
          prize_cohorts:prize_cohorts!hackathon_id (
            *,
            evaluation_criteria:evaluation_criteria!prize_cohort_id (*)
          ),
          judges:judges!hackathon_id (*),
          schedule_slots:schedule_slots!hackathon_id (
            *,
            speaker:speakers (*)
          )
        `,
      )
      .eq("id", hackathonId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return completeHackathon;
  } catch (error) {
    console.error("Error updating hackathon:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update hackathon",
    );
  }
}

// Delete a hackathon
async function deleteHackathon(hackathonId: string): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required to delete hackathon");
  }

  const { data: deletedHackathon, error } = await supabase
    .from("hackathons")
    .delete()
    .eq("id", hackathonId)
    .eq("created_by", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete hackathon",
    );
  }

  if (!deletedHackathon) {
    throw new Error("Hackathon not found or access denied");
  }
}

// HOOKS

// Get user's hackathons
export function useUserHackathons() {
  return useQuery({
    queryKey: ["hackathons", "user"],
    queryFn: fetchUserHackathons,
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

// Get all hackathons
export function useAllHackathons() {
  return useQuery({
    queryKey: ["hackathons", "all"],
    queryFn: fetchAllHackathons,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
  });
}

// Get single hackathon by ID
export function useHackathonById(id: string) {
  return useQuery({
    queryKey: ["hackathons", "by-id", id],
    queryFn: () => fetchHackathonById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors or not found errors
      if (
        error.message.includes("401") ||
        error.message.includes("Authentication") ||
        error.message.includes("not found")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Get single hackathon by ID for public access
export function useHackathonByIdPublic(id: string) {
  return useQuery({
    queryKey: ["hackathons", "public", "by-id", id],
    queryFn: () => fetchHackathonByIdPublic(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on not found errors
      if (error?.message?.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!id, // Only run when id is available
  });
}

// Hook for creating hackathons
export function useCreateHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHackathon,
    onSuccess: () => {
      // Invalidate and refetch hackathons
      queryClient.invalidateQueries({ queryKey: ["hackathons", "user"] });
      queryClient.invalidateQueries({ queryKey: ["hackathons", "all"] });
    },
    onError: (error) => {
      console.error("Failed to create hackathon:", error);
    },
  });
}

// Hook for updating hackathons
export function useUpdateHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHackathon,
    onSuccess: (data) => {
      // Invalidate and refetch hackathons
      queryClient.invalidateQueries({ queryKey: ["hackathons", "user"] });
      queryClient.invalidateQueries({ queryKey: ["hackathons", "all"] });
      queryClient.invalidateQueries({
        queryKey: ["hackathons", "by-id", data.id],
      });
    },
    onError: (error) => {
      console.error("Failed to update hackathon:", error);
    },
  });
}

// Hook for deleting hackathons
export function useDeleteHackathon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHackathon,
    onSuccess: () => {
      // Invalidate and refetch hackathons
      queryClient.invalidateQueries({ queryKey: ["hackathons", "user"] });
      queryClient.invalidateQueries({ queryKey: ["hackathons", "all"] });
    },
    onError: (error) => {
      console.error("Failed to delete hackathon:", error);
    },
  });
}