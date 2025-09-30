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
import { Separator } from "@/components/ui/separator";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import { PrizeAndJudgeTab } from "@/components/hackathon/display/hackathon-prizes-judges-tab";
import { ScheduleTab } from "@/components/hackathon/display/hackathon-schedule-tab";
import { SubmittedProjectsTab } from "@/components/hackathon/display/hackathon-projects-gallery-tab";
import { useHackathon } from "@/hooks/use-hackathons";

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
    return (
      <div className="bg-background text-foreground">
        <div className="container mx-auto">
          <div className="flex justify-between pb-6">
            <Link href="/hackathons">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="space-y-2">
              <div className="text-center">
                <div className="h-10 w-64 bg-muted animate-pulse rounded mb-2" />
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              </div>
              <div className="text-center">
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="bg-background text-foreground">
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Hackathon Not Found</h1>
            <Link href="/hackathons">
              <Button>Browse Hackathons</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto">
        <div className="flex justify-between pb-6">
          <Link href="/hackathons">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              {hackathon?.name || "Loading..."}
            </h1>
            <p className="text-muted-foreground mb-4">
              {hackathon?.shortDescription || "Loading description..."}
            </p>
            <RegistrationButton hackathonId={id} />
          </div>
          <ShareDialog url={`https://hackx.com/hackathons/${id}`}>
            <Button variant="outline">
              <IconShare className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </ShareDialog>
        </div>

        <div className="gap-1">
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw]">
            <Separator className="absolute top-0 left-0 right-0" />
          </div>
          <div className="sticky top-[var(--header-height)] backdrop-blur-lg z-10 mb-3">
            <div className="flex justify-center mt-2">
              <AnimatedTabs
                tabs={hackathonTabs}
                selectedTab={activeTab}
                onTabChange={(value) =>
                  setActiveTab(
                    value as "overview" | "prize" | "schedule" | "projects",
                  )
                }
                className="h-12 p-1"
              />
            </div>
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] my-2">
              <Separator className="absolute bottom-0 left-0 right-0" />
            </div>
          </div>

          <div className="container mx-auto">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Hero Image */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="relative aspect-video">
                      <Image
                        src={resolveIPFSToHttp(hackathon?.visual)}
                        alt={hackathon?.name || "Hackathon"}
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Overlay with hackathon name */}
                      <div className="absolute inset-0 bg-black/20 flex items-end">
                        <div className="p-6 text-white">
                          <h2 className="text-2xl font-bold drop-shadow-lg">
                            {hackathon?.name || "Loading..."}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">
                      About This Hackathon
                    </h3>
                    <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
                      {/* prettier-ignore */}
                      {/* biome-ignore format */}
                      {parse(
                        DOMPurify.sanitize(
                          hackathon?.fullDescription ||
                            hackathon?.shortDescription ||
                            "",
                          {
                            ALLOWED_TAGS: [
                              "p",
                              "br",
                              "strong",
                              "em",
                              "u",
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
                            ],
                            ALLOWED_ATTR: ["href", "target", "rel"],
                          },
                        ),
                      )}
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Participants</h4>
                      <p className="text-sm text-muted-foreground">
                        {hackathon?.participantCount || 0} registered
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Total Prizes</h4>
                      <p className="text-sm text-muted-foreground">
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
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Tech Stack</h4>
                      <p className="text-sm text-muted-foreground">
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
