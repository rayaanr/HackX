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
import {
  type ProjectFormData,
} from "@/lib/schemas/project-schema";
import {
  ProjectHackathonCard,
  ProjectHackathonCardProps,
} from "@/components/project-hackathon-card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useAllHackathons } from "@/hooks/queries/use-hackathons";
import {
  getHackathonStatus,
  calculateTotalPrizeAmount,
  formatDateForDisplay,
} from "@/lib/helpers/hackathon-transforms";
import type { HackathonWithRelations } from "@/types/hackathon";

// Transform hackathon data to match ProjectHackathonCardProps interface
function transformHackathonToCardProps(
  hackathon: HackathonWithRelations
): ProjectHackathonCardProps {
  const status = getHackathonStatus(hackathon);

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
    id: hackathon.id,
    name: hackathon.name,
    date: formatDateForDisplay(hackathon.hackathon_start_date),
    theme: hackathon.short_description,
    prize: calculateTotalPrizeAmount(hackathon),
    participants: hackathon.participant_count || 0,
    status: cardStatus,
  };
}

export function HackathonSelectionStep() {
  const { control, setValue, watch } = useFormContext<ProjectFormData>();
  const { data: hackathonData, isLoading, error } = useAllHackathons();

  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");
  const selectedHackathonIds = watch("hackathonIds") || [];

  // Transform hackathon data to card props format
  const hackathons = useMemo(() => {
    if (!hackathonData) return [];
    return hackathonData.map(transformHackathonToCardProps);
  }, [hackathonData]);

  const [filteredHackathons, setFilteredHackathons] = useState<
    ProjectHackathonCardProps[]
  >([]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredHackathons(hackathons);
    } else {
      setFilteredHackathons(hackathons.filter((h) => h.status === filter));
    }
  }, [filter, hackathons]);

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
                          {filteredHackathons.map((hackathon) => (
                            <div key={hackathon.id} className="relative">
                              <ProjectHackathonCard {...hackathon} />
                              <div className="absolute top-2 right-2">
                                <Checkbox
                                  checked={selectedHackathonIds.includes(
                                    hackathon.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    const isChecked = checked === true;
                                    const next = isChecked
                                      ? Array.from(
                                          new Set([
                                            ...selectedHackathonIds,
                                            hackathon.id,
                                          ])
                                        )
                                      : selectedHackathonIds.filter(
                                          (x: string) => x !== hackathon.id
                                        );
                                    setValue("hackathonIds", next, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          ))}
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
                  Select the hackathons you want to submit your project to
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
