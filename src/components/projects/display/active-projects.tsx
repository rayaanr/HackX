"use client";

import { Plus, FolderIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBlockchainProjects } from "@/hooks/blockchain/useBlockchainProjects";
import { formatRelativeDate } from "@/lib/helpers/date";
import Link from "next/link";
import { useMemo } from "react";

export function ActiveProjects() {
  const {
    userProjects: blockchainProjects = [],
    isLoadingUserProjects: loading,
    userProjectsError: error,
  } = useBlockchainProjects();

  // Transform blockchain projects to UI format
  const allProjects = useMemo(() => {
    const projects = blockchainProjects
      .filter((project) => project !== null && project !== undefined)
      .map((project) => ({
        id: project.id?.toString() || `blockchain-${Date.now()}`,
        name: project.name || "Untitled Project",
        intro: project.intro || "No Intro",
        description: project.description || null,
        hackathon_name:
          project.hackathonIds && project.hackathonIds.length > 0
            ? `Submitted to ${project.hackathonIds.length} hackathon${
                project.hackathonIds.length > 1 ? "s" : ""
              }`
            : undefined,
        hackathon_id: project.hackathonIds?.[0]?.toString(),
        tech_stack: project.techStack || [],
        updated_at: project.createdAt || new Date().toISOString(),
        repository_url: project.githubLink,
        demo_url: project.demoVideo,
        team_members: [],
        source: "blockchain" as const,
        key: `blockchain-${project.id}`,
        totalScore: project.totalScore,
        judgeCount: project.judgeCount,
        logo: project.logo,
      }));

    return projects.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [blockchainProjects]);

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Active Projects</h2>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load projects</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Active Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Active Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Project Card */}
        <Link href="/projects/create">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group gap-4 h-60">
            <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                New Project
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a new project
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Project Cards */}
        {allProjects.map((project) => (
          <Link key={project.key} href={`/projects/${project.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer gap-4 h-60 flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 rounded-md">
                      <AvatarImage
                        src={project.logo}
                        alt={project.name || "Project logo"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {(project.name || "P").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {project.hackathon_name && (
                        <p className="text-sm text-muted-foreground">
                          {project.hackathon_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {project.totalScore > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Score: {project.totalScore}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.intro}
                </p>
                <div className="flex gap-1 text-sm">
                  {project.tech_stack.slice(0, 3).map((tech: string) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.tech_stack.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tech_stack.length - 2}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col items-end text-xs">
                  <span className="text-muted-foreground">
                    Last edited {formatRelativeDate(project.updated_at)}
                  </span>
                  {project.judgeCount > 0 && (
                    <span className="text-muted-foreground">
                      {project.judgeCount} judge(s)
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}

        {allProjects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Button asChild>
              <Link href="/projects/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
