"use client";

import { ChevronDown } from "lucide-react";
// import { HackathonCard } from "@/components/hackathon/display/hackathon-overview-card";
// import { FeaturedCarousel } from "@/components/hackathon/widgets/featured-carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAllBlockchainHackathons } from "@/hooks/blockchain/useBlockchainHackathons";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function ExplorePage() {
  const {
    data: blockchainHackathons = [],
    isLoading: loading,
    error,
  } = useAllBlockchainHackathons();

  // Filter state
  const [filters, setFilters] = useState({
    prizeRange: "",
    techStack: "",
    status: "",
  });

  // Helper function to get hackathon status based on dates
  const getHackathonStatus = (hackathon: any) => {
    const now = Date.now() / 1000; // Current time in Unix timestamp

    if (hackathon.registrationDeadline && now < Number(hackathon.registrationDeadline)) {
      return "Registration Open";
    } else if (hackathon.submissionDeadline && now < Number(hackathon.submissionDeadline)) {
      return "Live";
    } else if (hackathon.judgingDeadline && now < Number(hackathon.judgingDeadline)) {
      return "Voting";
    } else {
      return "Ended";
    }
  };

  // Process and filter hackathons
  const { allHackathons, liveHackathons, pastHackathons } = useMemo(() => {
    if (!blockchainHackathons || blockchainHackathons.length === 0) {
      return { allHackathons: [], liveHackathons: [], pastHackathons: [] };
    }

    // Apply filters
    let filteredHackathons = blockchainHackathons.filter((hackathon: any) => {
      // Prize range filter
      if (filters.prizeRange) {
        const totalPrizePool = hackathon.prizeCohorts?.reduce((sum: number, cohort: any) => {
          const amount = typeof cohort.prizeAmount === 'string' ? parseInt(cohort.prizeAmount) : cohort.prizeAmount;
          return sum + (amount || 0);
        }, 0) || 0;

        const minPrize = parseInt(filters.prizeRange.replace(/[^0-9]/g, ''));
        if (totalPrizePool < minPrize) return false;
      }

      // Tech stack filter
      if (filters.techStack) {
        const hackathonTechStack = hackathon.techStack || [];
        if (!hackathonTechStack.some((tech: string) => 
          tech.toLowerCase().includes(filters.techStack.toLowerCase())
        )) {
          return false;
        }
      }

      // Status filter
      if (filters.status) {
        const currentStatus = getHackathonStatus(hackathon);
        if (filters.status !== currentStatus) return false;
      }

      return true;
    });

    // Categorize hackathons
    const live = filteredHackathons.filter((hackathon: any) => {
      const status = getHackathonStatus(hackathon);
      return ["Registration Open", "Live", "Voting"].includes(status);
    });

    const past = filteredHackathons.filter((hackathon: any) => {
      const status = getHackathonStatus(hackathon);
      return status === "Ended";
    });

    return {
      allHackathons: filteredHackathons,
      liveHackathons: live,
      pastHackathons: past,
    };
  }, [blockchainHackathons, filters]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load hackathons", {
        description: "Please try refreshing the page",
      });
    }
  }, [error]);

  return (
    <div>
      {/* Featured Hackathon Carousel - TODO: Update to work with blockchain data */}
      {/* <FeaturedCarousel hackathons={allHackathons} /> */}

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filters.prizeRange || "Total Prize"} <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, prizeRange: "" }))}>
              All Prizes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, prizeRange: "$10,000+" }))}>
              $10,000+
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, prizeRange: "$50,000+" }))}>
              $50,000+
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, prizeRange: "$100,000+" }))}>
              $100,000+
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filters.techStack || "Tech Stack"} <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, techStack: "" }))}>
              All Tech
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, techStack: "AI" }))}>
              AI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, techStack: "Web3" }))}>
              Web3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, techStack: "React" }))}>
              React
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, techStack: "TypeScript" }))}>
              TypeScript
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, techStack: "Mobile" }))}>
              Mobile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filters.status || "Status"} <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "" }))}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "Registration Open" }))}>
              Registration Open
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "Live" }))}>
              Live
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "Voting" }))}>
              Voting
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, status: "Ended" }))}>
              Ended
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hackathon Grid */}
      <div className="grid gap-8">
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
              {blockchainHackathons.length === 0
                ? "No hackathons have been created yet."
                : "All hackathons have ended or haven't started yet."}
            </p>
          </div>
        ) : (
          liveHackathons.map((hackathon: any) => (
            <div key={hackathon.id} className="border rounded-lg p-6">
              <div className="flex">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold">{hackathon.name || `Hackathon #${hackathon.id}`}</h3>
                    <Badge variant="secondary">
                      {hackathon.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {hackathon.shortDescription || "No description available"}
                  </p>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Organizer</div>
                      <div className="text-muted-foreground">
                        {hackathon.organizer ? `${hackathon.organizer.slice(0, 6)}...${hackathon.organizer.slice(-4)}` : "Unknown"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Participants</div>
                      <div className="text-muted-foreground">{hackathon.participantCount?.toString() || "0"}</div>
                    </div>
                    <div>
                      <div className="font-medium">Projects</div>
                      <div className="text-muted-foreground">{hackathon.projectCount?.toString() || "0"}</div>
                    </div>
                    <div>
                      <div className="font-medium">Tech Stack</div>
                      <div className="text-muted-foreground">
                        {hackathon.techStack?.slice(0, 2).join(", ") || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past Hackathons */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Past Hackathons</h2>
        <div className="grid gap-8">
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
            pastHackathons.map((hackathon: any) => (
              <div key={hackathon.id} className="border rounded-lg p-6">
                <div className="flex">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold">{hackathon.name || `Hackathon #${hackathon.id}`}</h3>
                      <Badge variant="secondary">Ended</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {hackathon.shortDescription || "No description available"}
                    </p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Organizer</div>
                        <div className="text-muted-foreground">
                          {hackathon.organizer ? `${hackathon.organizer.slice(0, 6)}...${hackathon.organizer.slice(-4)}` : "Unknown"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Participants</div>
                        <div className="text-muted-foreground">{hackathon.participantCount?.toString() || "0"}</div>
                      </div>
                      <div>
                        <div className="font-medium">Projects</div>
                        <div className="text-muted-foreground">{hackathon.projectCount?.toString() || "0"}</div>
                      </div>
                      <div>
                        <div className="font-medium">Total Prize</div>
                        <div className="text-muted-foreground">
                          {hackathon.prizeCohorts?.reduce((sum: number, cohort: any) => {
                            const amount = typeof cohort.prizeAmount === 'string' ? parseInt(cohort.prizeAmount) : cohort.prizeAmount;
                            return sum + (amount || 0);
                          }, 0).toLocaleString() || "TBD"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
