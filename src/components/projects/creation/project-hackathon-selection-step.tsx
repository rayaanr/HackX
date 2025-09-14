"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";
import { type ProjectFormData } from "@/lib/schemas/project-schema";
import {
  ProjectHackathonCard,
  ProjectHackathonCardProps,
} from "@/components/projects/display/hackathon-card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useBlockchainHackathons } from "@/hooks/blockchain/useBlockchainHackathons";
import {
  getHackathonStatus,
  calculateTotalPrizeAmount,
  formatDateForDisplay,
} from "@/lib/helpers/hackathon-transforms";
import type { HackathonWithRelations } from "@/types/hackathon";

// Transform hackathon data to match ProjectHackathonCardProps interface
function transformHackathonToCardProps(
  hackathon: any, // Blockchain hackathon with combined contract + IPFS data
): ProjectHackathonCardProps {
  // For blockchain hackathons, we need to create a compatible object for getHackathonStatus
  // The blockchain hackathon has different field names than database hackathons
  const compatibleHackathon = {
    ...hackathon,
    hackathon_start_date:
      hackathon.hackathonPeriod?.hackathonStartDate ||
      hackathon.hackathon_start_date,
    short_description:
      hackathon.shortDescription || hackathon.short_description,
    participant_count:
      hackathon.participantCount || hackathon.participant_count || 0,
  };

  const status = getHackathonStatus(compatibleHackathon);

  // Map status to card status with improved logic
  let cardStatus: "live" | "upcoming" | "completed";
  if (status === "Voting" || status.toLowerCase().includes("voting")) {
    cardStatus = "live";
  } else if (
    status === "Registration Open" ||
    status === "Registration Closed" ||
    status.toLowerCase().includes("registration")
  ) {
    cardStatus = "upcoming";
  } else {
    cardStatus = status === "Live" ? "live" : "completed";
  }

  return {
    id: hackathon.id?.toString() || hackathon.blockchainId?.toString(),
    name: hackathon.name || "Untitled Hackathon",
    date: formatDateForDisplay(
      hackathon.hackathonPeriod?.hackathonStartDate ||
        hackathon.hackathon_start_date,
    ),
    theme: hackathon.shortDescription || hackathon.short_description || "",
    prize: calculateTotalPrizeAmount(compatibleHackathon),
    participants:
      hackathon.participantCount || hackathon.participant_count || 0,
    status: cardStatus,
  };
}

export function HackathonSelectionStep() {
  const { control, setValue, watch } = useFormContext<ProjectFormData>();
  // Updated to use blockchain hackathons instead of database hackathons
  // This ensures we only show hackathons stored on blockchain with IPFS metadata
  const {
    hackathons: hackathonData,
    isLoadingHackathons: isLoading,
    hackathonsError: error,
  } = useBlockchainHackathons();

  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");
  const selectedHackathonIds = watch("hackathonIds") || [];

  // Transform and filter hackathon data to card props format
  const { hackathons, filteredHackathons } = useMemo(() => {
    if (!hackathonData) return { hackathons: [], filteredHackathons: [] };

    const transformedHackathons = hackathonData.map(
      transformHackathonToCardProps,
    );
    const filtered =
      filter === "all"
        ? transformedHackathons
        : transformedHackathons.filter((h) => h.status === filter);

    return {
      hackathons: transformedHackathons,
      filteredHackathons: filtered,
    };
  }, [hackathonData, filter]);

  const toggleHackathonSelection = (id: string) => {
    const newSelectedIds = selectedHackathonIds.includes(id)
      ? selectedHackathonIds.filter((selectedId: string) => selectedId !== id)
      : [...selectedHackathonIds, id];

    setValue("hackathonIds", newSelectedIds);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Select Hackathons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="hackathonIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hackathon Selection *</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                      >
                        All Hackathons
                      </Button>
                      <Button
                        type="button"
                        variant={filter === "live" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("live")}
                      >
                        Live
                      </Button>
                      <Button
                        type="button"
                        variant={filter === "upcoming" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("upcoming")}
                      >
                        Upcoming
                      </Button>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading hackathons...
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-destructive">
                        Failed to load hackathons. Please try again.
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredHackathons.map((hackathon) => {
                            const isSubmissionPhase =
                              hackathon.status === "live";
                            return (
                              <div key={hackathon.id} className="relative">
                                <div
                                  className={`${!isSubmissionPhase ? "opacity-60" : ""}`}
                                >
                                  <ProjectHackathonCard {...hackathon} />
                                </div>
                                {!isSubmissionPhase && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                    <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded-md text-sm font-medium">
                                      Not accepting submissions
                                    </div>
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <Checkbox
                                    checked={selectedHackathonIds.includes(
                                      hackathon.id,
                                    )}
                                    disabled={!isSubmissionPhase}
                                    onCheckedChange={(checked) => {
                                      if (!isSubmissionPhase) return; // Prevent selection of non-submission phase hackathons
                                      const isChecked = checked === true;
                                      const next = isChecked
                                        ? Array.from(
                                            new Set([
                                              ...selectedHackathonIds,
                                              hackathon.id,
                                            ]),
                                          )
                                        : selectedHackathonIds.filter(
                                            (x: string) => x !== hackathon.id,
                                          );
                                      setValue("hackathonIds", next, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {filteredHackathons.length === 0 && !isLoading && (
                          <div className="text-center py-8 text-muted-foreground">
                            No hackathons found for the selected filter.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Select the hackathons you want to submit your project to. Only
                  hackathons in the "Live" submission phase can be selected.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
