"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentHackathons } from "@/components/dashboard/recent-hackathons";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useDashboardData } from "@/hooks/queries/use-dashboard";
import { toast } from "sonner";
import { useEffect } from "react";

export default function DashboardPage() {
  const { hackathons, stats, loading, error } = useDashboardData();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data", {
        description: error
      });
    }
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your hackathon management dashboard
        </p>
      </div>

      <StatsCards stats={stats} loading={loading} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <RecentHackathons hackathons={hackathons} loading={loading} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
