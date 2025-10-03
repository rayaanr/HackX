"use client";

import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Trophy,
  Play,
  Plus,
  Search,
} from "lucide-react";
import { IconBrandGithub, IconShare } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTabs } from "@/components/ui/anim/animated-tab";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShareLink } from "@/components/share-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TextShimmerLoader } from "@/components/ui/loader";
import { PageLoading } from "@/components/ui/global-loading";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import {
  useBlockchainProject,
  useProjectTeamMembers,
  useBlockchainProjects,
} from "@/hooks/use-projects";
import { useHackathon, useRegisteredHackathons } from "@/hooks/use-hackathons";
import { useQueries } from "@tanstack/react-query";
import { useWeb3 } from "@/providers/web3-provider";
import { getHackathonById } from "@/lib/helpers/blockchain";
import { HackathonCard } from "@/components/hackathon/display/hackathon-overview-card";
import {
  formatDisplayDate,
  getUIHackathonStatus,
  formatDateRange,
} from "@/lib/helpers/date";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { UIHackathon } from "@/types/hackathon";
import { useEns } from "@/hooks/use-ens";
import { extractYouTubeVideoId, isYouTubeUrl } from "@/lib/helpers/video";
import { YouTubeEmbed } from "@next/third-parties/google";
import { marked } from "marked";
import { motion } from "motion/react";

function toHtmlFromDescription(input: string): string {
  if (!input) return "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(input);
  if (looksLikeHtml) return input;
  const html = marked.parse(input);
  return typeof html === "string" ? html : "";
}

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
        <AvatarFallback className="text-sm font-medium text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-medium text-white">
          {ensName || (index !== undefined ? `${role} ${index + 1}` : role)}
        </h4>
        <p className="text-sm text-white/70 font-mono">{displayName}</p>
        {ensName && (
          <p className="text-xs text-white/50 font-mono opacity-70">
            {address}
          </p>
        )}
      </div>
    </div>
  );
}

type RegisteredHackathon = UIHackathon & { isRegistered: boolean };

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
    },
  );

  const handleSubmit = (hackathonId: string) => {
    toast.loading("Submitting project to hackathon...", {
      id: "submit-to-hackathon",
    });
    submitToHackathon({
      projectId,
      hackathonId,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-4 h-4" />
          Submit to Hackathon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border border-white/20 bg-black/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Submit to Hackathon</DialogTitle>
          <DialogDescription className="text-white/70">
            Submit your project to hackathons you're registered for. Only active
            hackathons are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Registered Hackathons Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2 text-white">
              <Trophy className="w-4 h-4" />
              Your Registered Hackathons
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-white/20 rounded-lg"></div>
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
                        className="border border-green-500/50 bg-black/40 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-green-400/70"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex justify-between gap-2 mb-2">
                                <h4 className="font-medium text-white">
                                  {hackathon.name}
                                </h4>
                                <div className="flex gap-2">
                                  <Badge
                                    variant={
                                      status === "Live"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className={
                                      status === "Live"
                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                        : ""
                                    }
                                  >
                                    {status}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="text-green-400 border-green-500/50"
                                  >
                                    Registered
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-white/70 mb-2 line-clamp-1">
                                {hackathon.shortDescription}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-white/60">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {formatDateRange(
                                      hackathon.hackathonPeriod
                                        ?.hackathonStartDate,
                                      hackathon.hackathonPeriod
                                        ?.hackathonEndDate,
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
                          <Button
                            onClick={() =>
                              handleSubmit(hackathon.id.toString())
                            }
                            disabled={isSubmittingToHackathon}
                            size="sm"
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                          >
                            {isSubmittingToHackathon
                              ? "Submitting..."
                              : "Submit"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-white/20 rounded-xl bg-black/10 backdrop-blur-sm">
                <Trophy className="w-8 h-8 mx-auto text-white/40 mb-2" />
                <h4 className="font-medium mb-1 text-white">
                  No Registered Hackathons
                </h4>
                <p className="text-sm text-white/70">
                  You haven't registered for any active hackathons.
                </p>
              </div>
            )}
          </div>

          {/* Discover More Section */}
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2 text-white">
                <Search className="w-4 h-4" />
                Discover More Hackathons
              </h3>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:bg-white/10 hover:border-blue-400/50 hover:text-white transition-all duration-300"
              >
                <Link href="/hackathons" className="gap-2">
                  <ExternalLink className="w-3 h-3" />
                  Browse All
                </Link>
              </Button>
            </div>
            <p className="text-sm text-white/70">
              Register for more hackathons to expand your submission
              opportunities.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "hackathon" | "team">(
    "overview",
  );

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useBlockchainProject(id);
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(
    project?.hackathonIds?.[0] ? Number(project.hackathonIds[0]) : null,
  );
  const { data: teamMembers, isLoading: teamLoading } =
    useProjectTeamMembers(id);

  const { contract, client } = useWeb3();

  // Initialize empty queries array
  const [hackathonQueries, setHackathonQueries] = useState<any[]>([]);

  // Update queries when project data changes
  useEffect(() => {
    if (project?.hackathonIds && contract && client) {
      const newQueries = project.hackathonIds.map(
        (hackathonId: string | number) => ({
          queryKey: ["hackathon", hackathonId],
          queryFn: () => getHackathonById(contract, client, hackathonId),
          enabled: !!contract && !!client && !!project?.hackathonIds,
        }),
      );
      setHackathonQueries(newQueries);
    } else {
      setHackathonQueries([]);
    }
  }, [project?.hackathonIds, contract, client]);

  // Fetch submitted hackathons details
  const submittedHackathonQueries = useQueries({
    queries: hackathonQueries,
  });

  // Transform blockchain hackathon data to UIHackathon format
  const submittedHackathons = submittedHackathonQueries
    .map((query) => query.data)
    .filter(Boolean);

  const loading = projectLoading || hackathonLoading;
  const error = projectError;

  const projectTabs = [
    { text: "Overview", value: "overview" },
    { text: "Hackathon", value: "hackathon" },
    { text: "Team", value: "team" },
  ];

  if (loading) {
    return <PageLoading text="Loading project details" />;
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 border border-white/20 rounded-xl bg-black/20 backdrop-blur-sm">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Project Not Found
          </h1>
          <Link href="/projects">
            <Button className="hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300">
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex justify-between pb-6">
          <Link href="/projects">
            <Button
              variant="outline"
              className="hover:bg-white/10 hover:border-blue-400/50 hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-4">
            <Avatar className="size-24 border border-white/20 rounded-md shadow-lg mx-auto">
              {project?.logo ? (
                <AvatarImage
                  src={resolveIPFSToHttp(project.logo)}
                  alt={project?.name || "Project Logo"}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {project?.name?.charAt(0) || "P"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="">
              <h1 className="text-3xl font-bold mb-2 text-white">
                {project?.name || (
                  <TextShimmerLoader text="Loading project" size="lg" />
                )}
              </h1>
              <p className="text-white/70 mb-4 max-w-md">
                {project?.intro || (
                  <TextShimmerLoader text="Loading description" />
                )}
              </p>
            </div>
          </div>

          <ShareLink
            url={`${process.env.NEXT_PUBLIC_BASE_URL}/projects/${id}`}
            title={project?.name}
          >
            <Button
              variant="outline"
              className="hover:bg-white/10 hover:border-blue-400/50 hover:text-white transition-all duration-300"
            >
              <IconShare className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </ShareLink>
        </div>

        <div className="gap-2">
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] pb-[0.1rem]">
            <Separator className="absolute top-0 left-0 right-0" />
          </div>
          <div className="sticky top-14 backdrop-blur-xl border-white/10 z-10 pt-2">
            <div className="flex justify-center">
              <AnimatedTabs
                tabs={projectTabs}
                selectedTab={activeTab}
                onTabChange={(value) =>
                  setActiveTab(value as "overview" | "hackathon" | "team")
                }
                className="h-14 p-1"
              />
            </div>
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] mb-10 pt-2">
              <Separator className="absolute bottom-0 left-0 right-0" />
            </div>
          </div>

          <div className="container mx-auto ps-5">
            {activeTab === "overview" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Column - Hero Image */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Videos Section */}
                  {(project?.demoVideo || project?.pitchVideo) && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: -20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.5,
                            ease: [0.215, 0.61, 0.355, 1],
                          },
                        },
                      }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold text-white">
                        Videos
                      </h3>
                      <Tabs
                        defaultValue={project?.demoVideo ? "demo" : "pitch"}
                        className="w-full"
                      >
                        <TabsList className="h-auto rounded-none border-b bg-transparent p-0  justify-start w-full">
                          {project?.demoVideo && (
                            <TabsTrigger
                              value="demo"
                              className="data-[state=active]:after:bg-blue-600 relative border-none rounded-t-sm py-2 px-4 text-white/70 data-[state=active]:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-white transition-colors"
                            >
                              Demo Video
                            </TabsTrigger>
                          )}
                          {project?.pitchVideo && (
                            <TabsTrigger
                              value="pitch"
                              className="data-[state=active]:after:bg-blue-600 relative border-none rounded-t-sm py-2 px-4 text-white/70 data-[state=active]:text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-white transition-colors"
                            >
                              Pitch Video
                            </TabsTrigger>
                          )}
                        </TabsList>

                        {project?.demoVideo && (
                          <TabsContent
                            value="demo"
                            className="mt-6 data-[state=active]:block"
                          >
                            <div className="rounded-xl overflow-hidden border border-white/20 bg-black/20 backdrop-blur-sm shadow-2xl">
                              {isYouTubeUrl(project.demoVideo) ? (
                                <YouTubeEmbed
                                  videoid={
                                    extractYouTubeVideoId(project.demoVideo) ||
                                    ""
                                  }
                                  height={400}
                                  params="controls=1&modestbranding=1&rel=0"
                                />
                              ) : (
                                <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <Play className="w-12 h-12 mx-auto mb-2 text-white/60" />
                                    <p className="text-sm text-white/70 mb-4">
                                      Demo Video
                                    </p>
                                    <Button
                                      asChild
                                      className="hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300"
                                    >
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
                          </TabsContent>
                        )}

                        {project?.pitchVideo && (
                          <TabsContent
                            value="pitch"
                            className="mt-6 data-[state=active]:block"
                          >
                            <div className="rounded-xl overflow-hidden border border-white/20 bg-black/20 backdrop-blur-sm shadow-2xl">
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
                                <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <Play className="w-12 h-12 mx-auto mb-2 text-white/60" />
                                    <p className="text-sm text-white/70 mb-4">
                                      Pitch Video
                                    </p>
                                    <Button
                                      asChild
                                      className="hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300"
                                    >
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
                          </TabsContent>
                        )}
                      </Tabs>
                    </motion.div>
                  )}

                  {/* Description Section */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: -20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.215, 0.61, 0.355, 1],
                          delay: 0,
                        },
                      },
                    }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold text-white">
                      Description
                    </h3>
                    <div className="prose prose-sm prose-invert max-w-none [&>*]:text-white/80 [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>h4]:text-white [&>h5]:text-white [&>h6]:text-white [&>strong]:text-white">
                      {(() => {
                        const raw =
                          project?.description || project?.intro || "";
                        const html = toHtmlFromDescription(raw);
                        return parse(
                          DOMPurify.sanitize(html, {
                            ALLOWED_TAGS: [
                              "p",
                              "br",
                              "strong",
                              "em",
                              "u",
                              "del",
                              "h1",
                              "h2",
                              "h3",
                              "h4",
                              "h5",
                              "h6",
                              "ul",
                              "ol",
                              "li",
                              "a",
                              "blockquote",
                              "pre",
                              "code",
                              "hr",
                            ],
                            ALLOWED_ATTR: ["href", "target", "rel"],
                          }),
                        );
                      })()}
                    </div>
                    <Separator className="mt-12 mb-5" />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white text-lg">
                        Progress during Hackathon
                      </h4>
                      <p className="text-white/80 text-sm">
                        {project.progress}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: [0.215, 0.61, 0.355, 1],
                        delay: 0,
                      },
                    },
                  }}
                  className="space-y-8 sticky top-36 self-start"
                >
                  {/* GitHub Repository Card */}
                  {project?.githubLink && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: 0 },
                        },
                      }}
                    >
                      <Link
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Card className="border-white/20 bg-black/20 backdrop-blur-sm py-4 project-card-hover">
                          <CardContent className="flex gap-4 items-center">
                            <IconBrandGithub className="size-10 text-white shrink-0" />
                            <div>
                              <h4 className="font-medium text-white">
                                Github Repository
                              </h4>

                              <p className="max-w-[200px] break-all leading-tight text-sm text-blue-500">
                                {project.githubLink}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )}

                  {/* Tech Stack Card */}
                  {project?.techStack && project.techStack.length > 0 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: 0 },
                        },
                      }}
                      className="space-y-2"
                    >
                      <h4 className="font-semibold text-white">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map(
                          (tech: string, index: number) => (
                            <motion.div
                              key={index}
                              variants={{
                                hidden: { opacity: 0, scale: 0.8 },
                                visible: {
                                  opacity: 1,
                                  scale: 1,
                                  transition: {
                                    duration: 0.2,
                                    delay: 0 + index * 0.05,
                                  },
                                },
                              }}
                            >
                              <Badge variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            </motion.div>
                          ),
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Sectors */}
                  {project?.sector && project.sector.length > 0 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: 0 },
                        },
                      }}
                      className="space-y-2"
                    >
                      <h4 className="font-semibold text-white">Sectors</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.sector.map((sector: string, index: number) => (
                          <motion.div
                            key={index}
                            variants={{
                              hidden: { opacity: 0, scale: 0.8 },
                              visible: {
                                opacity: 1,
                                scale: 1,
                                transition: {
                                  duration: 0.2,
                                  delay: 0 + index * 0.05,
                                },
                              },
                            }}
                          >
                            <Badge
                              variant="secondary"
                              className="text-xs uppercase"
                            >
                              {sector}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Created At */}
                  <p className="text-sm">
                    Created On:{" "}
                    <span className="text-muted-foreground">
                      {project?.createdAt
                        ? formatDisplayDate(project.createdAt)
                        : "Unknown"}
                    </span>
                  </p>

                  {/* Hackathon Info */}
                  {hackathon && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: 0 },
                        },
                      }}
                    >
                      <Card className="border-white/20 bg-black/20 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white">
                            Hackathon
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3">
                            {hackathon.visual && (
                              <Image
                                src={resolveIPFSToHttp(hackathon.visual)}
                                alt={hackathon.name}
                                width={48}
                                height={48}
                                className="rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <Link href={`/hackathons/${hackathon.id}`}>
                                <h4 className="font-medium text-white hover:text-blue-400 transition-colors">
                                  {hackathon.name}
                                </h4>
                              </Link>
                              <p className="text-sm text-white/70">
                                {hackathon.shortDescription}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Calendar className="h-4 w-4" />
                            {formatDisplayDate(hackathon.startDate)} -{" "}
                            {formatDisplayDate(hackathon.endDate)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === "team" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="max-w-4xl"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: [0.215, 0.61, 0.355, 1],
                      },
                    },
                  }}
                  className="space-y-6"
                >
                  {/* Team Leader */}
                  {project?.creator && (
                    <Card className="border border-white/20 bg-black/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Team Leader
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TeamMember address={project.creator} role="Creator" />
                      </CardContent>
                    </Card>
                  )}

                  {/* Team Members */}
                  {teamLoading ? (
                    <Card className="border border-white/20 bg-black/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Team Members
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="animate-pulse">
                          <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-white/20 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : teamMembers && teamMembers.length > 0 ? (
                    <Card className="border border-white/20 bg-black/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Team Members
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {teamMembers.map(
                            (memberAddress: string, index: number) => (
                              <TeamMember
                                key={memberAddress}
                                address={memberAddress}
                                role="Member"
                                index={index}
                              />
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border border-white/20 bg-black/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">
                          Team Members
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70">
                          No additional team members found.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === "hackathon" && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="max-w-4xl"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: [0.215, 0.61, 0.355, 1],
                      },
                    },
                  }}
                  className="space-y-6"
                >
                  {/* Submit to Hackathon Action */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Current Submissions
                      </h2>
                      <p className="text-sm text-white/70">
                        Submit your project to active hackathons to compete for
                        prizes.
                      </p>
                    </div>
                    <HackathonSubmissionDialog projectId={id} />
                  </div>

                  {/* Current Submissions */}
                  {submittedHackathons && submittedHackathons.length > 0 ? (
                    <>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {submittedHackathons.map(
                          (hackathon: any, index: number) => (
                            <div key={index} className="relative">
                              <HackathonCard hackathon={hackathon} />
                              <div className="absolute top-4 right-4">
                                <Badge
                                  variant="outline"
                                  className="w-fit border-green-500/50 text-green-400 bg-green-500/10"
                                >
                                  Submitted
                                </Badge>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-xl bg-black/10 backdrop-blur-sm">
                      <Trophy className="w-12 h-12 mx-auto text-white/40 mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        No Hackathon Submissions
                      </h3>
                      <p className="text-white/70 mb-4">
                        This project hasn't been submitted to any hackathons
                        yet.
                      </p>
                      <HackathonSubmissionDialog projectId={id} />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
