"use client";

import { ArrowLeft } from "lucide-react";
import {
  IconShare,
  IconBrandTwitter,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandDiscord,
  IconBrandTelegram,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTabs } from "@/components/ui/anim/animated-tab";
import { RegistrationButton } from "@/components/hackathon/widgets/registration-button";
import { ToDoList } from "@/components/hackathon/widgets/todo-list";
import { ShareLink } from "@/components/share-link";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { Separator } from "@/components/ui/separator";
import { TextShimmerLoader } from "@/components/ui/loader";
import { PageLoading } from "@/components/ui/global-loading";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import { PrizeAndJudgeTab } from "@/components/hackathon/display/hackathon-prizes-judges-tab";
import { ScheduleTab } from "@/components/hackathon/display/hackathon-schedule-tab";
import { SubmittedProjectsTab } from "@/components/hackathon/display/hackathon-projects-gallery-tab";
import { useHackathon } from "@/hooks/use-hackathons";
import { Countdown } from "@/components/hackathon/widgets/countdown";
import { formatDisplayDate } from "@/lib/helpers/date";
import { IPFSHashDisplay } from "@/components/ui/ipfs-hash-display";
import { motion } from "motion/react";
import EmptyComponent from "@/components/empty";

function toHtmlFromDescription(input: string): string {
  if (!input) return "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(input);
  if (looksLikeHtml) return input;
  const html = marked.parse(input);
  return typeof html === "string" ? html : "";
}

export default function HackathonPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<
    "overview" | "prize" | "schedule" | "projects"
  >("overview");

  const { data: hackathon, isLoading: loading, error } = useHackathon(id);

  const hackathonTabs = [
    { text: "Overview", value: "overview" },
    { text: "Prize & Judge", value: "prize" },
    { text: "Schedule", value: "schedule" },
    { text: "Project Gallery", value: "projects" },
  ];

  if (loading) {
    return <PageLoading text="Loading hackathon details" />;
  }

  if (error || !hackathon) {
    return (
      <EmptyComponent
        title="Hackathon Not Found"
        description="We couldn't find the hackathon you were looking for."
        type="info"
        variant="ghost"
      />
    );
  }

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex justify-between pb-6">
          <Link href="/hackathons">
            <Button
              variant="outline"
              className="hover:bg-white/10 hover:border-blue-400/50 hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {hackathon?.name || (
                <TextShimmerLoader text="Loading hackathon" size="lg" />
              )}
            </h1>
            <p className="text-white/70 mb-4">
              {hackathon?.shortDescription || (
                <TextShimmerLoader text="Loading description" />
              )}
            </p>
            {hackathon && (
              <RegistrationButton hackathonId={id} hackathon={hackathon} />
            )}
          </div>
          <ShareLink
            url={`${process.env.NEXT_PUBLIC_BASE_URL}/hackathons/${id}`}
            title={hackathon?.name}
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

        <div className="">
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] pb-[0.1rem]">
            <Separator className="absolute top-0 left-0 right-0" />
          </div>
          <div className="sticky top-14 backdrop-blur-xl border-white/10 z-10 pt-2">
            <div className="flex justify-center">
              <AnimatedTabs
                tabs={hackathonTabs}
                selectedTab={activeTab}
                onTabChange={(value) =>
                  setActiveTab(
                    value as "overview" | "prize" | "schedule" | "projects",
                  )
                }
                className="h-14 p-1"
              />
            </div>
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] mb-10 pt-2">
              <Separator className="absolute bottom-0 left-0 right-0" />
            </div>
          </div>

          <div className="container mx-auto px-5">
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
                <div className="lg:col-span-2 space-y-6">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.215, 0.61, 0.355, 1],
                        },
                      },
                    }}
                    className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm shadow-2xl overflow-hidden"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={resolveIPFSToHttp(hackathon?.visual)}
                        alt={hackathon?.name || "Hackathon"}
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Overlay with hackathon name */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-end">
                        <div className="p-6 text-white">
                          <h2 className="text-2xl font-bold drop-shadow-lg">
                            {hackathon?.name || (
                              <TextShimmerLoader
                                text="Loading hackathon"
                                size="lg"
                              />
                            )}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Description Section */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.215, 0.61, 0.355, 1],
                          delay: 0.1,
                        },
                      },
                    }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold text-white">
                      About This Hackathon
                    </h3>
                    <div className="prose prose-sm prose-invert max-w-none [&>*]:text-white/80 [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>h4]:text-white [&>h5]:text-white [&>h6]:text-white [&>strong]:text-white">
                      {/* prettier-ignore */}
                      {/* biome-ignore format */}
                      {(() => {
                        const raw =
                          hackathon?.fullDescription ||
                          hackathon?.shortDescription ||
                          "";
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
                  </motion.div>
                </div>

                {/* Right Column */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: [0.215, 0.61, 0.355, 1],
                        delay: 0.2,
                      },
                    },
                  }}
                  className="space-y-4 sticky top-36 self-start"
                >
                  <Countdown hackathon={hackathon} />

                  {/* Hackathon Details Card */}
                  <Card className="border-white/20 bg-black/20 backdrop-blur-sm">
                    <CardContent className="space-y-3 pt-0">
                      {/* Experience Level */}
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: { duration: 0.3, delay: 0.3 },
                          },
                        }}
                        className="flex justify-between items-center"
                      >
                        <span className="text-xs text-white/60">
                          Experience Level
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {hackathon?.experienceLevel || "All"}
                        </Badge>
                      </motion.div>

                      {/* Location */}
                      {hackathon?.location && (
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            visible: {
                              opacity: 1,
                              x: 0,
                              transition: { duration: 0.3, delay: 0.4 },
                            },
                          }}
                          className="flex justify-between items-center"
                        >
                          <span className="text-xs text-white/60">
                            Location
                          </span>
                          <span className="text-xs text-white font-medium">
                            {hackathon.location}
                          </span>
                        </motion.div>
                      )}

                      {/* Judging Mode */}
                      {hackathon?.prizeCohorts?.[0]?.judgingMode && (
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            visible: {
                              opacity: 1,
                              x: 0,
                              transition: { duration: 0.3, delay: 0.5 },
                            },
                          }}
                          className="flex justify-between items-center"
                        >
                          <span className="text-xs text-white/60">
                            Judging Mode
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {hackathon.prizeCohorts[0].judgingMode}
                          </Badge>
                        </motion.div>
                      )}

                      {/* Voting Mode */}
                      {hackathon?.prizeCohorts?.[0]?.votingMode && (
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            visible: {
                              opacity: 1,
                              x: 0,
                              transition: { duration: 0.3, delay: 0.6 },
                            },
                          }}
                          className="flex justify-between items-center"
                        >
                          <span className="text-xs text-white/60">
                            Voting Mode
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {hackathon.prizeCohorts[0].votingMode.replace(
                              "_",
                              " ",
                            )}
                          </Badge>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, delay: 0.7 },
                      },
                    }}
                  >
                    <ToDoList hackathon={hackathon} />
                  </motion.div>

                  {/* Tech Stack */}
                  {hackathon?.techStack && hackathon.techStack.length > 0 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: 0.8 },
                        },
                      }}
                      className="space-y-2 mt-6"
                    >
                      <h4 className="font-semibold text-white text-sm">
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {hackathon.techStack.map(
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
                                    delay: 0.9 + index * 0.05,
                                  },
                                },
                              }}
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-1"
                              >
                                {tech}
                              </Badge>
                            </motion.div>
                          ),
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Social Media Links */}
                  {hackathon?.socialLinks &&
                    Object.entries(hackathon.socialLinks).filter(
                      ([_, url]) => url,
                    ).length > 0 && (
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.4, delay: 1.1 },
                          },
                        }}
                        className="space-y-2 mt-6"
                      >
                        <h4 className="font-semibold text-white text-sm">
                          Connect
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(hackathon.socialLinks).map(
                            ([platform, url]) => {
                              if (!url) return null;

                              const getIcon = (platform: string) => {
                                const platformLower = platform.toLowerCase();
                                if (
                                  platformLower.includes("twitter") ||
                                  platformLower.includes("x")
                                ) {
                                  return (
                                    <IconBrandTwitter className="w-4 h-4" />
                                  );
                                }
                                if (platformLower.includes("github")) {
                                  return (
                                    <IconBrandGithub className="w-4 h-4" />
                                  );
                                }
                                if (platformLower.includes("linkedin")) {
                                  return (
                                    <IconBrandLinkedin className="w-4 h-4" />
                                  );
                                }
                                if (platformLower.includes("discord")) {
                                  return (
                                    <IconBrandDiscord className="w-4 h-4" />
                                  );
                                }
                                if (platformLower.includes("telegram")) {
                                  return (
                                    <IconBrandTelegram className="w-4 h-4" />
                                  );
                                }
                                return <IconWorld className="w-4 h-4" />;
                              };

                              return (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30 text-center min-h-[36px]"
                                >
                                  {getIcon(platform)}
                                  <span className="text-xs text-white/80 capitalize truncate">
                                    {platform}
                                  </span>
                                </a>
                              );
                            },
                          )}
                        </div>
                      </motion.div>
                    )}

                  {/* IPFS Hash Display */}
                  {hackathon?.ipfsHash && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: 1.2 },
                        },
                      }}
                      className="mt-6"
                    >
                      <IPFSHashDisplay ipfsHash={hackathon.ipfsHash} />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === "prize" && (
              <PrizeAndJudgeTab hackathon={hackathon} />
            )}

            {activeTab === "schedule" && <ScheduleTab hackathon={hackathon} />}

            {activeTab === "projects" && (
              <SubmittedProjectsTab hackathon={hackathon} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
