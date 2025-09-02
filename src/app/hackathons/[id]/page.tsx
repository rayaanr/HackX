import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getHackathonById } from "@/lib/server/database/hackathons";
import { transformDatabaseToUI } from "@/lib/helpers/hackathon-transforms";
import { PrizeAndJudgeTab } from "../../../components/hackathon-tabs/PrizeAndJudgeTab";
import { ScheduleTab } from "../../../components/hackathon-tabs/ScheduleTab";
import { SubmittedProjectsTab } from "../../../components/hackathon-tabs/SubmittedProjectsTab";
import { SubmissionCountdown } from "@/components/hackathon/submission-countdown";
import { ToDoList } from "@/components/hackathon/todo-list";
import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import { Separator } from "@/components/ui/separator";

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getHackathonById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const hackathon = transformDatabaseToUI(result.data);

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
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>
      </div>

      {/* Navigation Tabs with full-width separators */}
      <Tabs defaultValue="overview" className="gap-1">
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw]">
          <Separator className="absolute top-0 left-0 right-0" />
        </div>
        <div className="sticky top-(--header-height) backdrop-blur-lg z-10">
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
                        FORBID_ATTR: ["style"], // This removes all style attributes
                      }
                    )
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
