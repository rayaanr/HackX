"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { useWeb3 } from "@/providers/web3-provider";
import { useMemo } from "react";
import { getHackathonById, getProjectById } from "@/lib/helpers/blockchain";

/**
 * Hook to fetch all hackathons a project has been submitted to.
 * It reads the project's metadata (`submittedToHackathons` / `hackathonIds`) and
 * fetches full hackathon details for each id.
 */
export function useProjectHackathons(projectId?: string | number | null) {
  const { contract, client } = useWeb3();

  // First fetch the project to get its hackathon ids (deduped by react-query cache)
  const projectQuery = useQuery({
    queryKey: ["blockchain-project", projectId],
    queryFn: () => getProjectById(contract, client, projectId!),
    enabled: !!contract && !!client && !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const project = projectQuery.data;

  // Build queries for each hackathon id on the project
  const hackathonQueries = useQueries({
    queries:
      (project?.hackathonIds || []).map((hackId: string | number) => ({
        queryKey: ["hackathon", hackId],
        queryFn: () => getHackathonById(contract, client, hackId),
        enabled: !!contract && !!client && !!hackId,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      })) || [],
  });

  const submittedHackathons = useMemo(
    () => hackathonQueries.map((q) => q.data).filter(Boolean),
    [hackathonQueries],
  );

  const isLoading =
    projectQuery.isLoading || hackathonQueries.some((q) => q.isLoading);
  const error =
    projectQuery.error || hackathonQueries.find((q) => q.error)?.error;

  return {
    project: projectQuery.data,
    submittedHackathons,
    isLoading,
    error,
  };
}
