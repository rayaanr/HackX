"use client";

import { ChevronDown, CirclePlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
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
import EmptyComponent from "@/components/empty";

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

  // Dropdown open states for animations
  const [dropdownStates, setDropdownStates] = useState({
    prizeRange: false,
    techStack: false,
    status: false,
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

    // Filter live hackathons to only show those accepting submissions
    const filterLiveHackathons = (hackathons: UIHackathon[]) => {
      return hackathons.filter((hackathon) => {
        const currentStatus = getUIHackathonStatus({
          ...hackathon,
          votingPeriod: hackathon.votingPeriod || undefined,
        });
        // Only show hackathons in active submission phases
        return (
          currentStatus === "Coming Soon" ||
          currentStatus === "Registration Open" ||
          currentStatus === "Registration Closed" ||
          currentStatus === "Submission Starting" ||
          currentStatus === "Live"
        );
      });
    };

    // Filter past hackathons - all hackathons where submission phase has ended
    const filterPastHackathons = (hackathons: UIHackathon[]) => {
      return hackathons.filter((hackathon) => {
        const currentStatus = getUIHackathonStatus({
          ...hackathon,
          votingPeriod: hackathon.votingPeriod || undefined,
        });
        // Show hackathons that are in voting/judging phase or completely ended
        return (
          currentStatus === "Submission Ended" ||
          currentStatus === "Judging Starting" ||
          currentStatus === "Voting" ||
          currentStatus === "Ended"
        );
      });
    };

    return {
      liveHackathons: applyFilters(filterLiveHackathons(initialLiveHackathons)),
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

  const ease: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.55, ease },
    }),
  } as const;

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative">
        {/* Explore Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Explore Hackathons
              </span>
            </h1>
            <p className="text-sm md:text-base text-white/50 leading-relaxed">
              Discover live and past hackathons. Filter by prize pool, stack,
              and status to find the perfect challenge.
            </p>
          </div>
          <Button
            asChild
            className={cn(
              "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25",
              "transition-all duration-200 hover:scale-[1.02]",
            )}
          >
            <Link href="/hackathons/create">
              <CirclePlus />
              Host a Hackathon
            </Link>
          </Button>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="flex flex-wrap gap-3 md:gap-4 mb-10"
        >
          {/* Prize Range Filter */}
          <DropdownMenu
            onOpenChange={(open) =>
              setDropdownStates((prev) => ({ ...prev, prizeRange: open }))
            }
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="backdrop-blur-sm bg-white/[0.04] border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 text-white/80 hover:text-blue-500 transition-all duration-300 group"
              >
                {prizeRangeOptions.find(
                  (option) => option.value === filters.prizeRange,
                )?.label || "Total Prize"}{" "}
                <motion.div
                  animate={{ rotate: dropdownStates.prizeRange ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ChevronDown className="ml-2 w-4 h-4" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {dropdownStates.prizeRange && (
                <DropdownMenuContent asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="border border-white/10 bg-black/40 backdrop-blur-md shadow-xl shadow-black/20 min-w-[160px] rounded-xl p-2 z-50"
                  >
                    {prizeRangeOptions.map((option, index) => (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              prizeRange: option.value,
                            }));
                            setDropdownStates((prev) => ({
                              ...prev,
                              prizeRange: false,
                            }));
                          }}
                          className="text-white/70 hover:text-blue-500 hover:bg-blue-500/10 focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer transition-all duration-200 rounded-lg px-3 py-2 text-sm font-medium"
                        >
                          {option.label}
                        </DropdownMenuItem>
                      </motion.div>
                    ))}
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>

          {/* Tech Stack Filter */}
          <DropdownMenu
            onOpenChange={(open) =>
              setDropdownStates((prev) => ({ ...prev, techStack: open }))
            }
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="backdrop-blur-sm bg-white/[0.04] border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 text-white/80 hover:text-blue-500 transition-all duration-300 group"
              >
                {techStackOptions.find(
                  (option) => option.value === filters.techStack,
                )?.label || "Tech Stack"}{" "}
                <motion.div
                  animate={{ rotate: dropdownStates.techStack ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ChevronDown className="ml-2 w-4 h-4" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {dropdownStates.techStack && (
                <DropdownMenuContent asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="border border-white/10 bg-black/40 backdrop-blur-md shadow-xl shadow-black/20 min-w-[160px] rounded-xl p-2 z-50"
                  >
                    {techStackOptions.map((option, index) => (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              techStack: option.value,
                            }));
                            setDropdownStates((prev) => ({
                              ...prev,
                              techStack: false,
                            }));
                          }}
                          className="text-white/70 hover:text-blue-500 hover:bg-blue-500/10 focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer transition-all duration-200 rounded-lg px-3 py-2 text-sm font-medium"
                        >
                          {option.label}
                        </DropdownMenuItem>
                      </motion.div>
                    ))}
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu
            onOpenChange={(open) =>
              setDropdownStates((prev) => ({ ...prev, status: open }))
            }
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="backdrop-blur-sm bg-white/[0.04] border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 text-white/80 hover:text-blue-500 transition-all duration-300 group"
              >
                {statusOptions.find((option) => option.value === filters.status)
                  ?.label || "Status"}{" "}
                <motion.div
                  animate={{ rotate: dropdownStates.status ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ChevronDown className="ml-2 w-4 h-4" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <AnimatePresence>
              {dropdownStates.status && (
                <DropdownMenuContent asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="border border-white/10 bg-black/40 backdrop-blur-md shadow-xl shadow-black/20 min-w-[160px] rounded-xl p-2 z-50"
                  >
                    {statusOptions.map((option, index) => (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              status: option.value,
                            }));
                            setDropdownStates((prev) => ({
                              ...prev,
                              status: false,
                            }));
                          }}
                          className="text-white/70 hover:text-blue-500 hover:bg-blue-500/10 focus:bg-blue-500/10 focus:text-blue-500 cursor-pointer transition-all duration-200 rounded-lg px-3 py-2 text-sm font-medium"
                        >
                          {option.label}
                        </DropdownMenuItem>
                      </motion.div>
                    ))}
                  </motion.div>
                </DropdownMenuContent>
              )}
            </AnimatePresence>
          </DropdownMenu>
        </motion.div>

        {/* Hackathon Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="space-y-6"
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
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
            ))
          ) : liveHackathons.length === 0 ? (
            <EmptyComponent
              title="No active hackathons"
              description={
                allHackathons.length === 0
                  ? "No hackathons have been created yet."
                  : "All hackathons have ended or haven't started yet."
              }
              type="info"
              variant="ghost"
            />
          ) : (
            liveHackathons.map((hackathon, i) => (
              <motion.div
                key={hackathon.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <HackathonCard hackathon={hackathon} />
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Past Hackathons */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          className="mt-20"
        >
          <h2 className="text-2xl font-semibold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Past Hackathons
          </h2>
          <div className="space-y-6">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
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
                    </div>
                    <div className="w-1/3 h-32 bg-white/10 rounded-lg" />
                  </div>
                </div>
              ))
            ) : pastHackathons.length === 0 ? (
              <EmptyComponent
                title="No past hackathons"
                description="No past hackathons to display"
                type="info"
                variant="ghost"
              />
            ) : (
              pastHackathons.map((hackathon, i) => (
                <motion.div
                  key={hackathon.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <HackathonCard hackathon={hackathon} />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
