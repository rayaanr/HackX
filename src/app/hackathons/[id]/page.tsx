import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getHackathonById } from "@/lib/server/database/hackathons";
import {
  transformDatabaseToUI,
  getHackathonStatus,
} from "@/lib/helpers/hackathon-transforms";
import { PrizeAndJudgeTab } from "../../../components/hackathon-tabs/PrizeAndJudgeTab";
import { ScheduleTab } from "../../../components/hackathon-tabs/ScheduleTab";
import { SubmittedProjectsTab } from "../../../components/hackathon-tabs/SubmittedProjectsTab";
import { SubmissionCountdown } from "@/components/hackathon/submission-countdown";
import { ToDoList } from "@/components/hackathon/todo-list";

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

  const status = getHackathonStatus(hackathon);

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/hackathons">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">{hackathon.name}</h1>
          <p className="text-muted-foreground text-lg">
            {hackathon.shortDescription}
          </p>
        </div>
        <div className="text-center mb-8">
          <Button
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            Start Submit <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prize">Prize & Judge</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="projects">Project Gallery</TabsTrigger>
          </TabsList>

          {/* Main Content */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Hero Image */}
              <div className="lg:col-span-2">
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
    </div>
  );
}
