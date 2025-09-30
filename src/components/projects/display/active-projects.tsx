"use client";

import { Plus, FolderIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlockchainProjects } from "@/hooks/use-projects";
import {
  ProjectCard,
  type ProjectCardData,
} from "@/components/projects/display/project-card";
import { WalletConnectionPrompt } from "@/components/wallet/wallet-connection-prompt";
import Link from "next/link";
import { useMemo } from "react";

export function ActiveProjects() {
  const {
    userProjects: blockchainProjects = [],
    isLoadingUserProjects: loading,
    userProjectsError: error,
    isConnected,
  } = useBlockchainProjects();

  // Transform blockchain projects to ProjectCardData format
  const allProjects = useMemo((): ProjectCardData[] => {
    const projects = blockchainProjects
      .filter((project) => project !== null && project !== undefined)
      .map((project) => ({
        id: project.id?.toString() || `blockchain-${Date.now()}`,
        name: project.name || "Untitled Project",
        intro: project.intro || "No Intro",
        hackathon_name:
          project.hackathonIds && project.hackathonIds.length > 0
            ? `Submitted to ${project.hackathonIds.length} hackathon${
                project.hackathonIds.length > 1 ? "s" : ""
              }`
            : undefined,
        tech_stack: project.techStack || [],
        updated_at: project.createdAt || new Date().toISOString(),
        totalScore: project.totalScore,
        judgeCount: project.judgeCount,
        logo: project.logo,
        key: `blockchain-${project.id}`,
      }));

    return projects.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
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

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Active Projects</h2>
        <WalletConnectionPrompt />
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
        {allProjects.length === 0 ? (
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
        ) : (
          <>
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
              <ProjectCard key={project.key} project={project} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
