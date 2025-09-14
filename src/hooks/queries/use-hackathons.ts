"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import type {
  HackathonWithRelations,
  HackathonFormData,
  BlockchainHackathon,
} from "@/types/hackathon";
import { transformBlockchainToUI } from "@/lib/helpers/blockchain-transforms";
import {
  useActiveHackathons as useBlockchainActiveHackathons,
  useUserHackathons as useBlockchainUserHackathons,
  useHackathonById as useBlockchainHackathonById,
  useCreateHackathon as useBlockchainCreateHackathon,
} from "@/hooks/blockchain";

// Mock data for now - will be replaced with smart contract calls
const MOCK_HACKATHONS: HackathonWithRelations[] = [
  {
    id: "1",
    name: "Web3 Innovation Challenge",
    visual: null,
    short_description:
      "Build the next generation of decentralized applications",
    full_description:
      "This hackathon focuses on creating innovative Web3 applications using blockchain technology.",
    location: "Virtual",
    tech_stack: ["React", "Solidity", "Web3", "IPFS"],
    experience_level: "intermediate",
    registration_start_date: null,
    registration_end_date: "2024-12-31",
    hackathon_start_date: null,
    hackathon_end_date: "2025-01-31",
    voting_start_date: null,
    voting_end_date: "2025-02-07",
    social_links: {},
    created_by: "0x1234567890123456789012345678901234567890",
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
    participant_count: 150,
    prize_cohorts: [
      {
        id: "1",
        name: "Grand Prize",
        number_of_winners: 1,
        prize_amount: "10000",
        description: "The best overall project",
        judging_mode: "manual",
        voting_mode: "judges_only",
        max_votes_per_judge: 1,
        evaluation_criteria: [
          {
            name: "Innovation",
            points: 25,
            description: "How innovative is the solution?",
          },
          {
            name: "Technical Excellence",
            points: 25,
            description: "Quality of technical implementation",
          },
          {
            name: "User Experience",
            points: 25,
            description: "How good is the user experience?",
          },
          {
            name: "Impact",
            points: 25,
            description: "Potential impact of the solution",
          },
        ],
      },
    ],
    judges: [
      {
        address: "0x1234567890123456789012345678901234567890",
        status: "accepted",
      },
    ],
    schedule_slots: [],
    currentPhase: 1,
    isActive: true,
  },
];

interface UseHackathonsResult {
  data: HackathonWithRelations[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Get all hackathons
export function useAllHackathons(): UseHackathonsResult {
  const blockchainResult = useBlockchainActiveHackathons();

  // Transform blockchain data to legacy format for backward compatibility
  const transformedData = blockchainResult.data.map((hackathon) => {
    const uiHackathon = transformBlockchainToUI(hackathon);
    return {
      ...uiHackathon,
      // Convert to legacy format fields
      short_description: uiHackathon.shortDescription,
      full_description: uiHackathon.fullDescription,
      tech_stack: uiHackathon.techStack,
      experience_level: uiHackathon.experienceLevel,
      registration_start_date:
        uiHackathon.registrationPeriod.registrationStartDate?.toISOString() ||
        null,
      registration_end_date:
        uiHackathon.registrationPeriod.registrationEndDate?.toISOString() || "",
      hackathon_start_date:
        uiHackathon.hackathonPeriod.hackathonStartDate?.toISOString() || null,
      hackathon_end_date:
        uiHackathon.hackathonPeriod.hackathonEndDate?.toISOString() || "",
      voting_start_date:
        uiHackathon.votingPeriod?.votingStartDate?.toISOString() || null,
      voting_end_date:
        uiHackathon.votingPeriod?.votingEndDate?.toISOString() || "",
      social_links: uiHackathon.socialLinks,
      created_by: hackathon.organizer,
      created_at: hackathon.metadata?.createdAt || new Date().toISOString(),
      updated_at: hackathon.metadata?.uploadedAt || new Date().toISOString(),
      participant_count: hackathon.participantCount || null,
      prize_cohorts: uiHackathon.prizeCohorts.map((cohort) => ({
        id: cohort.id,
        name: cohort.name,
        number_of_winners: cohort.numberOfWinners,
        prize_amount: cohort.prizeAmount,
        description: cohort.description,
        judging_mode: cohort.judgingMode,
        voting_mode: cohort.votingMode,
        max_votes_per_judge: cohort.maxVotesPerJudge,
        evaluation_criteria: cohort.evaluationCriteria,
      })),
      judges: uiHackathon.judges,
      schedule_slots: uiHackathon.schedule.map((slot) => ({
        name: slot.name,
        description: slot.description,
        start_date_time: slot.startDateTime.toISOString(),
        end_date_time: slot.endDateTime.toISOString(),
        has_speaker: slot.hasSpeaker,
        speaker: slot.speaker,
      })),
      currentPhase: hackathon.currentPhase,
      isActive: hackathon.isActive,
    } as HackathonWithRelations;
  });

  return {
    data: transformedData,
    isLoading: blockchainResult.isLoading,
    error: blockchainResult.error,
    refetch: blockchainResult.refetch,
  };
}

// Get hackathons for a specific user
export function useUserHackathons(userAddress?: string): UseHackathonsResult {
  const account = useActiveAccount();
  const [data, setData] = useState<HackathonWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (account?.address || userAddress) {
          // Filter hackathons created by the user
          const userHackathons = MOCK_HACKATHONS.filter(
            (h) => h.created_by === (userAddress || account?.address),
          );
          setData(userHackathons);
        } else {
          setData([]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userAddress, account?.address]);

  const refetch = () => {
    if (account?.address || userAddress) {
      const userHackathons = MOCK_HACKATHONS.filter(
        (h) => h.created_by === (userAddress || account?.address),
      );
      setData(userHackathons);
    } else {
      setData([]);
    }
  };

  return { data, isLoading, error, refetch };
}

// Get a single hackathon by ID (alias)
export function useHackathonById(hackathonId: string): UseHackathonsResult {
  return useHackathonByIdPublic(hackathonId);
}

// Get a single hackathon by ID
export function useHackathonByIdPublic(
  hackathonId: string,
): UseHackathonsResult {
  const [data, setData] = useState<HackathonWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const hackathon = MOCK_HACKATHONS.find((h) => h.id === hackathonId);
        setData(hackathon ? [hackathon] : []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (hackathonId) {
      fetchData();
    }
  }, [hackathonId]);

  const refetch = () => {
    const hackathon = MOCK_HACKATHONS.find((h) => h.id === hackathonId);
    setData(hackathon ? [hackathon] : []);
  };

  return { data, isLoading, error, refetch };
}

// Create a new hackathon
export function useCreateHackathon() {
  const blockchainCreate = useBlockchainCreateHackathon();

  const createHackathon = async (data: HackathonFormData) => {
    try {
      const result = await blockchainCreate.createHackathon(data);

      if (result.success) {
        return {
          success: true,
          data: {
            id: result.hackathonId?.toString() || "",
            name: data.name,
            created_at: new Date().toISOString(),
            // Add other required fields for backward compatibility
            short_description: data.shortDescription,
            location: data.location,
            tech_stack: data.techStack,
            experience_level: data.experienceLevel,
            created_by: "", // Will be filled by the contract
            updated_at: new Date().toISOString(),
          },
        };
      } else {
        return {
          success: false,
          error: result.error || "Unknown error",
        };
      }
    } catch (error) {
      console.error("Error creating hackathon:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  return { createHackathon, isSubmitting: blockchainCreate.isCreating };
}
