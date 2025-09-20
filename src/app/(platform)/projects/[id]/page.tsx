"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, GitBranch, Edit, Play } from "lucide-react";
import Link from "next/link";
import { YouTubeEmbed } from "@next/third-parties/google";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlockchainProject, useProjectTeamMembers } from "@/hooks/blockchain/useBlockchainProjects";
import { extractYouTubeVideoId, isYouTubeUrl } from "@/lib/helpers/video";
import { useEns } from "@/hooks/use-ens";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Team member component with ENS support
function TeamMember({ address, role = "Member", index }: { address: string; role?: string; index?: number }) {
  const { ensName, ensAvatar, displayName, initials } = useEns(address);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-10 w-10">
        {ensAvatar && (
          <AvatarImage src={ensAvatar} alt={ensName || "ENS Avatar"} />
        )}
        <AvatarFallback className="text-sm font-medium bg-secondary/50">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-medium">
          {ensName || (index !== undefined ? `${role} ${index + 1}` : role)}
        </h4>
        <p className="text-sm text-muted-foreground font-mono">
          {displayName}
        </p>
        {ensName && (
          <p className="text-xs text-muted-foreground font-mono opacity-70">
            {address}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "hackathon" | "team">("overview");

  const {
    data: project,
    isLoading,
    error,
  } = useBlockchainProject(projectId);

  const {
    data: teamMembers = [],
    isLoading: isLoadingTeamMembers,
  } = useProjectTeamMembers(projectId);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return notFound();
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Project Header Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Project Logo */}
          <div className="flex-shrink-0">
            {project.logo ? (
              <img
                src={project.logo}
                alt={project.name || "Project logo"}
                className="w-32 h-32 rounded-2xl object-cover border"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center border">
                <span className="text-2xl font-bold text-primary">
                  {(project.name || "P").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3">
                  {project.name || "Untitled Project"}
                </h1>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  {project.intro || "No description provided"}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="lg" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Project
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {project.githubLink && (
                <Button variant="outline" asChild>
                  <Link
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Repository
                  </Link>
                </Button>
              )}
              {project.demoVideo && (
                <Button variant="outline" asChild>
                  <Link
                    href={project.demoVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Demo Video
                  </Link>
                </Button>
              )}
              {project.pitchVideo && (
                <Button variant="outline" asChild>
                  <Link
                    href={project.pitchVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Pitch Video
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "hackathon" | "team")}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hackathon">Hackathon</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {/* Description */}
                {project.description && (
                  <div>
                    <div
                      className="text-muted-foreground leading-relaxed prose prose-lg max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                  </div>
                )}

                {/* Videos Section */}
                {(project.demoVideo || project.pitchVideo) && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Videos</h2>
                    <div className="space-y-6">
                      {project.demoVideo && (
                        <div>
                          <h3 className="text-lg font-medium mb-3">Demo Video</h3>
                          <div className="rounded-lg overflow-hidden">
                            {isYouTubeUrl(project.demoVideo) ? (
                              <YouTubeEmbed
                                videoid={extractYouTubeVideoId(project.demoVideo) || ""}
                                height={400}
                                params="controls=1&modestbranding=1&rel=0"
                              />
                            ) : (
                              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground mb-4">Video Preview</p>
                                  <Button asChild>
                                    <Link
                                      href={project.demoVideo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Watch Video
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {project.pitchVideo && (
                        <div>
                          <h3 className="text-lg font-medium mb-3">Pitch Video</h3>
                          <div className="rounded-lg overflow-hidden">
                            {isYouTubeUrl(project.pitchVideo) ? (
                              <YouTubeEmbed
                                videoid={extractYouTubeVideoId(project.pitchVideo) || ""}
                                height={400}
                                params="controls=1&modestbranding=1&rel=0"
                              />
                            ) : (
                              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground mb-4">Video Preview</p>
                                  <Button asChild>
                                    <Link
                                      href={project.pitchVideo}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Watch Video
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress */}
                {project.progress && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Progress During Hackathon</h2>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {project.progress}
                        </p>
                        {/* Tech Stack */}
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="pt-4 border-t">
                            <div className="flex flex-wrap gap-2">
                              {project.techStack.map((tech: string) => (
                                <Badge key={tech} variant="secondary">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Fundraising Status */}
                {project.fundraisingStatus && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Fundraising Status</h2>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {project.fundraisingStatus}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hackathon" className="mt-8">
            <div className="space-y-6">
              {/* Hackathon Submissions */}
              {project.submittedToHackathons && project.submittedToHackathons.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {project.submittedToHackathons.map((hackathon: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {hackathon.name || `Hackathon #${index + 1}`}
                        </CardTitle>
                        <Badge variant="outline" className="w-fit">
                          Submitted
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {hackathon.description || "No description available"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No Hackathon Submissions</h3>
                  <p className="text-muted-foreground">
                    This project hasn't been submitted to any hackathons yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-8">
            <div className="space-y-6">
              {/* Team Leader */}
              {project?.creator && (
                <Card>
                  <CardHeader>
                    <CardTitle>Team Leader</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TeamMember address={project.creator} role="Creator" />
                  </CardContent>
                </Card>
              )}

              {/* Team Members */}
              {isLoadingTeamMembers ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : teamMembers.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.map((memberAddress, index) => (
                        <TeamMember
                          key={memberAddress}
                          address={memberAddress}
                          role="Member"
                          index={index}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No additional team members found.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
