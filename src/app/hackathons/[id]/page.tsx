import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { hackathons } from "@/data/hackathons";
import { PrizeAndJudgeTab } from "../../../components/hackathon-tabs/PrizeAndJudgeTab";
import { ScheduleTab } from "../../../components/hackathon-tabs/ScheduleTab";
import { SubmittedProjectsTab } from "../../../components/hackathon-tabs/SubmittedProjectsTab";

export default function HackathonPage({ params }: { params: { id: string } }) {
  const hackathon = hackathons.find((h) => h.id.toString() === params.id);

  if (!hackathon) {
    notFound();
  }

  const registrationDaysLeft = Math.ceil(
    (hackathon.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

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
          <p className="text-muted-foreground text-lg">{hackathon.tagline}</p>
        </div>
        <div className="text-center mb-8">
          <Button size="lg">
            Start Register <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="prize" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prize">Prize & Judge</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="projects">Submitted Projects</TabsTrigger>
          </TabsList>

        {/* Main Content */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-8">
                {/* Banner */}
                <div className="aspect-video bg-muted rounded-lg mb-6"></div>
                {/* Event Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                  <div>
                    <p className="font-semibold text-sm">Status</p>
                    <p className="text-lg">{hackathon.status}, {registrationDaysLeft} days left</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Host</p>
                    <p className="text-lg">{hackathon.host}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Mode</p>
                    <p className="text-lg">{hackathon.participants}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Ecosystem</p>
                    <p className="text-lg">{hackathon.ecosystem}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex -space-x-2 overflow-hidden">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="ml-2 text-sm text-muted-foreground">{hackathon.participantCount}+ participants</p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground mb-4">{hackathon.description}</p>
                <ul className="list-disc list-inside">
                  {hackathon.prizeBreakdown.map((item) => (
                    <li key={item.category}>{item.category}</li>
                  ))}
                </ul>
              </div>

              {/* About Host */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">About Host</h2>
                <p className="text-muted-foreground">U2U Network is...</p>
              </div>

              {/* Qualification Requirements */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-4">Qualification Requirements</h2>
                <p className="text-muted-foreground">[Placeholder for qualification requirements]</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Countdown */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Registration ends in</h2>
                <div className="flex justify-between text-center">
                  <div>
                    <p className="text-2xl font-bold">{registrationDaysLeft}</p>
                    <p className="text-sm text-muted-foreground">Days</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Hours</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">59</p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">59</p>
                    <p className="text-sm text-muted-foreground">Seconds</p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Schedule Detail</h2>
                <Link href="#" className="text-sm text-primary hover:underline">
                  View full schedule
                </Link>
              </div>

              {/* To Do List */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">To Do List</h2>
                <ul className="space-y-2">
                  {hackathon.todos.map((todo) => (
                    <li key={todo.text} className="flex items-center">
                      <input type="checkbox" checked={todo.done} className="mr-2" />
                      <span>{todo.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
