"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  HackathonWithRelations,
  HackathonsResponse,
  PublicHackathonListItem,
} from "@/types/hackathon";

// Fetch user's hackathons
async function fetchUserHackathons(): Promise<HackathonWithRelations[]> {
  const response = await fetch("/api/hackathons");

  if (!response.ok) {
    throw Object.assign(
      new Error(
        `Failed to fetch hackathons: ${response.status} ${response.statusText}`,
      ),
      { status: response.status },
    );
  }

  const data: HackathonsResponse = await response.json();
  return data.data;
}

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

// Fetch all hackathons (for explore page) - returns public safe data only
async function fetchAllHackathons(
  page: number = 1,
  limit: number = 20,
): Promise<PublicHackathonListItem[]> {
  const response = await fetch(
    `/api/hackathons/all?page=${page}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch all hackathons: ${response.status} ${response.statusText}`,
    );
  }

  const data: { data: PublicHackathonListItem[] } = await response.json();
  return data.data;
}

// Get all hackathons with pagination
export function useAllHackathons(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["hackathons", "all", page, limit],
    queryFn: () => fetchAllHackathons(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
  });
}
