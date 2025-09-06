"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hackathons } from "@/data/hackathons";
import { ArrowRight, Calendar, MapPin, Users, Award } from "lucide-react";
import Link from "next/link";

// Filter hackathons where the current user would be a judge
// For demo purposes, showing all hackathons that have judges
const hackathonsToJudge = hackathons.filter(
  (hackathon) => hackathon.judges && hackathon.judges.length > 0,
);

export default function JudgeDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Judge Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your judging assignments and review submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hackathons to judge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hackathonsToJudge.map((hackathon) => {
            const isLive =
              new Date() >= hackathon.hackathonPeriod.hackathonStartDate &&
              new Date() <= hackathon.hackathonPeriod.hackathonEndDate;
            const isUpcoming =
              new Date() < hackathon.hackathonPeriod.hackathonStartDate;

            return (
              <div
                key={hackathon.id}
                className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {hackathon.name}
                      </h3>
                      {isLive && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        >
                          Live
                        </Badge>
                      )}
                      {isUpcoming && <Badge variant="outline">Upcoming</Badge>}
                    </div>
                    <p className="text-muted-foreground">
                      {hackathon.shortDescription}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>405 participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="size-4" />
                        <span>2 prizes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>
                          {hackathon.hackathonPeriod.hackathonStartDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        <span>{hackathon.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">
                        Tech stack:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hackathon.techStack.slice(0, 3).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {hackathon.techStack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{hackathon.techStack.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild>
                    <Link href={`/hackathons/${hackathon.id}/judge`}>
                      Go to judging
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}

          {hackathonsToJudge.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hackathons assigned for judging yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
