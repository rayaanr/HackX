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
import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { calculateTotalPrizeAmount } from "@/lib/helpers/blockchain-transforms";
import { getUIHackathonStatus, formatDisplayDate } from "@/lib/helpers/date";
import { useRegisteredHackathons } from "@/hooks/use-hackathons";

function transformHackathonToCardProps(
  hackathon: any, // Blockchain hackathon with combined contract + IPFS data
): ProjectHackathonCardProps {
  // Use the shared UI hackathon status helper
  const status = getUIHackathonStatus(hackathon);

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
    id: hackathon.id?.toString(),
    name: hackathon.name || "Untitled Hackathon",
    date: formatDisplayDate(hackathon.hackathonPeriod?.hackathonStartDate),
    theme: hackathon.shortDescription || "",
    prize: calculateTotalPrizeAmount(hackathon.prizeCohorts || []),
    participants: hackathon.participantCount || 0,
    status: cardStatus,
  };
}

export function HackathonSelectionStep() {
  const { control, setValue, watch } = useFormContext<ProjectFormData>();
  // Updated to use registered hackathons only
  const {
    hackathons: hackathonData,
    isLoading,
    error,
    isConnected,
  } = useRegisteredHackathons();

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

  return (
    <div className="space-y-8">
      <Card className="bg-transparent/30">
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
                    {/* Removed filter buttons since we only show registered hackathons */}

                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading registered hackathons...
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-destructive">
                        Failed to load hackathons. Please try again.
                      </div>
                    ) : !isConnected ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          Connect your wallet to see registered hackathons
                        </p>
                      </div>
                    ) : hackathonData.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="max-w-sm mx-auto">
                          <div className="mb-4">
                            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                              No Registered Hackathons
                            </h3>
                            <p className="text-muted-foreground mb-6">
                              You haven't registered for any hackathons yet.
                              Register for a hackathon to submit your project.
                            </p>
                          </div>
                          <Link href="/hackathons">
                            <Button className="w-full">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Explore Hackathons
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredHackathons.map((hackathon: any) => {
                            // Check if hackathon is accepting submissions
                            const isAcceptingSubmissions =
                              hackathon.status === "live";
                            return (
                              <div key={hackathon.id} className="relative">
                                <div
                                  className={`${
                                    !isAcceptingSubmissions ? "opacity-60" : ""
                                  }`}
                                >
                                  <ProjectHackathonCard {...hackathon} />
                                </div>
                                {!isAcceptingSubmissions && (
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
                                    disabled={!isAcceptingSubmissions}
                                    onCheckedChange={(checked) => {
                                      if (!isAcceptingSubmissions) return; // Prevent selection of non-submission phase hackathons
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
