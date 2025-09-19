"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlockchainProject } from "@/hooks/blockchain/useBlockchainProjects";
import { getProjectStatusVariant } from "@/lib/helpers/project";
import { formatRelativeDate } from "@/lib/helpers/date";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

  const {
    data: project,
    isLoading,
    error,
  } = useBlockchainProject(projectId);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return notFound();
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {project.name || "Untitled Project"}
            </h1>
            <p className="text-muted-foreground mb-4">
              {project.description || project.intro || "No description provided"}
            </p>
            <div className="flex items-center gap-4">
              <Badge variant={getProjectStatusVariant(project.isCreated ? "submitted" : "draft")}>
                {project.isCreated ? "submitted" : "draft"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {formatRelativeDate(project.createdAt || new Date().toISOString())}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {project.githubLink && (
              <Button variant="outline" asChild>
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Repository
                </a>
              </Button>
            )}
            {project.demoVideo && (
              <Button asChild>
                <a
                  href={project.demoVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Demo
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "details")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {project.description || project.intro || "No description available"}
                    </p>
                  </CardContent>
                </Card>

                {/* Tech Stack */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tech Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack && project.techStack.length > 0 ? (
                        project.techStack.map((tech: string) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No tech stack specified</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={getProjectStatusVariant(project.isCreated ? "submitted" : "draft")}>
                        {project.isCreated ? "submitted" : "draft"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blockchain ID</span>
                      <span className="text-sm">{project.blockchainId || "N/A"}</span>
                    </div>
                    {project.totalScore > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Score</span>
                        <span className="text-sm font-medium">{project.totalScore}</span>
                      </div>
                    )}
                    {project.judgeCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Judges</span>
                        <span className="text-sm">{project.judgeCount}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Hackathons */}
                {project.hackathonIds && project.hackathonIds.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Submitted to Hackathons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {project.hackathonIds.map((hackathonId: string | number) => (
                          <div key={hackathonId} className="flex items-center justify-between">
                            <span className="text-sm">Hackathon #{hackathonId}</span>
                            <Badge variant="outline" className="text-xs">
                              Submitted
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Name</span>
                    <p className="text-sm">{project.name || "Untitled Project"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Blockchain ID</span>
                    <p className="text-sm">{project.blockchainId || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Created</span>
                    <p className="text-sm">
                      {project.createdAt
                        ? formatRelativeDate(project.createdAt)
                        : "Unknown"
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                    <p className="text-sm">{project.isCreated ? "Submitted" : "Draft"}</p>
                  </div>
                </div>

                {(project.githubLink || project.demoVideo || project.pitchVideo) && (
                  <div className="pt-4 border-t">
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">Links</span>
                    <div className="space-y-2">
                      {project.githubLink && (
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4" />
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            GitHub Repository
                          </a>
                        </div>
                      )}
                      {project.demoVideo && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          <a
                            href={project.demoVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            Demo Video
                          </a>
                        </div>
                      )}
                      {project.pitchVideo && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          <a
                            href={project.pitchVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            Pitch Video
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
