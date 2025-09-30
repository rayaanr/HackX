"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentHackathons } from "@/components/dashboard/recent-hackathons";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FeaturedCarousel } from "@/components/hackathon/widgets/featured-carousel";
import { useDashboardData } from "@/hooks/use-dashboard";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAllHackathons } from "@/hooks/use-hackathons";

export default function DashboardPage() {
  const { hackathons, stats, loading, error } = useDashboardData();
  const { hackathons: allHackathons } = useAllHackathons();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard data", {
        description:
          typeof error === "string"
            ? error
            : ((error as Error | undefined)?.message ?? String(error)),
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

      {/* Featured Hackathon Carousel */}
      <FeaturedCarousel hackathons={allHackathons || []} />

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
