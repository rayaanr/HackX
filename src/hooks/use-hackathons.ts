"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";
import { useWeb3 } from "@/providers/web3-provider";
import { useMemo, useCallback } from "react";
import {
  getHackathonById,
  getTotalHackathons,
  getHackathonParticipants,
  getHackathonProjects,
  isUserRegistered,
  prepareRegisterForHackathonTransaction,
  getJudgeAssignments,
  getProjectById,
} from "@/lib/helpers/blockchain";
import { useCreateHackathon } from "./use-create-hackathon";
import { safeToDate } from "@/lib/helpers/date";

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
  const queries = useMemo(() => {
    if (totalHackathons <= 0) return [];

    return Array.from({ length: totalHackathons }, (_, i) => ({
      queryKey: ["hackathon", i + 1],
      queryFn: () => getHackathonById(contract, client, i + 1),
      enabled: !!contract && !!client,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }));
  }, [totalHackathons, contract, client]);

  const hackathonQueries = useQueries({
    queries,
  });

  // Process the results from useQueries
  const hackathons = useMemo(
    () => hackathonQueries.map((query) => query.data).filter(Boolean),
    [hackathonQueries],
  );

  const isLoadingHackathons = hackathonQueries.some((query) => query.isLoading);
  const hackathonsError = hackathonQueries.find((query) => query.error)?.error;

  const refetchHackathons = useCallback(() => {
    hackathonQueries.forEach((query) => query.refetch());
  }, [hackathonQueries]);

  // Only log when data actually changes
  useMemo(() => {
    if (hackathons.length > 0) {
      console.log("✅ Fetched hackathons:", hackathons.length);
    } else if (!isLoadingHackathons && !isLoadingTotal) {
      console.log("📭 No hackathons found");
    }
  }, [hackathons.length, isLoadingHackathons, isLoadingTotal]);

  return useMemo(
    () => ({
      hackathons,
      totalHackathons,
      isLoading: isLoadingHackathons || isLoadingTotal,
      isLoadingHackathons,
      isLoadingTotal,
      error: hackathonsError,
      refetch: refetchHackathons,
    }),
    [
      hackathons,
      totalHackathons,
      isLoadingHackathons,
      isLoadingTotal,
      hackathonsError,
      refetchHackathons,
    ],
  );
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
export function useHackathon(hackathonId?: string | number | null) {
  const { contract, client } = useWeb3();

  return useQuery({
    queryKey: ["hackathon", hackathonId],
    queryFn: () => getHackathonById(contract, client, hackathonId!),
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
 * Hook for fetching hackathon projects (project IDs only)
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

/**
 * Hook for fetching hackathon projects with full project details
 */
export function useHackathonProjectsWithDetails(hackathonId: string | number) {
  const { contract, client } = useWeb3();

  // First get project IDs
  const { data: projectIds = [], isLoading: isLoadingIds } = useQuery({
    queryKey: ["hackathon-projects", hackathonId],
    queryFn: () => getHackathonProjects(contract, hackathonId),
    enabled: !!contract && !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });

  // Then fetch full details for each project
  const projectQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: ["blockchain-project", projectId],
      queryFn: () => getProjectById(contract, client, projectId),
      enabled: !!contract && !!client && !!projectId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });

  // Process the results
  const projects = useMemo(
    () => projectQueries.map((query) => query.data).filter(Boolean),
    [projectQueries],
  );

  const isLoading =
    isLoadingIds || projectQueries.some((query) => query.isLoading);
  const error = projectQueries.find((query) => query.error)?.error;

  return useMemo(
    () => ({
      projects,
      projectIds,
      isLoading,
      error,
    }),
    [projects, projectIds, isLoading, error],
  );
}

/**
 * Hook for checking if user is registered for a hackathon
 */
export function useHackathonRegistration(hackathonId: string | number) {
  const { contract } = useWeb3();
  const activeAccount = useActiveAccount();

  return useQuery({
    queryKey: ["hackathon-registration", hackathonId, activeAccount?.address],
    queryFn: () =>
      activeAccount?.address
        ? isUserRegistered(contract, hackathonId, activeAccount.address)
        : false,
    enabled: !!contract && !!hackathonId && !!activeAccount?.address,
    staleTime: 30 * 1000, // 30 seconds - registration status can change
  });
}

/**
 * Hook for registering to a hackathon
 */
export function useRegisterForHackathon() {
  const { contract } = useWeb3();

  return {
    prepareTransaction: (hackathonId: string | number) =>
      prepareRegisterForHackathonTransaction(contract, hackathonId),
  };
}

/**
 * Hook for fetching only hackathons the user is registered for
 */
export function useRegisteredHackathons() {
  const { contract, client } = useWeb3();
  const activeAccount = useActiveAccount();

  // First get total hackathons
  const { data: totalHackathons = 0 } = useQuery({
    queryKey: ["total-hackathons"],
    queryFn: () => getTotalHackathons(contract),
    enabled: !!contract,
    staleTime: 5 * 60 * 1000,
  });

  // Get all hackathons and their registration status
  const hackathonQueries = useQueries({
    queries: Array.from({ length: totalHackathons }, (_, i) => ({
      queryKey: ["hackathon-with-registration", i + 1, activeAccount?.address],
      queryFn: async () => {
        const hackathon = await getHackathonById(contract, client, i + 1);
        const isRegistered = activeAccount?.address
          ? await isUserRegistered(contract, i + 1, activeAccount.address)
          : false;

        return { ...hackathon, isRegistered };
      },
      enabled:
        !!contract &&
        !!client &&
        totalHackathons > 0 &&
        !!activeAccount?.address,
      staleTime: 2 * 60 * 1000,
    })),
  });

  // Filter only registered hackathons
  const registeredHackathons = useMemo(
    () =>
      hackathonQueries
        .map((query) => query.data)
        .filter(Boolean)
        .filter((hackathon) => hackathon.isRegistered),
    [hackathonQueries],
  );

  const isLoading = hackathonQueries.some((query) => query.isLoading);
  const error = hackathonQueries.find((query) => query.error)?.error;

  return useMemo(
    () => ({
      hackathons: registeredHackathons,
      isLoading: !activeAccount ? false : isLoading,
      error,
      isConnected: !!activeAccount,
    }),
    [registeredHackathons, isLoading, error, activeAccount],
  );
}

/**
 * Hook for fetching hackathons available for submission
 * Includes both registered hackathons AND hackathons in submission phase
 */
export function useSubmissionEligibleHackathons() {
  const { contract, client } = useWeb3();
  const activeAccount = useActiveAccount();

  // First get total hackathons
  const { data: totalHackathons = 0 } = useQuery({
    queryKey: ["total-hackathons"],
    queryFn: () => getTotalHackathons(contract),
    enabled: !!contract,
    staleTime: 5 * 60 * 1000,
  });

  // Get all hackathons and their registration status
  const hackathonQueries = useQueries({
    queries: Array.from({ length: totalHackathons }, (_, i) => ({
      queryKey: ["hackathon-with-registration", i + 1, activeAccount?.address],
      queryFn: async () => {
        const hackathon = await getHackathonById(contract, client, i + 1);
        const isRegistered = activeAccount?.address
          ? await isUserRegistered(contract, i + 1, activeAccount.address)
          : false;

        return { ...hackathon, isRegistered };
      },
      enabled:
        !!contract &&
        !!client &&
        totalHackathons > 0 &&
        !!activeAccount?.address,
      staleTime: 2 * 60 * 1000,
    })),
  });

  // Filter hackathons that are either registered OR in submission phase
  const eligibleHackathons = useMemo(() => {
    const allHackathons = hackathonQueries
      .map((query) => query.data)
      .filter(Boolean);

    return allHackathons.filter((hackathon) => {
      // Always include if user is registered
      if (hackathon.isRegistered) return true;

      // Also include if hackathon is in submission phase (Live status)
      const now = new Date();
      const hackathonStart = safeToDate(
        hackathon.hackathonPeriod?.hackathonStartDate,
      );
      const hackathonEnd = safeToDate(
        hackathon.hackathonPeriod?.hackathonEndDate,
      );

      // Check if in submission phase (Live)
      if (hackathonStart && hackathonEnd) {
        return now >= hackathonStart && now < hackathonEnd;
      }

      return false;
    });
  }, [hackathonQueries]);

  const isLoading = hackathonQueries.some((query) => query.isLoading);
  const error = hackathonQueries.find((query) => query.error)?.error;

  return useMemo(
    () => ({
      hackathons: eligibleHackathons,
      isLoading: !activeAccount ? false : isLoading,
      error,
      isConnected: !!activeAccount,
    }),
    [eligibleHackathons, isLoading, error, activeAccount],
  );
}

/**
 * Hook for fetching hackathons assigned to a judge
 */
export function useJudgeAssignments() {
  const { contract, client } = useWeb3();
  const activeAccount = useActiveAccount();

  // Get assigned hackathon IDs
  const { data: assignedHackathonIds = [], isLoading: isLoadingIds } = useQuery(
    {
      queryKey: ["judge-assignments", activeAccount?.address],
      queryFn: async () => {
        if (!contract || !activeAccount?.address) return [];
        try {
          return await getJudgeAssignments(contract, activeAccount.address);
        } catch (error) {
          console.error("Failed to fetch judge assignments:", error);
          return [];
        }
      },
      enabled: !!contract && !!activeAccount?.address,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  );

  // Fetch hackathon details for assigned IDs
  const hackathonQueries = useQueries({
    queries: assignedHackathonIds.map((hackathonId) => ({
      queryKey: ["hackathon", hackathonId],
      queryFn: () => getHackathonById(contract, client, hackathonId),
      enabled: !!contract && !!client && !!hackathonId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });

  // Process the results
  const assignedHackathons = useMemo(
    () => hackathonQueries.map((query) => query.data).filter(Boolean),
    [hackathonQueries],
  );

  const isLoading =
    isLoadingIds || hackathonQueries.some((query) => query.isLoading);
  const error = hackathonQueries.find((query) => query.error)?.error;

  return useMemo(
    () => ({
      hackathons: assignedHackathons,
      assignedHackathonIds,
      isLoading: !activeAccount ? false : isLoading,
      error,
      isConnected: !!activeAccount,
    }),
    [assignedHackathons, assignedHackathonIds, isLoading, error, activeAccount],
  );
}

// Custom hook to get project count for a specific hackathon
export function useHackathonProjectCount(hackathonId: string | number) {
  const { contract } = useWeb3();

  const {
    data: projectCount,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hackathon-projects-count", hackathonId],
    queryFn: async () => {
      if (!contract) return 0;
      try {
        const projects = await getHackathonProjects(contract, hackathonId);
        return projects.length;
      } catch (error) {
        console.error("Failed to fetch project count:", error);
        return 0;
      }
    },
    enabled: !!contract && !!hackathonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { projectCount, isLoading, error };
}
