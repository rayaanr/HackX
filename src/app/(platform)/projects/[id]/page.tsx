"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Edit,
  Play,
  Plus,
  Calendar,
  Trophy,
  Search,
} from "lucide-react";
import Link from "next/link";
import { YouTubeEmbed } from "@next/third-parties/google";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useBlockchainProject,
  useProjectTeamMembers,
  useBlockchainProjects,
} from "@/hooks/blockchain/useBlockchainProjects";
import { useRegisteredHackathons } from "@/hooks/blockchain/useBlockchainHackathons";
import { extractYouTubeVideoId, isYouTubeUrl } from "@/lib/helpers/video";
import { useEns } from "@/hooks/use-ens";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getUIHackathonStatus,
  formatDateRange,
  type DateInput,
} from "@/lib/helpers/date";
import type { UIHackathon } from "@/types/hackathon";

type RegisteredHackathon = UIHackathon & { isRegistered: boolean };

// Team member component with ENS support
function TeamMember({
  address,
  role = "Member",
  index,
}: {
  address: string;
  role?: string;
  index?: number;
}) {
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
        <p className="text-sm text-muted-foreground font-mono">{displayName}</p>
        {ensName && (
          <p className="text-xs text-muted-foreground font-mono opacity-70">
            {address}
          </p>
        )}
      </div>
    </div>
  );
}

// Hackathon submission dialog component
function HackathonSubmissionDialog({ projectId }: { projectId: string }) {
  const { hackathons: registeredHackathons = [], isLoading } =
    useRegisteredHackathons();
  const { submitToHackathon, isSubmittingToHackathon } =
    useBlockchainProjects();
  const [open, setOpen] = useState(false);

  // Filter registered hackathons to only show active ones
  const availableRegisteredHackathons = registeredHackathons.filter(
    (hackathon: RegisteredHackathon) => {
      const status = getUIHackathonStatus({
        ...hackathon,
        votingPeriod: hackathon.votingPeriod || undefined,
      });
      return status === "Registration Open" || status === "Live";
    }
  );

  const handleSubmit = (hackathonId: string) => {
    toast.loading("Submitting project to hackathon...", { id: "submit-to-hackathon" });
    submitToHackathon({
      projectId,
      hackathonId,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Submit to Hackathon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit to Hackathon</DialogTitle>
          <DialogDescription>
            Submit your project to hackathons you're registered for. Only active
            hackathons are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Registered Hackathons Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Your Registered Hackathons
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : availableRegisteredHackathons.length > 0 ? (
              <div className="space-y-3">
                {availableRegisteredHackathons.map(
                  (hackathon: RegisteredHackathon) => {
                    const status = getUIHackathonStatus({
                      ...hackathon,
                      votingPeriod: hackathon.votingPeriod || undefined,
                    });

                    return (
                      <Card
                        key={hackathon.id}
                        className="border-green-200 dark:border-green-800 gap-0"
                      >
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex justify-between gap-2 mb-2">
                                <h4 className="font-medium">
                                  {hackathon.name}
                                </h4>
                                <div className="flex gap-2">
                                  <Badge
                                    variant={
                                      status === "Live"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {status}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-green-600 border-green-600"
                                  >
                                    Registered
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                {hackathon.shortDescription}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {formatDateRange(
                                      hackathon.hackathonPeriod
                                        ?.hackathonStartDate,
                                      hackathon.hackathonPeriod
                                        ?.hackathonEndDate
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  <span>
                                    {hackathon.prizeCohorts?.length
                                      ? `${hackathon.prizeCohorts.length} Prizes`
                                      : "TBD"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 px-4">
                          <Button
                            onClick={() =>
                              handleSubmit(hackathon.id.toString())
                            }
                            disabled={isSubmittingToHackathon}
                            size="sm"
                            className="w-full"
                          >
                            {isSubmittingToHackathon
                              ? "Submitting..."
                              : "Submit"}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
                <Trophy className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <h4 className="font-medium mb-1">No Registered Hackathons</h4>
                <p className="text-sm text-muted-foreground">
                  You haven't registered for any active hackathons.
                </p>
              </div>
            )}
          </div>

          {/* Discover More Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                Discover More Hackathons
              </h3>
              <Button variant="outline" size="sm" asChild>
                <Link href="/hackathons" className="gap-2">
                  <ExternalLink className="w-3 h-3" />
                  Browse All
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Register for more hackathons to expand your submission
              opportunities.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "hackathon" | "team">(
    "overview"
  );

  const { data: project, isLoading, error } = useBlockchainProject(projectId);

  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } =
    useProjectTeamMembers(projectId);

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
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "overview" | "hackathon" | "team")
          }
        >
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
                          <h3 className="text-lg font-medium mb-3">
                            Demo Video
                          </h3>
                          <div className="rounded-lg overflow-hidden">
                            {isYouTubeUrl(project.demoVideo) ? (
                              <YouTubeEmbed
                                videoid={
                                  extractYouTubeVideoId(project.demoVideo) || ""
                                }
                                height={400}
                                params="controls=1&modestbranding=1&rel=0"
                              />
                            ) : (
                              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Video Preview
                                  </p>
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
                          <h3 className="text-lg font-medium mb-3">
                            Pitch Video
                          </h3>
                          <div className="rounded-lg overflow-hidden">
                            {isYouTubeUrl(project.pitchVideo) ? (
                              <YouTubeEmbed
                                videoid={
                                  extractYouTubeVideoId(project.pitchVideo) ||
                                  ""
                                }
                                height={400}
                                params="controls=1&modestbranding=1&rel=0"
                              />
                            ) : (
                              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Video Preview
                                  </p>
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
                    <h2 className="text-xl font-semibold mb-4">
                      Progress During Hackathon
                    </h2>
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
                    <h2 className="text-xl font-semibold mb-4">
                      Fundraising Status
                    </h2>
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
              {/* Submit to Hackathon Action */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    Hackathon Submissions
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Submit your project to active hackathons to compete for
                    prizes.
                  </p>
                </div>
                <HackathonSubmissionDialog projectId={projectId} />
              </div>

              {/* Current Submissions */}
              {project.submittedToHackathons &&
              project.submittedToHackathons.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Current Submissions
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {project.submittedToHackathons.map(
                      (
                        hackathon: { name?: string; description?: string },
                        index: number
                      ) => (
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
                              {hackathon.description ||
                                "No description available"}
                            </p>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Hackathon Submissions
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    This project hasn't been submitted to any hackathons yet.
                  </p>
                  <HackathonSubmissionDialog projectId={projectId} />
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
                    <p className="text-muted-foreground">
                      No additional team members found.
                    </p>
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
