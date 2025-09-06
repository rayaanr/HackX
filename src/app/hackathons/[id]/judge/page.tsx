"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hackathons } from "@/data/hackathons";
import { getSubmittedProjectsByHackathon } from "@/data/projects";
import { notFound } from "next/navigation";
import { use } from "react";
import Image from "next/image";

interface JudgingPageProps {
  params: Promise<{ id: string }>;
}

export default function JudgingPage({ params }: JudgingPageProps) {
  const { id } = use(params);
  
  const hackathon = hackathons.find(h => h.id === id);
  if (!hackathon) {
    notFound();
  }

  const submittedProjects = getSubmittedProjectsByHackathon(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {hackathon.name} Projects
        </h1>
        <p className="text-muted-foreground">
          Review and judge submitted projects for this hackathon
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {submittedProjects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {project.logo ? (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      <Image 
                        src={project.logo} 
                        alt={project.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold text-muted-foreground">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {project.description}
              </p>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Last edited</span>
                  <p className="text-sm">
                    {project.lastEdited.toLocaleDateString()} ({
                      Math.ceil((Date.now() - project.lastEdited.getTime()) / (1000 * 60 * 60 * 24))
                    } days ago)
                  </p>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground">Builder</span>
                  <p className="text-sm font-medium">{project.builder}</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground">Tech Stack</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground">Team</span>
                  <p className="text-sm font-medium">{project.team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.team.members.length} members
                  </p>
                </div>
              </div>

              <Button 
                className="w-full group-hover:shadow-md transition-shadow"
                onClick={() => {
                  // Navigate to project review page
                  window.location.href = `/hackathons/${id}/judge/${project.id}`;
                }}
              >
                Review Project
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {submittedProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Image 
                src="/empty-state.svg" 
                alt="No projects"
                width={48}
                height={48}
                className="opacity-50"
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects submitted yet</h3>
            <p className="text-muted-foreground mb-4">
              Projects will appear here once participants start submitting their work.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}