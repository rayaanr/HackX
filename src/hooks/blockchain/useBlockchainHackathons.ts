"use client";

import { useQuery } from "@tanstack/react-query";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { readContract } from "thirdweb";
import { useWeb3 } from "@/providers/web3-provider";
import {
  batchFetchHackathons,
  getHackathonById,
} from "@/lib/helpers/blockchain";
import { useCreateHackathon } from "./use-create-hackathon";

/**
 * Unified hook for all hackathon blockchain operations
 * Optimized to use Thirdweb's built-in features and eliminate code duplication
 */
export function useBlockchainHackathons() {
  const activeAccount = useActiveAccount();
  const { contract, client } = useWeb3();
  const createHackathonHook = useCreateHackathon();

  // Fetch all hackathons with optimized caching
  const {
    data: hackathons = [],
    isLoading: isLoadingHackathons,
    error: hackathonsError,
    refetch: refetchHackathons,
  } = useQuery({
    queryKey: ["hackathons"],
    queryFn: () => batchFetchHackathons(contract, client),
    enabled: !!contract && !!client,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get total hackathons count
  const { data: totalHackathons = 0 } = useReadContract({
    contract,
    method: "function getTotalHackathons() view returns (uint256)",
    queryOptions: {
      enabled: !!contract,
    },
  });

  // Fetch single hackathon by ID
  const fetchHackathon = (hackathonId: string | number) =>
    useQuery({
      queryKey: ["hackathon", hackathonId],
      queryFn: () => getHackathonById(contract, client, hackathonId),
      enabled: !!contract && !!client && !!hackathonId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  console.log("Total hackathons fetched:", hackathons.length);
  console.log("Hackathons data:", hackathons);

  return {
    // Data
    hackathons,
    totalHackathons: Number(totalHackathons),

    // Loading states
    isLoadingHackathons,
    isCreatingHackathon: createHackathonHook.isCreating,

    // Error states
    hackathonsError,
    createHackathonError: createHackathonHook.error,

    // Actions
    createHackathon: createHackathonHook.createHackathon,
    refetchHackathons,
    fetchHackathon,

    // Utils
    isConnected: !!activeAccount,
    userAddress: activeAccount?.address,
  };
}

/**
 * Hook for fetching a single hackathon by ID
 */
export function useHackathon(hackathonId: string | number) {
  const { contract, client } = useWeb3();

  return useQuery({
    queryKey: ["hackathon", hackathonId],
    queryFn: () => getHackathonById(contract, client, hackathonId),
    enabled: !!contract && !!client && !!hackathonId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Legacy exports for backward compatibility
export const useLegacyCreateHackathon = () => {
  const { createHackathon, isCreating, error } = useCreateHackathon();
  return {
    mutate: createHackathon,
    isPending: isCreating,
    error: error,
  };
};

export const useUIBlockchainHackathons = useBlockchainHackathons;
export const useBlockchainHackathonById = useHackathon;

// Additional hooks for participants and projects
export function useHackathonParticipants(hackathonId: string | number) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["hackathon-participants", hackathonId],
    queryFn: async () => {
      if (!contract) return [];
      try {
        const participants = await readContract({
          contract,
          method:
            "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
          params: [BigInt(hackathonId)],
        });
        // Convert any BigInt values to strings to avoid serialization issues
        return (participants || []).map((p: any) =>
          typeof p === "bigint" ? p.toString() : p,
        );
      } catch (error) {
        console.error("Failed to fetch participants:", error);
        return [];
      }
    },
    enabled: !!contract && !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useHackathonProjects(hackathonId: string | number) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["hackathon-projects", hackathonId],
    queryFn: async () => {
      if (!contract) return [];
      try {
        const projects = await readContract({
          contract,
          method:
            "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
          params: [BigInt(hackathonId)],
        });
        // Convert BigInt values to numbers to avoid serialization issues
        return (projects || []).map((p: any) =>
          typeof p === "bigint" ? Number(p) : p,
        );
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        return [];
      }
    },
    enabled: !!contract && !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });
}