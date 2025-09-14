"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";
import { useWeb3 } from "@/providers/web3-provider";
import {
  getHackathonById,
  getTotalHackathons,
  getHackathonParticipants,
  getHackathonProjects,
} from "@/lib/helpers/blockchain";
import { useCreateHackathon } from "./use-create-hackathon";

/**
 * Hook for fetching all hackathons with individual caching
 */
export function useAllHackathons() {
  const { contract, client } = useWeb3();

  // Get total hackathons count first
  const { data: totalHackathons = 0, isLoading: isLoadingTotal } = useQuery({
    queryKey: ["total-hackathons"],
    queryFn: () => getTotalHackathons(contract),
    enabled: !!contract,
    staleTime: 5 * 60 * 1000,
  });

  // Use useQueries for better individual caching of hackathons
  const hackathonQueries = useQueries({
    queries: Array.from({ length: totalHackathons }, (_, i) => ({
      queryKey: ["hackathon", i + 1],
      queryFn: () => getHackathonById(contract, client, i + 1),
      enabled: !!contract && !!client && totalHackathons > 0,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });

  // Process the results from useQueries
  const hackathons = hackathonQueries
    .map((query) => query.data)
    .filter(Boolean);
  const isLoadingHackathons = hackathonQueries.some((query) => query.isLoading);
  const hackathonsError = hackathonQueries.find((query) => query.error)?.error;

  const refetchHackathons = () => {
    hackathonQueries.forEach((query) => query.refetch());
  };

  return {
    hackathons,
    totalHackathons,
    isLoading: isLoadingHackathons || isLoadingTotal,
    isLoadingHackathons,
    isLoadingTotal,
    error: hackathonsError,
    refetch: refetchHackathons,
  };
}

/**
 * Main hook for hackathon blockchain operations
 */
export function useBlockchainHackathons() {
  const activeAccount = useActiveAccount();
  const { contract } = useWeb3();
  const createHackathonHook = useCreateHackathon();

  // Get total hackathons count
  const { data: totalHackathons = 0, isLoading: isLoadingTotal } = useQuery({
    queryKey: ["total-hackathons"],
    queryFn: () => getTotalHackathons(contract),
    enabled: !!contract,
    staleTime: 5 * 60 * 1000,
  });

  return {
    // Data
    totalHackathons,

    // Loading states
    isLoadingTotal,
    isCreatingHackathon: createHackathonHook.isCreating,

    // Error states
    createHackathonError: createHackathonHook.error,

    // Actions
    createHackathon: createHackathonHook.createHackathon,

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

/**
 * Hook for fetching hackathon participants
 */
export function useHackathonParticipants(hackathonId: string | number) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["hackathon-participants", hackathonId],
    queryFn: () => getHackathonParticipants(contract, hackathonId),
    enabled: !!contract && !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for fetching hackathon projects
 */
export function useHackathonProjects(hackathonId: string | number) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["hackathon-projects", hackathonId],
    queryFn: () => getHackathonProjects(contract, hackathonId),
    enabled: !!contract && !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });
}
