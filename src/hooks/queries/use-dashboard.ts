"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "@/lib/constants/query-keys";
import { useUserHackathons } from "./use-hackathons";
import type { DashboardStats, HackathonWithRelations } from "@/types/hackathon";

// Calculate dashboard statistics from hackathons data
function calculateDashboardStats(hackathons: HackathonWithRelations[]): DashboardStats {
  const now = new Date();
  
  const activeHackathons = hackathons.filter(h => {
    const hackathonEnd = h.hackathon_end_date ? new Date(h.hackathon_end_date) : null;
    return hackathonEnd && hackathonEnd > now;
  }).length;
  
  const completedHackathons = hackathons.filter(h => {
    const hackathonEnd = h.hackathon_end_date ? new Date(h.hackathon_end_date) : null;
    return hackathonEnd && hackathonEnd <= now;
  }).length;
  
  const totalPrizeValue = hackathons.reduce((total, hackathon) => {
    const hackathonTotal = hackathon.prize_cohorts?.reduce((sum, cohort) => {
      const amount = parseFloat(cohort.prize_amount.replace(/[^0-9.-]+/g, "")) || 0;
      return sum + amount;
    }, 0) || 0;
    return total + hackathonTotal;
  }, 0);
  
  return {
    totalHackathons: hackathons.length,
    activeHackathons,
    completedHackathons,
    totalPrizeValue: totalPrizeValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    })
  };
}

// Dashboard stats hook
export function useDashboardStats() {
  const { data: hackathons = [], isLoading: hackathonsLoading, error: hackathonsError } = useUserHackathons();
  
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => calculateDashboardStats(hackathons),
    enabled: !hackathonsLoading && !!hackathons,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data,
    meta: {
      hackathonsLoading,
      hackathonsError,
    },
  });
}

// Combined dashboard data hook for convenience
export function useDashboardData() {
  const { 
    data: hackathons = [], 
    isLoading: hackathonsLoading, 
    error: hackathonsError,
    refetch: refetchHackathons
  } = useUserHackathons();
  
  const {
    data: stats = {
      totalHackathons: 0,
      activeHackathons: 0,
      completedHackathons: 0,
      totalPrizeValue: '$0'
    },
    isLoading: statsLoading
  } = useDashboardStats();
  
  return {
    hackathons,
    stats,
    loading: hackathonsLoading || statsLoading,
    error: hackathonsError ? (hackathonsError as Error).message : null,
    refetch: refetchHackathons
  };
}