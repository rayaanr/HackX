"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveAccount } from "thirdweb/react";
import { ArrowRight, Calendar, MapPin, Award, Code } from "lucide-react";
import { WalletConnectionPrompt } from "@/components/wallet/wallet-connection-prompt";
import Link from "next/link";
import { getUIHackathonStatus } from "@/lib/helpers/date";
import { useJudgeAssignments } from "@/hooks/use-hackathons";

export default function JudgeDashboardPage() {
  const {
    hackathons: hackathonsToJudge = [],
    isLoading,
    error,
  } = useJudgeAssignments();
  const account = useActiveAccount();

  if (isLoading) {
    return <div>Loading...</div>;
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
        <WalletConnectionPrompt
          title="Connect your wallet"
          description="Connect your wallet to view your judge assignments and review submissions"
        />
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

      <div>
        <h2 className="text-2xl font-bold mb-6">Hackathons to judge</h2>
        <div className="space-y-6">
          {hackathonsToJudge.map((hackathon) => {
            const status = getUIHackathonStatus({
              ...hackathon,
              votingPeriod: hackathon.votingPeriod || undefined,
            });

            return (
              <Card key={hackathon.id} className="project-card-hover">
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold group-hover:text-white transition-colors">
                        {hackathon.name}
                      </h3>
                      <Badge
                        variant={
                          status === "Live"
                            ? "default"
                            : status === "Voting"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px] uppercase tracking-wide py-1"
                      >
                        {status}
                      </Badge>
                    </div>
                    <Button asChild>
                      <Link href={`/judge/${hackathon.id}`}>
                        Go to judging
                        <ArrowRight className="size-4 ml-2" />
                      </Link>
                    </Button>
                  </div>

                  <p className="text-white/60 mb-4 line-clamp-2">
                    {hackathon.description ||
                      hackathon.shortDescription ||
                      "No description available"}
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs md:text-sm">
                    <div className="space-y-1">
                      <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                        <Calendar className="size-3.5 mr-1.5" />
                        Duration
                      </h6>
                      <p className="font-semibold text-white/85 text-sm">
                        {hackathon.hackathonPeriod?.hackathonStartDate &&
                        hackathon.hackathonPeriod?.hackathonEndDate
                          ? `${new Date(
                              hackathon.hackathonPeriod.hackathonStartDate
                            ).toLocaleDateString()} - ${new Date(
                              hackathon.hackathonPeriod.hackathonEndDate
                            ).toLocaleDateString()}`
                          : "TBD"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                        <Award className="size-3.5 mr-1.5" />
                        Prize Pool
                      </h6>
                      <p className="font-semibold text-white/85 text-sm">
                        ${hackathon.prizePool?.toLocaleString() || "TBD"}
                      </p>
                    </div>
                    {hackathon.location && (
                      <div className="space-y-1">
                        <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                          <MapPin className="size-3.5 mr-1.5" />
                          Location
                        </h6>
                        <p className="font-semibold text-white/85 text-sm truncate">
                          {hackathon.location}
                        </p>
                      </div>
                    )}

                    {hackathon.techStack && hackathon.techStack.length > 0 && (
                      <div className="space-y-1">
                        <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                          <Code className="size-3.5 mr-1.5" />
                          Tech Stack
                        </h6>
                        <p className="font-semibold text-white/85 text-sm truncate">
                          {hackathon.techStack.slice(0, 3).join(", ")}
                          {hackathon.techStack.length > 3 && "..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {hackathonsToJudge.length === 0 && (
            <Card className="project-card-hover">
              <div className="relative z-10 text-center py-12">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Judge Assignments
                </h3>
                <p className="text-muted-foreground">
                  You haven't been assigned to judge any hackathons yet.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Judge assignments are managed by hackathon organizers.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
