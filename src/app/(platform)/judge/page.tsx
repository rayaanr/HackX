"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageLoading } from "@/components/ui/global-loading";
import { useActiveAccount } from "thirdweb/react";
import { ArrowRight, Calendar, MapPin, Award, Code } from "lucide-react";
import EmptyComponent from "@/components/empty";
import Link from "next/link";
import { motion } from "motion/react";
import { getUIHackathonStatus, formatDateRange } from "@/lib/helpers/date";
import {
  useJudgeAssignments,
  useHackathonProjectCount,
} from "@/hooks/use-hackathons";

// Component to display project count for a hackathon
function ProjectCountDisplay({
  hackathonId,
}: {
  hackathonId: string | number;
}) {
  const { projectCount = 0, isLoading } = useHackathonProjectCount(hackathonId);

  if (isLoading) {
    return <Skeleton className="h-5 w-20 bg-white/20" />;
  }

  return (
    <p className="text-sm font-semibold text-white/85">
      {projectCount} Projects
    </p>
  );
}

export default function JudgeDashboardPage() {
  const {
    hackathons: hackathonsToJudge = [],
    isLoading,
    error,
  } = useJudgeAssignments();
  const account = useActiveAccount();

  if (isLoading) {
    return <PageLoading text="Loading judge assignments" />;
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Judge Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your judging assignments and review submissions
          </p>
        </div>
        <EmptyComponent
          title="Connect your wallet"
          description="Connect your wallet to view your judge assignments and review submissions"
          type="wallet-connect"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex min-h-[400px] items-center justify-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-red-500">Error</h2>
          <p className="text-muted-foreground">
            Failed to load judge assignments. Please try again later.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <h2 className="mb-6 text-2xl font-bold">Hackathons to judge</h2>
      </motion.div>

      <div className="space-y-6">
        {hackathonsToJudge.map((hackathon, index) => {
          const status = getUIHackathonStatus({
            ...hackathon,
            votingPeriod: hackathon.votingPeriod || undefined,
          });

          return (
            <motion.div
              key={hackathon.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card className="project-card-hover group">
                <div className="relative z-10 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold transition-colors group-hover:text-white">
                        {hackathon.name}
                      </h3>
                      <StatusBadge status={status} type="hackathon" size="xs" />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild>
                        <Link href={`/judge/${hackathon.id}`}>
                          Go to judging
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-white/60">
                    {hackathon.description ||
                      hackathon.shortDescription ||
                      "No description available"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4 md:text-sm">
                    <div className="space-y-1">
                      <h6 className="flex items-center text-[11px] font-medium uppercase tracking-wide text-white/40">
                        <Calendar className="mr-1.5 size-3.5" />
                        Duration
                      </h6>
                      <p className="text-sm font-semibold text-white/85">
                        {hackathon.hackathonPeriod?.hackathonStartDate &&
                        hackathon.hackathonPeriod?.hackathonEndDate
                          ? formatDateRange(
                              hackathon.hackathonPeriod.hackathonStartDate,
                              hackathon.hackathonPeriod.hackathonEndDate,
                            )
                          : "TBD"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h6 className="flex items-center text-[11px] font-medium uppercase tracking-wide text-white/40">
                        <Award className="mr-1.5 size-3.5" />
                        Submitted
                      </h6>
                      <ProjectCountDisplay hackathonId={hackathon.id} />
                    </div>
                    {hackathon.location && (
                      <div className="space-y-1">
                        <h6 className="flex items-center text-[11px] font-medium uppercase tracking-wide text-white/40">
                          <MapPin className="mr-1.5 size-3.5" />
                          Location
                        </h6>
                        <p className="truncate text-sm font-semibold text-white/85">
                          {hackathon.location}
                        </p>
                      </div>
                    )}
                    {hackathon.techStack && hackathon.techStack.length > 0 && (
                      <div className="space-y-1">
                        <h6 className="flex items-center text-[11px] font-medium uppercase tracking-wide text-white/40">
                          <Code className="mr-1.5 size-3.5" />
                          Tech Stack
                        </h6>
                        <p className="truncate text-sm font-semibold text-white/85">
                          {hackathon.techStack.slice(0, 3).join(", ")}
                          {hackathon.techStack.length > 3 && "..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {hackathonsToJudge.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <EmptyComponent
              title="No judge assignments"
              description="You have no hackathon judge assignments at the moment. Check back later or contact the organizers."
              type="info"
              variant="card"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
