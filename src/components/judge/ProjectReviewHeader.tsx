"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Project {
  name: string;
  description: string | null;
}

interface Hackathon {
  name: string;
}

interface ProjectReviewHeaderProps {
  hackathonId: string;
  hackathon: Hackathon;
  project: Project;
}

export function ProjectReviewHeader({
  hackathonId,
  hackathon,
  project,
}: ProjectReviewHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/hackathons/${hackathonId}/judge`}>
            <ArrowLeft className="size-4" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Project</h1>
          <p className="text-muted-foreground">
            Evaluate this project for {hackathon.name}
          </p>
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl font-semibold text-muted-foreground">
                {project.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {project.description || "No description available"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}