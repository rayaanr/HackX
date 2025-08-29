"use client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/schemas/project-schema";
import { 
  ProjectHackathonCard,
  ProjectHackathonCardProps 
} from "@/components/project-hackathon-card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Mock hackathon data - in a real app, this would come from an API
const MOCK_HACKATHONS: ProjectHackathonCardProps[] = [
  {
    id: "1",
    name: "AI Innovation Challenge",
    date: "2025-09-15",
    theme: "Artificial Intelligence",
    prize: "$50,000",
    participants: 1200,
    status: "live"
  },
  {
    id: "2",
    name: "Blockchain Summit",
    date: "2025-10-20",
    theme: "Web3 & Cryptocurrency",
    prize: "$75,000",
    participants: 800,
    status: "upcoming"
  },
  {
    id: "3",
    name: "Green Tech Hackathon",
    date: "2025-11-05",
    theme: "Sustainability",
    prize: "$30,000",
    participants: 650,
    status: "upcoming"
  },
  {
    id: "4",
    name: "HealthTech Innovation",
    date: "2025-08-30",
    theme: "Healthcare Technology",
    prize: "$40,000",
    participants: 950,
    status: "live"
  }
];

type ProjectFormValues = z.infer<typeof projectSchema>;

export function HackathonSelectionStep() {
  const {
    control,
    setValue,
    watch,
  } = useFormContext<ProjectFormValues>();
  
  const [hackathons] = useState(MOCK_HACKATHONS);
  const [filteredHackathons, setFilteredHackathons] = useState(MOCK_HACKATHONS);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");
  
  const selectedHackathonIds = watch("hackathonIds") || [];

  useEffect(() => {
    if (filter === "all") {
      setFilteredHackathons(hackathons);
    } else {
      setFilteredHackathons(hackathons.filter(h => h.status === filter));
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
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                      >
                        All Hackathons
                      </Button>
                      <Button
                        variant={filter === "live" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("live")}
                      >
                        Live
                      </Button>
                      <Button
                        variant={filter === "upcoming" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("upcoming")}
                      >
                        Upcoming
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredHackathons.map((hackathon) => (
                        <div 
                          key={hackathon.id} 
                          className="relative"
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => toggleHackathonSelection(hackathon.id)}
                          >
                            <ProjectHackathonCard {...hackathon} />
                          </div>
                          <div className="absolute top-2 right-2">
                            <Checkbox
                              checked={selectedHackathonIds.includes(hackathon.id)}
                              onCheckedChange={() => toggleHackathonSelection(hackathon.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredHackathons.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No hackathons found for the selected filter.
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>Select the hackathons you want to submit your project to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}