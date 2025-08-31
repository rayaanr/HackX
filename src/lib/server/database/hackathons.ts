import { createClient } from "@/lib/supabase/server";
import { HackathonFormData } from "@/lib/schemas/hackathon-schema";
import { EXPERIENCE_LEVEL_MAP } from "@/lib/constants/hackathon";

// Helper function to insert related data for a hackathon
async function insertHackathonRelatedData(
  supabase: any,
  hackathonId: string,
  formData: HackathonFormData
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
    const { error: slotError } = await supabase
      .from("schedule_slots")
      .insert({
        hackathon_id: hackathonId,
        name: slot.name,
        description: slot.description,
        start_date_time: slot.startDateTime.toISOString(),
        end_date_time: slot.endDateTime.toISOString(),
        has_speaker: slot.hasSpeaker || false,
        speaker_id: speakerId,
      });

    if (slotError) {
      throw slotError;
    }
  }
}

export async function createHackathon(
  formData: HackathonFormData,
  userId: string
) {
  const supabase = await createClient();
  let hackathonId: string | null = null;

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
        created_by: userId,
      })
      .select()
      .single();

    if (hackathonError) {
      throw hackathonError;
    }

    hackathonId = hackathonData.id;

    // Insert related data using helper function
    if (!hackathonId) {
      throw new Error("Failed to get hackathon ID");
    }

    await insertHackathonRelatedData(supabase, hackathonId, formData);
    return { success: true, data: hackathonData };
  } catch (error) {
    console.error("Error creating hackathon:", error);
    // Best-effort rollback
    try {
      if (hackathonId) {
        const rollbackSupabase = await createClient();
        await rollbackSupabase
          .from("hackathons")
          .delete()
          .eq("id", hackathonId);
      }
    } catch (_) {}
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get all hackathons for a user
export async function getUserHackathons(userId: string) {
  try {
    const supabase = await createClient();

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
      `
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data: hackathons };
  } catch (error) {
    console.error("Error fetching user hackathons:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Get a specific hackathon by ID
export async function getHackathonById(hackathonId: string, userId: string) {
  try {
    const supabase = await createClient();

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
      `
      )
      .eq("id", hackathonId)
      .eq("created_by", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Hackathon not found" };
      }
      throw error;
    }

    return { success: true, data: hackathon };
  } catch (error) {
    console.error("Error fetching hackathon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Update a hackathon
export async function updateHackathon(
  hackathonId: string,
  formData: HackathonFormData,
  userId: string
) {
  try {
    const supabase = await createClient();

    // First check if user owns this hackathon
    const { data: existingHackathon, error: checkError } = await supabase
      .from("hackathons")
      .select("id")
      .eq("id", hackathonId)
      .eq("created_by", userId)
      .single();

    if (checkError || !existingHackathon) {
      return { success: false, error: "Hackathon not found or access denied" };
    }

    // Convert experience level to match enum
    const experienceLevelMap: Record<string, string> = {
      beginner: "BEGINNER",
      intermediate: "INTERMEDIATE",
      advanced: "ADVANCED",
      all: "ALL",
    };

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
    // Note: In production, you'd want to be more careful about this approach
    // and consider updating existing records instead of deleting and recreating

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
    await supabase
      .from("schedule_slots")
      .delete()
      .eq("hackathon_id", hackathonId);

    // Recreate prize cohorts, judges, and schedule slots using helper function
    await insertHackathonRelatedData(supabase, hackathonId, formData);

    return { success: true, data: updatedHackathon };
  } catch (error) {
    console.error("Error updating hackathon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Delete a hackathon
export async function deleteHackathon(hackathonId: string, userId: string) {
  try {
    const supabase = await createClient();

    const { data: deletedHackathon, error } = await supabase
      .from("hackathons")
      .delete()
      .eq("id", hackathonId)
      .eq("created_by", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data: deletedHackathon };
  } catch (error) {
    console.error("Error deleting hackathon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
