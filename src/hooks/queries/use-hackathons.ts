"use client";

import { useQuery } from "@tanstack/react-query";
import type { 
  HackathonWithRelations, 
  HackathonsResponse
} from "@/types/hackathon";

// Fetch user's hackathons
async function fetchUserHackathons(): Promise<HackathonWithRelations[]> {
  const response = await fetch("/api/hackathons");
  
  if (!response.ok) {
    throw new Error(`Failed to fetch hackathons: ${response.statusText}`);
  }
  
  const data: HackathonsResponse = await response.json();
  return data.data;
}

// Get user's hackathons
export function useUserHackathons() {
  return useQuery({
    queryKey: ['hackathons', 'user'],
    queryFn: fetchUserHackathons,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

