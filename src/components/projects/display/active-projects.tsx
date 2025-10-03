"use client";

import { Plus, FolderIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlockchainProjects } from "@/hooks/use-projects";
import {
  ProjectCard,
  type ProjectCardData,
} from "@/components/projects/display/project-card";
import EmptyComponent from "@/components/empty";
import { Skeleton } from "@/components/ui/skeleton";
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
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <EmptyComponent
          title="Failed to load projects"
          description="There was an error loading your projects. Please try again."
          type="error"
        />
      </div>
    );
  }

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <EmptyComponent
          title="Connect Your Wallet"
          description="Connect your wallet to view and manage your projects"
          type="wallet-connect"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="project-card-hover h-full">
              <div className="relative z-10 h-full flex flex-col">
                <CardHeader className="mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-12 rounded-md" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 relative z-10 text-center">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-3" />
                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-6 w-12 rounded-full" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="mt-4 relative z-10">
                  <Skeleton className="h-3 w-24" />
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {allProjects.length === 0 ? (
          <div className="col-span-full">
            <EmptyComponent
              title="No projects yet"
              description="Create your first project to get started"
              type="info"
              icon={<FolderIcon className="size-12 text-white/50" />}
              action={
                <Button asChild>
                  <Link href="/projects/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Create New Project Card - matching default structure */}
            <Link href="/projects/create" className="group block h-full">
              <Card className="project-card-hover h-full">
                <div className="relative z-10 h-full flex flex-col">
                  <CardHeader className="mb-3 relative z-10 flex items-center justify-center">
                    <div className="relative mx-auto flex aspect-square size-24 items-center justify-center rounded-full border border-white/10 before:absolute before:-inset-2 before:rounded-full before:border before:border-white/5">
                      <div className="flex size-14 items-center justify-center rounded-md bg-primary/10 ring-1 ring-white/10">
                        <Plus className="size-8 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 relative z-10 text-center items-center">
                    <h3 className="text-base md:text-lg font-semibold tracking-tight mb-2">
                      New Project
                    </h3>
                    <p className="text-sm text-white/65 mb-3 line-clamp-3">
                      Create a new project
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 justify-center">
                      {/* Empty space to match tech badges */}
                    </div>
                  </CardContent>
                </div>
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
