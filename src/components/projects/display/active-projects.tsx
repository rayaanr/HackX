"use client";

import { Plus, FolderIcon, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserBlockchainProjects } from "@/hooks/blockchain/useBlockchainProjects";
import { getProjectStatusVariant } from "@/lib/helpers/project";
import { formatRelativeDate } from "@/lib/helpers/date";
import Link from "next/link";
import { useMemo } from "react";

export function ActiveProjects() {
  const {
    data: blockchainProjects = [],
    isLoading: loading,
    error,
  } = useUserBlockchainProjects();

  // Debug logging
  console.log("🔍 ActiveProjects Debug:", {
    blockchainProjects: blockchainProjects.length,
    loading,
    error: error?.message,
  });

  // Transform blockchain projects to UI format
  const allProjects = useMemo(() => {
    const projects = blockchainProjects.map((project) => ({
      id: project.blockchainId?.toString() || `blockchain-${Date.now()}`,
      name: project.name || "Untitled Project",
      description: project.description || project.intro || null,
      hackathon_name: project.hackathonId
        ? `Hackathon #${project.hackathonId}`
        : undefined,
      hackathon_id: project.hackathonId?.toString(),
      tech_stack: project.techStack || [],
      status: project.isSubmitted ? "submitted" : ("draft" as const),
      updated_at: project.createdAt || new Date().toISOString(),
      repository_url: project.githubLink,
      demo_url: project.demoVideo,
      team_members: [],
      source: "blockchain" as const,
      key: `blockchain-${project.blockchainId}`,
      totalScore: project.totalScore,
      judgeCount: project.judgeCount,
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Active Projects</h2>
        <div className="flex gap-2 text-sm">
          <Badge
            variant={blockchainProjects.length > 0 ? "default" : "outline"}
            className="text-xs"
          >
            <Wallet className="w-3 h-3 mr-1" />
            Blockchain: {blockchainProjects.length}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Project Card */}
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group">
          <Link href="/projects/create">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Create New Project
              </h3>
              <p className="text-sm text-muted-foreground">
                Start building your next big idea
              </p>
            </CardContent>
          </Link>
        </Card>

        {/* Project Cards */}
        {allProjects.map((project) => (
          <Card
            key={project.key}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <Link href={`/projects/${project.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {project.name}
                        <Badge variant="outline" className="text-xs">
                          On-chain
                        </Badge>
                      </CardTitle>
                      {project.hackathon_name && (
                        <p className="text-sm text-muted-foreground">
                          {project.hackathon_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={getProjectStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                    {project.totalScore > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Score: {project.totalScore}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    {project.tech_stack.slice(0, 2).map((tech: string) => (
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
                </div>
              </CardContent>
            </Link>
          </Card>
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
