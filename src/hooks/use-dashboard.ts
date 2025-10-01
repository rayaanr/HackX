"use client";

import { useMemo } from "react";
import type { DashboardStats, UIHackathon } from "@/types/hackathon";
import { getUIHackathonStatus } from "@/lib/helpers/date";
import { useAllHackathons } from "./use-hackathons";

// Calculate dashboard statistics from hackathons data
function calculateDashboardStats(hackathons: UIHackathon[]): DashboardStats {
  const activeHackathons = hackathons.filter((h) => {
    const status = getUIHackathonStatus({
      ...h,
      votingPeriod: h.votingPeriod || undefined,
    });
    return status !== "Ended";
  }).length;

  const completedHackathons = hackathons.filter((h) => {
    const status = getUIHackathonStatus({
      ...h,
      votingPeriod: h.votingPeriod || undefined,
    });
    return status === "Ended";
  }).length;

  const totalPrizeValue = hackathons.reduce((total, hackathon) => {
    const hackathonTotal =
      hackathon.prizeCohorts?.reduce((sum, cohort) => {
        const amount =
          parseFloat(cohort.prizeAmount.replace(/[^0-9.-]+/g, "")) || 0;
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
    hackathons = [],
    isLoading: hackathonsLoading,
    error: hackathonsError,
  } = useAllHackathons();

  const stats = useMemo(() => {
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
    hackathons = [],
    isLoading: hackathonsLoading,
    error: hackathonsError,
    refetch: refetchHackathons,
  } = useAllHackathons();

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
