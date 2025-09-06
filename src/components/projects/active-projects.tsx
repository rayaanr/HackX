"use client";

import { Plus, FolderIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserProjects } from "@/hooks/queries/use-projects";
import { getProjectStatusVariant } from "@/lib/utils/project";
import { formatRelativeDate } from "@/lib/utils/date";
import Link from "next/link";

export function ActiveProjects() {
  const { data: projects = [], isLoading: loading, error } = useUserProjects();

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
        {projects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <Link href={`/projects/${project.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {project.hackathon_name && (
                        <p className="text-sm text-muted-foreground">
                          {project.hackathon_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getProjectStatusVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    {project.tech_stack.slice(0, 2).map((tech) => (
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
                  <span className="text-muted-foreground">
                    Last edited {formatRelativeDate(project.updated_at)}
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}

        {projects.length === 0 && (
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
