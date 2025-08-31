"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { HackathonCard } from "@/components/hackathon-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserHackathons } from "@/hooks/queries/use-hackathons";
import { transformDatabaseToUI, getHackathonStatus } from "@/lib/utils/hackathon-transforms";
import { hackathons as mockHackathons } from "@/data/hackathons";
import { toast } from "sonner";
import { useEffect } from "react";

export default function ExplorePage() {
  const { data: dbHackathons = [], isLoading: loading, error } = useUserHackathons();

  // Transform database hackathons to UI format, fallback to mock data if no database data
  const allHackathons = dbHackathons.length > 0 
    ? dbHackathons.map(transformDatabaseToUI)
    : mockHackathons;

  const liveHackathons = allHackathons.filter((hackathon) => {
    const status = getHackathonStatus(hackathon);
    return status === "Registration Open" || status === "Registration Closed" || status === "Live" || status === "Voting";
  });
  
  const pastHackathons = allHackathons.filter((hackathon) => {
    const status = getHackathonStatus(hackathon);
    return status === "Ended";
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load hackathons", {
        description: "Showing sample data instead"
      });
    }
  }, [error]);

  return (
    <div>
      {/* Featured Hackathon Banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-8 md:p-12 mb-12">
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Featured</Badge>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            Open Source Frontier – AI x WEB3 x Transparency
          </h1>
          <p className="text-lg md:text-xl mb-6">
            A new paradigm for open source development.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
            <div>
              <p className="font-semibold text-sm">Registration Deadline</p>
              <p className="text-lg">2025-09-15</p>
            </div>
            <div>
              <p className="font-semibold text-sm">Tech Stack</p>
              <p className="text-lg">AI, Web3</p>
            </div>
            <div>
              <p className="font-semibold text-sm">Level</p>
              <p className="text-lg">All</p>
            </div>
            <div>
              <p className="font-semibold text-sm">Total Prize</p>
              <p className="text-lg">$50,000</p>
            </div>
          </div>
          <Button size="lg">
            Start Register <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>

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
        <Button variant="outline">Host a Hackathon</Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Total Prize <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>$10,000+</DropdownMenuItem>
            <DropdownMenuItem>$50,000+</DropdownMenuItem>
            <DropdownMenuItem>$100,000+</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Ecosystem <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Solana</DropdownMenuItem>
            <DropdownMenuItem>Ethereum</DropdownMenuItem>
            <DropdownMenuItem>Polygon</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Tech Stack <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>AI</DropdownMenuItem>
            <DropdownMenuItem>Web3</DropdownMenuItem>
            <DropdownMenuItem>Mobile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Live</DropdownMenuItem>
            <DropdownMenuItem>Voting</DropdownMenuItem>
            <DropdownMenuItem>Ended</DropdownMenuItem>
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
              {dbHackathons.length === 0 
                ? "No hackathons have been created yet." 
                : "All hackathons have ended or haven't started yet."
              }
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
              <p className="text-muted-foreground">No past hackathons to display</p>
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
