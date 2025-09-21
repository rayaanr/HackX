"use client";

import {
  Calendar,
  Code,
  Trophy,
  Link as LinkIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRegisteredHackathons } from "@/hooks/blockchain/useBlockchainHackathons";
import { formatDisplayDate, formatDateRange, getUIHackathonStatus, type DateInput } from "@/lib/helpers/date";
import { getStatusVariant } from "@/lib/helpers/hackathon-transforms";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import Link from "next/link";
import Image from "next/image";
import type { UIHackathon } from "@/types/hackathon";

type RegisteredHackathon = UIHackathon & { isRegistered: boolean };

export function RegisteredHackathons() {
  const {
    hackathons: registrations = [],
    isLoading: loading,
    error,
    isConnected,
  } = useRegisteredHackathons();


  if (!isConnected) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view your registered hackathons
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>
        <div className="text-center py-12">
          <p className="text-destructive">
            Failed to load registered hackathons
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j}>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded mb-1" />
                        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/3 h-48 bg-muted animate-pulse rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No registered hackathons
            </h3>
            <p className="text-muted-foreground mb-4">
              Register for hackathons to track your participation and submit
              projects
            </p>
            <Button asChild>
              <Link href="/hackathons">Browse Hackathons</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {registrations.map((hackathon: RegisteredHackathon) => {
            // Get hackathon status using shared helper
            const status = getUIHackathonStatus({
              ...hackathon,
              votingPeriod: hackathon.votingPeriod || undefined,
            });
            const statusVariant = getStatusVariant(status);

            return (
              <Card
                key={hackathon.id}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  <div className="flex-1">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CardTitle className="text-2xl">
                            {hackathon.name || `Hackathon ${hackathon.id}`}
                          </CardTitle>
                          <Badge variant={statusVariant}>{status}</Badge>
                        </div>
                        <CardAction className="p-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/hackathons/${hackathon.id}`}>
                                  <LinkIcon className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/projects/create?hackathon=${hackathon.id}`}
                                >
                                  Submit Project
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardAction>
                      </div>
                    </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-muted-foreground mb-4">
                          {hackathon.shortDescription || "No description provided."}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm [&>div>h6]:text-muted-foreground [&>div>p]:font-semibold [&>div>p]:text-xs">
                          <div>
                            <h6 className="flex items-center">
                              <Calendar className="size-4 mr-1" />
                              Registration closes
                            </h6>
                            <p>
                              {hackathon.registrationPeriod?.registrationEndDate
                                ? formatDisplayDate(hackathon.registrationPeriod.registrationEndDate)
                                : "Registration TBD"}
                            </p>
                          </div>
                          <div>
                            <h6 className="flex items-center">
                              <Code className="size-4 mr-1" />
                              Tech stack
                            </h6>
                            <p>
                              {hackathon.techStack &&
                              hackathon.techStack.length > 0
                                ? "All tech stack"
                                : "Any"}
                            </p>
                          </div>
                          <div>
                            <h6 className="flex items-center">
                              <Trophy className="size-4 mr-1" />
                              Level
                            </h6>
                            <p className="capitalize">
                              {hackathon.experienceLevel
                                ? hackathon.experienceLevel.toLowerCase() +
                                  " levels accepted"
                                : "All levels accepted"}
                            </p>
                          </div>
                          <div>
                            <h6 className="flex items-center">
                              <Trophy className="size-4 mr-1" />
                              Total prize
                            </h6>
                            <p>
                              {"TBD"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <Button asChild>
                            <Link
                              href={`/projects/create?hackathon=${hackathon.id}`}
                            >
                              Submit Project
                            </Link>
                          </Button>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">
                              {formatDateRange(
                                hackathon.hackathonPeriod?.hackathonStartDate,
                                hackathon.hackathonPeriod?.hackathonEndDate
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                    <div className="relative w-1/3">
                      <Image
                        height={200}
                        width={300}
                        src={resolveIPFSToHttp(
                          hackathon.visual
                        )}
                        alt={
                          hackathon.name ||
                          `Hackathon ${hackathon.id}`
                        }
                        className="h-full w-full object-cover rounded-lg"
                        unoptimized
                      />
                    </div>
                  </div>
                </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
