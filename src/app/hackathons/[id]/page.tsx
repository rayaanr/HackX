"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { IconShare } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useHackathonById } from "@/hooks/queries/use-hackathons";
import { transformDatabaseToUI } from "@/lib/helpers/hackathon-transforms";
import { PrizeAndJudgeTab } from "../../../components/hackathon-tabs/PrizeAndJudgeTab";
import { ScheduleTab } from "../../../components/hackathon-tabs/ScheduleTab";
import { SubmittedProjectsTab } from "../../../components/hackathon-tabs/SubmittedProjectsTab";
import { SubmissionCountdown } from "@/components/hackathon/submission-countdown";
import { ToDoList } from "@/components/hackathon/todo-list";
import { ShareDialog } from "@/components/share-dialog";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { Separator } from "@/components/ui/separator";

export default function HackathonPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: hackathonData,
    isLoading: loading,
    error,
  } = useHackathonById(id);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="aspect-video bg-muted animate-pulse rounded-lg" />
              <div className="space-y-4">
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted animate-pulse rounded-lg" />
              <div className="h-48 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hackathonData) {
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
          </div>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Hackathon Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The hackathon you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Link href="/hackathons">
              <Button>Browse Hackathons</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hackathon = transformDatabaseToUI(hackathonData);

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between pb-6">
          <Link href="/hackathons">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="space-y-2">
            <div className="text-center">
              <h1 className="text-4xl font-bold">{hackathon.name}</h1>
              <p className="text-muted-foreground text-lg">
                {hackathon.shortDescription}
              </p>
            </div>
            <div className="text-center">
              <Button size="lg">
                Start Submit <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <ShareDialog url={`https://hackx.com/hackathons/${id}`}>
            <Button variant="outline">
              <IconShare className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </ShareDialog>
        </div>
      </div>

      {/* Navigation Tabs with full-width separators */}
      <Tabs defaultValue="overview" className="gap-1">
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw]">
          <Separator className="absolute top-0 left-0 right-0" />
        </div>
        <div className="sticky top-[var(--header-height)] backdrop-blur-lg z-10 mb-3">
          <TabsList className="grid w-fit grid-cols-4 h-12 m-auto mt-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prize">Prize & Judge</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="projects">Project Gallery</TabsTrigger>
          </TabsList>
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] my-2">
            <Separator className="absolute bottom-0 left-0 right-0" />
          </div>
        </div>

        {/* Main Content */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Hero Image */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="relative aspect-video">
                  <Image
                    src={hackathon.visual || "/placeholder.svg"}
                    alt={hackathon.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Overlay with hackathon name */}
                  <div className="absolute inset-0 bg-black/20 flex items-end">
                    <div className="p-6 text-white">
                      <h2 className="text-2xl font-bold drop-shadow-lg">
                        {hackathon.name}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">About This Hackathon</h3>
                <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
                  {parse(
                    DOMPurify.sanitize(
                      hackathon.fullDescription ||
                        hackathon.shortDescription ||
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
                        ],
                        ALLOWED_ATTR: ["href", "target"],
                        FORBID_ATTR: ["style"],
                      },
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <SubmissionCountdown hackathon={hackathon} />
              <ToDoList hackathon={hackathon} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prize">
          <PrizeAndJudgeTab hackathon={hackathon} />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleTab hackathon={hackathon} />
        </TabsContent>

        <TabsContent value="projects">
          <SubmittedProjectsTab hackathon={hackathon} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
