"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HackathonCard } from "@/components/hackathon/display/hackathon-overview-card";
import { getUIHackathonStatus } from "@/lib/helpers/date";
import type { UIHackathon, PrizeCohort } from "@/types/hackathon";
import { useAllHackathons } from "@/hooks/use-hackathons";

// Filter options
const prizeRangeOptions = [
  { value: "", label: "All Prizes" },
  { value: "10000", label: "$10,000+" },
  { value: "50000", label: "$50,000+" },
  { value: "100000", label: "$100,000+" },
];

const techStackOptions = [
  { value: "", label: "All Tech" },
  { value: "AI", label: "AI" },
  { value: "Web3", label: "Web3" },
  { value: "React", label: "React" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Mobile", label: "Mobile" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "Registration Open", label: "Registration Open" },
  { value: "Live", label: "Live" },
  { value: "Voting", label: "Voting" },
  { value: "Ended", label: "Ended" },
];

export default function ExplorePage() {
  const {
    hackathons: hackathonData,
    isLoadingHackathons: loading,
    error,
  } = useAllHackathons();

  // Filter state
  const [filters, setFilters] = useState({
    prizeRange: "",
    techStack: "",
    status: "",
  });

  // Get data with fallbacks - hackathonData is now the direct array
  const allHackathons = hackathonData || [];
  const initialLiveHackathons = hackathonData || [];
  const initialPastHackathons = hackathonData || [];

  // Use shared helper function for consistent status calculation

  // Apply additional filters on top of the pre-filtered data
  const { liveHackathons, pastHackathons } = useMemo(() => {
    const applyFilters = (hackathons: UIHackathon[]) => {
      return hackathons.filter((hackathon) => {
        // Prize range filter
        if (filters.prizeRange) {
          const totalPrizePool =
            hackathon.prizeCohorts?.reduce(
              (sum: number, cohort: PrizeCohort) => {
                const amount =
                  typeof cohort.prizeAmount === "string"
                    ? parseFloat(cohort.prizeAmount.replace(/[^0-9.]/g, ""))
                    : Number(cohort.prizeAmount);
                return sum + (amount || 0);
              },
              0,
            ) || 0;

          const minPrize = Number(filters.prizeRange);
          if (totalPrizePool < minPrize) return false;
        }

        // Tech stack filter
        if (filters.techStack) {
          const hackathonTechStack = hackathon.techStack || [];
          if (
            !hackathonTechStack.some((tech: string) =>
              tech.toLowerCase().includes(filters.techStack.toLowerCase()),
            )
          ) {
            return false;
          }
        }

        // Status filter
        if (filters.status) {
          const currentStatus = getUIHackathonStatus({
            ...hackathon,
            votingPeriod: hackathon.votingPeriod || undefined,
          });
          if (filters.status !== currentStatus) return false;
        }

        return true;
      });
    };

    // Filter past hackathons to only show those with judging started or ended
    const filterPastHackathons = (hackathons: UIHackathon[]) => {
      return hackathons.filter((hackathon) => {
        const currentStatus = getUIHackathonStatus({
          ...hackathon,
          votingPeriod: hackathon.votingPeriod || undefined,
        });
        // Only show hackathons where judging has started (Voting) or ended
        return currentStatus === "Voting" || currentStatus === "Ended";
      });
    };

    return {
      liveHackathons: applyFilters(initialLiveHackathons),
      pastHackathons: applyFilters(filterPastHackathons(initialPastHackathons)),
    };
  }, [initialLiveHackathons, initialPastHackathons, filters]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load hackathons", {
        description: "Please try refreshing the page",
      });
    }
  }, [error]);

  return (
    <div>
      {/* Explore Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Explore Hackathons</h2>
          <p className="text-muted-foreground max-w-2xl">
            Welcome to your hackathon dashboard! Manage projects, invite
            teammates, and track your hackathon journey with ease — all in one
            place.
          </p>
        </div>
        <Button asChild>
          <Link href="/hackathons/create">Host a Hackathon</Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Prize Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {prizeRangeOptions.find(
                (option) => option.value === filters.prizeRange,
              )?.label || "Total Prize"}{" "}
              <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {prizeRangeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, prizeRange: option.value }))
                }
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tech Stack Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {techStackOptions.find(
                (option) => option.value === filters.techStack,
              )?.label || "Tech Stack"}{" "}
              <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {techStackOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, techStack: option.value }))
                }
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {statusOptions.find((option) => option.value === filters.status)
                ?.label || "Status"}{" "}
              <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, status: option.value }))
                }
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hackathon Grid */}
      <div className="space-y-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
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
            </div>
          ))
        ) : liveHackathons.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No active hackathons</h3>
            <p className="text-muted-foreground">
              {allHackathons.length === 0
                ? "No hackathons have been created yet."
                : "All hackathons have ended or haven't started yet."}
            </p>
          </div>
        ) : (
          liveHackathons.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))
        )}
      </div>

      {/* Past Hackathons */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Past Hackathons</h2>
        <div className="space-y-6">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  </div>
                  <div className="w-1/3 h-32 bg-muted animate-pulse rounded-lg" />
                </div>
              </div>
            ))
          ) : pastHackathons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No past hackathons to display
              </p>
            </div>
          ) : (
            pastHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
