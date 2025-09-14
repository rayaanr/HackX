"use client";

import { useState, useEffect, useMemo } from "react";
import { useUserHackathons } from "@/hooks/queries/use-hackathons";
import type { DashboardStats, HackathonWithRelations } from "@/types/hackathon";

// Calculate dashboard statistics from hackathons data
function calculateDashboardStats(
  hackathons: HackathonWithRelations[],
): DashboardStats {
  const now = new Date();

  const activeHackathons = hackathons.filter((h) => {
    const hackathonEnd = h.hackathon_end_date
      ? new Date(h.hackathon_end_date)
      : null;
    return hackathonEnd && hackathonEnd > now;
  }).length;

  const completedHackathons = hackathons.filter((h) => {
    const hackathonEnd = h.hackathon_end_date
      ? new Date(h.hackathon_end_date)
      : null;
    return hackathonEnd && hackathonEnd <= now;
  }).length;

  const totalPrizeValue = hackathons.reduce((total, hackathon) => {
    const hackathonTotal =
      hackathon.prize_cohorts?.reduce((sum, cohort) => {
        const amount =
          parseFloat(cohort.prize_amount.replace(/[^0-9.-]+/g, "")) || 0;
        return sum + amount;
      }, 0) || 0;
    return total + hackathonTotal;
  }, 0);

  return {
    totalHackathons: hackathons.length,
    activeHackathons,
    completedHackathons,
    totalPrizeValue: totalPrizeValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }),
  };
}

// Dashboard stats hook
export function useDashboardStats() {
  const {
    data: hackathons = [],
    isLoading: hackathonsLoading,
    error: hackathonsError,
  } = useUserHackathons();

  const [stats, setStats] = useState<DashboardStats>({
    totalHackathons: 0,
    activeHackathons: 0,
    completedHackathons: 0,
    totalPrizeValue: "$0",
  });

  const calculatedStats = useMemo(() => {
    if (hackathonsLoading || hackathons.length === 0) {
      return {
        totalHackathons: 0,
        activeHackathons: 0,
        completedHackathons: 0,
        totalPrizeValue: "$0",
      };
    }
    return calculateDashboardStats(hackathons);
  }, [hackathons, hackathonsLoading]);

  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  return {
    data: stats,
    isLoading: hackathonsLoading,
    error: hackathonsError,
    meta: {
      hackathonsLoading,
      hackathonsError,
    },
  };
}

// Combined dashboard data hook for convenience
export function useDashboardData() {
  const {
    data: hackathons = [],
    isLoading: hackathonsLoading,
    error: hackathonsError,
    refetch: refetchHackathons,
  } = useUserHackathons();

  const {
    data: stats = {
      totalHackathons: 0,
      activeHackathons: 0,
      completedHackathons: 0,
      totalPrizeValue: "$0",
    },
    isLoading: statsLoading,
  } = useDashboardStats();

  return {
    hackathons,
    stats,
    loading: hackathonsLoading || statsLoading,
    error: hackathonsError ? (hackathonsError as Error).message : null,
    refetch: refetchHackathons,
  };
}
