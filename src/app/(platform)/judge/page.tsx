"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useJudgeAssignments } from "@/hooks/blockchain/useBlockchainHackathons";
import { useActiveAccount } from "thirdweb/react";
import { ArrowRight, Calendar, MapPin, Users, Award } from "lucide-react";
import Link from "next/link";
import { getUIHackathonStatus } from "@/lib/helpers/date";

export default function JudgeDashboardPage() {
  const {
    hackathons: hackathonsToJudge = [],
    isLoading,
    error,
    isConnected,
  } = useJudgeAssignments();
  const account = useActiveAccount();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view your judge assignments.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">
            Failed to load judge assignments. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Judge Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your judging assignments and review submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hackathons to judge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hackathonsToJudge.map((hackathon) => {
            const status = getUIHackathonStatus({
              ...hackathon,
              votingPeriod: hackathon.votingPeriod || undefined,
            });

            const startDate = new Date(hackathon.startDate);
            const endDate = new Date(hackathon.endDate);

            return (
              <div
                key={hackathon.id}
                className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {hackathon.name}
                      </h3>
                      <Badge
                        variant={status === "Live" ? "default" : status === "Voting" ? "secondary" : "outline"}
                        className={status === "Live" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}
                      >
                        {status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {hackathon.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="size-4" />
                        <span>${hackathon.prizePool?.toLocaleString() || "TBD"}</span>
                      </div>
                      {hackathon.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="size-4" />
                          <span>{hackathon.location}</span>
                        </div>
                      )}
                    </div>

                    {hackathon.techStack && hackathon.techStack.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">
                          Tech stack:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {hackathon.techStack
                            ?.slice(0, 3)
                            .map((tech: string) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          {hackathon.techStack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{hackathon.techStack.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild>
                    <Link href={`/hackathons/${hackathon.id}/judge`}>
                      Go to judging
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}

          {hackathonsToJudge.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Judge Assignments</h3>
              <p className="text-muted-foreground">
                You haven't been assigned to judge any hackathons yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Judge assignments are managed by hackathon organizers.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
