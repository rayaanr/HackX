"use client";

import { ArrowLeft } from "lucide-react";
import { IconShare } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedTabs } from "@/components/ui/anim/animated-tab";
import { RegistrationButton } from "@/components/hackathon/widgets/registration-button";
import { SubmissionCountdown } from "@/components/hackathon/widgets/submission-countdown";
import { ToDoList } from "@/components/hackathon/widgets/todo-list";
import { ShareDialog } from "@/components/share-dialog";
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 border border-white/20 rounded-xl bg-black/20 backdrop-blur-sm">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Hackathon Not Found
          </h1>
          <Link href="/hackathons">
            <Button className="hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300">
              Browse Hackathons
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
            <RegistrationButton hackathonId={id} />
          </div>
          <ShareDialog url={`https://hackx.com/hackathons/${id}`}>
            <Button
              variant="outline"
              className="hover:bg-white/10 hover:border-blue-400/50 hover:text-white transition-all duration-300"
            >
              <IconShare className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </ShareDialog>
        </div>

        <div className="gap-2">
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] pb-2">
            <Separator className="absolute top-0 left-0 right-0" />
          </div>
          <div className="sticky top-16 backdrop-blur-xl border-white/10 z-10">
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

          <div className="container mx-auto">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Hero Image */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm shadow-2xl overflow-hidden">
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
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
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
                  </div>

                  {/* Quick Info Cards - No hover effects since they're not interactive */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 border border-white/20 rounded-xl bg-black/20 backdrop-blur-sm">
                      <h4 className="font-medium mb-2 text-white">
                        Participants
                      </h4>
                      <p className="text-sm text-white/70">
                        {hackathon?.participantCount || 0} registered
                      </p>
                    </div>
                    <div className="p-6 border border-white/20 rounded-xl bg-black/20 backdrop-blur-sm">
                      <h4 className="font-medium mb-2 text-white">
                        Total Prizes
                      </h4>
                      <p className="text-sm text-white/70">
                        {hackathon?.prizeCohorts
                          ?.reduce((sum: number, cohort: any) => {
                            const amount =
                              typeof cohort.prizeAmount === "string"
                                ? parseInt(cohort.prizeAmount, 10)
                                : cohort.prizeAmount;
                            return sum + (amount || 0);
                          }, 0)
                          ?.toLocaleString() || "TBD"}
                      </p>
                    </div>
                    <div className="p-6 border border-white/20 rounded-xl bg-black/20 backdrop-blur-sm">
                      <h4 className="font-medium mb-2 text-white">
                        Tech Stack
                      </h4>
                      <p className="text-sm text-white/70">
                        {hackathon?.techStack?.slice(0, 3).join(", ") ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <SubmissionCountdown hackathon={hackathon} />
                  <ToDoList hackathon={hackathon} />
                </div>
              </div>
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
