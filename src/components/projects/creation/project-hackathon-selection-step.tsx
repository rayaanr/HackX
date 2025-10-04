"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
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
import EmptyComponent from "@/components/empty";

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
    status === "Coming Soon" ||
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
  // Only show hackathons the user is registered for
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
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="hackathonIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Hackathon Selection</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {/* Removed filter buttons since we only show registered hackathons */}

                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading registered hackathons...
                      </div>
                    ) : error ? (
                      <EmptyComponent
                        title="Failed to load hackathons"
                        description="Please try again."
                        type="error"
                        variant="ghost"
                      />
                    ) : !isConnected ? (
                      <EmptyComponent
                        title="Connect Your Wallet"
                        description="Connect your wallet to see registered hackathons"
                        type="wallet-connect"
                        variant="ghost"
                      />
                    ) : hackathonData.length === 0 ? (
                      <EmptyComponent
                        title="No Registered Hackathons"
                        description="You must register for a hackathon before you can submit your project. Explore hackathons to find one to register for."
                        type="info"
                        variant="ghost"
                        icon={
                          <ExternalLink className="size-12 text-white/50" />
                        }
                        action={
                          <Link href="/hackathons">
                            <Button>
                              <ExternalLink className="size-4" />
                              Explore Hackathons
                            </Button>
                          </Link>
                        }
                      />
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredHackathons.map((hackathon: any) => {
                            // Check if hackathon is accepting submissions
                            const isAcceptingSubmissions =
                              hackathon.status === "live";

                            // Get the actual status from the raw hackathon data
                            const rawHackathon = hackathonData.find(
                              (h: any) => h.id?.toString() === hackathon.id,
                            );
                            const actualStatus = rawHackathon
                              ? getUIHackathonStatus({
                                  ...rawHackathon,
                                  votingPeriod:
                                    rawHackathon.votingPeriod || undefined,
                                })
                              : hackathon.status;

                            return (
                              <div key={hackathon.id} className="relative">
                                <div
                                  className={`${
                                    !isAcceptingSubmissions ? "opacity-75" : ""
                                  }`}
                                >
                                  <ProjectHackathonCard {...hackathon} />
                                </div>
                                {!isAcceptingSubmissions && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
                                    <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg border border-white/10">
                                      <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Current Status
                                        </div>
                                        <div className="font-semibold">
                                          {actualStatus}
                                        </div>
                                      </div>
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
                  hackathons you've registered for and that are in the "Live"
                  submission phase can be selected.
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
