"use client";

import {
  Calendar,
  Code,
  Trophy,
  Link as LinkIcon,
  MoreHorizontal,
  Clock,
  CheckCircle,
  FolderIcon,
  Upload,
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
import {
  formatDisplayDate,
  formatDateRange,
  getUIHackathonStatus,
} from "@/lib/helpers/date";
import { getHackathonStatusVariant } from "@/lib/helpers/status";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import { calculateTotalPrizeAmount } from "@/lib/helpers/blockchain-transforms";
import Link from "next/link";
import Image from "next/image";
import type { UIHackathon } from "@/types/hackathon";
import { motion } from "motion/react";
import { useRegisteredHackathons } from "@/hooks/use-hackathons";
import EmptyComponent from "@/components/empty";

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
        <EmptyComponent
          title="Connect Your Wallet"
          description="Connect your wallet to view your registered hackathons"
          type="wallet-connect"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>
        <EmptyComponent
          title="Failed to load hackathons"
          description="There was an error loading your registered hackathons. Please try again."
          type="error"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border border-white/10 rounded-xl p-6 bg-white/[0.03] backdrop-blur-sm animate-pulse"
            >
              <div className="flex">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-48 bg-white/10 rounded" />
                    <div className="h-6 w-20 bg-white/10 rounded" />
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j}>
                        <div className="h-4 w-16 bg-white/10 rounded mb-1" />
                        <div className="h-4 w-12 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/3 h-48 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">
        Registered Hackathons
      </h2>

      {registrations.length === 0 ? (
        <EmptyComponent
          title="No Registered Hackathons"
          description="You haven't registered for any hackathons yet."
          type="info"
          variant="ghost"
          action={
            <Link href="/hackathons">
              <Button>Explore Hackathons</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {registrations.map((hackathon: RegisteredHackathon, index) => {
            // Get hackathon status using shared helper
            const status = getUIHackathonStatus({
              ...hackathon,
              votingPeriod: hackathon.votingPeriod || undefined,
            });
            const statusVariant = getHackathonStatusVariant(status);

            return (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.05 * index,
                  duration: 0.5,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
                className="group relative h-full"
              >
                <Card className="project-card-hover h-full p-6 md:p-7">
                  <div className="relative z-10 h-full">
                    <div className="flex flex-col md:flex-row gap-6 h-full">
                      <div className="flex-1 flex flex-col">
                        <CardHeader className="p-0 mb-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                              <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight group-hover:text-white">
                                {hackathon.name || `Hackathon ${hackathon.id}`}
                              </CardTitle>
                              <Badge
                                variant={statusVariant}
                                className="text-[10px] uppercase tracking-wide py-1"
                              >
                                {status}
                              </Badge>
                            </div>
                            <CardAction className="p-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-white/10 text-white/70 hover:text-white"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/hackathons/${hackathon.id}`}>
                                      <LinkIcon className="size-4" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    asChild
                                    disabled={status !== "Live"}
                                  >
                                    <Link
                                      href={`/projects/create?hackathon=${hackathon.id}`}
                                    >
                                      <Upload className="size-4" />
                                      Submit Project
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </CardAction>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col">
                          <p className="text-white/60 mb-5 line-clamp-3">
                            {hackathon.shortDescription ||
                              "No description provided."}
                          </p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs md:text-sm mb-5">
                            <div className="space-y-1">
                              <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                                <Calendar className="size-3.5 mr-1.5" />
                                Registration closes
                              </h6>
                              <p className="font-semibold text-white/85 text-sm">
                                {hackathon.registrationPeriod
                                  ?.registrationEndDate
                                  ? formatDisplayDate(
                                      hackathon.registrationPeriod
                                        .registrationEndDate,
                                    )
                                  : "TBD"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                                <Code className="size-3.5 mr-1.5" />
                                Tech Stack
                              </h6>
                              <p className="font-semibold text-white/85 text-sm truncate">
                                {hackathon.techStack &&
                                hackathon.techStack.length > 0
                                  ? hackathon.techStack.slice(0, 3).join(", ")
                                  : "Any"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                                <Trophy className="size-3.5 mr-1.5" />
                                Level
                              </h6>
                              <p className="font-semibold text-white/85 text-sm capitalize">
                                {hackathon.experienceLevel
                                  ? `${hackathon.experienceLevel}`
                                  : "All"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                                <Trophy className="size-3.5 mr-1.5" />
                                Total Prize
                              </h6>
                              <p className="font-semibold text-white/85 text-sm">
                                {calculateTotalPrizeAmount(
                                  hackathon.prizeCohorts || [],
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-5 mt-auto">
                            {status === "Live" ? (
                              <Button
                                asChild
                                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                              >
                                <Link
                                  href={`/projects/create?hackathon=${hackathon.id}`}
                                >
                                  <Upload className="size-4" />
                                  Submit Project
                                </Link>
                              </Button>
                            ) : status === "Coming Soon" ? (
                              <Button
                                variant="outline"
                                disabled
                                className="border-white/20"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Registration Not Started
                              </Button>
                            ) : status === "Registration Open" ? (
                              <Button
                                variant="outline"
                                disabled
                                className="border-white/20"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Waiting for Submission Phase
                              </Button>
                            ) : status === "Registration Closed" ? (
                              <Button
                                variant="outline"
                                disabled
                                className="border-white/20"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Submission Starting Soon
                              </Button>
                            ) : status === "Voting" ? (
                              <Button
                                variant="outline"
                                disabled
                                className="border-white/20"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                In Voting Phase
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                disabled
                                className="border-white/20"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Hackathon Ended
                              </Button>
                            )}
                            <div className="text-xs md:text-sm text-white/55">
                              <span className="font-medium">
                                {formatDateRange(
                                  hackathon.hackathonPeriod?.hackathonStartDate,
                                  hackathon.hackathonPeriod?.hackathonEndDate,
                                )}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                      <div className="relative md:w-1/3 overflow-hidden rounded-lg group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image
                          height={200}
                          width={300}
                          src={resolveIPFSToHttp(hackathon.visual)}
                          alt={hackathon.name || `Hackathon ${hackathon.id}`}
                          className="h-40 md:h-48 w-full object-cover rounded-lg transform group-hover:scale-[1.03] transition-transform duration-500"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
