"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play } from "lucide-react";
import type { ProjectComponentProps, HackathonComponentProps } from "@/types/hackathon";


interface ProjectHackathon {
  hackathon: {
    id: string;
    name: string;
    short_description: string;
    hackathon_start_date: string;
    hackathon_end_date: string;
    tech_stack?: string[];
    experience_level?: string;
    prize_cohorts?: Array<{ prize_amount?: string }>;
  };
  status: string;
}

interface ProjectDetailsSectionProps {
  project: ProjectComponentProps;
  projectHackathons: ProjectHackathon[];
  hackathon: HackathonComponentProps;
  activeTab: "overview" | "hackathon";
}

export function ProjectDetailsSection({
  project,
  projectHackathons,
  hackathon,
  activeTab,
}: ProjectDetailsSectionProps) {
  if (activeTab === "overview") {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <div>
            <p className="text-muted-foreground leading-relaxed">
              {project.description || "No description available"}
            </p>
          </div>

          {/* Demo and Code Links */}
          <div className="flex gap-4">
            {project.demo_url && (
              <Button asChild>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Demo Video
                </a>
              </Button>
            )}
            {project.repository_url && (
              <Button variant="outline" asChild>
                <a
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Repository
                </a>
              </Button>
            )}
          </div>

          {/* Video Placeholder */}
          <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <Play className="size-6 text-black ml-1" />
            </div>
          </div>

          {/* Project Description */}
          {project?.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Project Details
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {project.description || "No description available"}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Team Leader */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Team Leader
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm">Amaan Sayyad</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Github link
                </span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs"
                >
                  github.com ↗
                </a>
              </div>
            </div>
          </div>

          {/* Sector */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Sector
            </h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                SocialFi
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Infra
              </Badge>
              <Badge variant="secondary" className="text-xs">
                GameFi
              </Badge>
              <Badge variant="secondary" className="text-xs">
                NFT
              </Badge>
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            </div>
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs">
                DeFi
              </Badge>
            </div>
          </div>

          {project.team_members && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Team Members
              </h4>
              <div className="space-y-2">
                {project.team_members.map((member, index) => {
                  // Handle different member formats
                  const getMemberData = (member: any) => {
                    if (typeof member === "string") {
                      return {
                        name: member,
                        role: undefined,
                        github: undefined,
                      };
                    }
                    if (typeof member === "object" && member !== null) {
                      return {
                        name: member.name || "?",
                        role: member.role,
                        github: member.github,
                      };
                    }
                    return {
                      name: "?",
                      role: undefined,
                      github: undefined,
                    };
                  };

                  const memberData = getMemberData(member);
                  const stableKey =
                    memberData.github ||
                    memberData.name ||
                    `member-${index}`;

                  return (
                    <div
                      key={stableKey}
                      className="flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {memberData.name.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {memberData.name}
                        </span>
                        {memberData.role && (
                          <span className="text-xs text-muted-foreground">
                            {memberData.role}
                          </span>
                        )}
                        {memberData.github && (
                          <a
                            href={`https://github.com/${memberData.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            @{memberData.github}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1">
              {project.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Status
            </h4>
            <Badge
              variant={
                project.status === "submitted" ? "default" : "secondary"
              }
            >
              {project.status}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "hackathon") {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Submitted Hackathon</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {projectHackathons.map((submission) => {
            const hackathonData = submission.hackathon;
            const startDate = new Date(hackathonData.hackathon_start_date);
            const endDate = new Date(hackathonData.hackathon_end_date);

            return (
              <Card key={hackathonData.id} className="relative">
                {submission.status === "submitted" && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="bg-red-500">
                      Ended
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {hackathonData.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {hackathonData.short_description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Winner
                      </span>
                      <p>Announced</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Tech stack
                      </span>
                      <p>
                        {hackathonData.tech_stack?.join(", ") ||
                          "All tech stack"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Level
                      </span>
                      <p>
                        {hackathonData.experience_level?.toLowerCase() ||
                          "All levels accepted"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Total prize
                      </span>
                      <p>
                        {hackathonData.prize_cohorts?.[0]?.prize_amount ||
                          "50,000.00 USD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Online
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      {hackathon?.participantCount
                        ? `${hackathon.participantCount} Participants`
                        : "N/A Participants"}
                    </Button>
                  </div>
                </CardContent>

                {/* Hackathon branding/visual */}
                <div className="absolute top-0 right-0 w-32 h-20 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-bl-3xl" />
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}