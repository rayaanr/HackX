"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/helpers/date";
import Link from "next/link";

export interface ProjectCardData {
  id: string;
  name: string;
  intro: string;
  hackathon_name?: string;
  tech_stack: string[];
  updated_at: string;
  totalScore?: number;
  judgeCount?: number;
  logo?: string;
  key: string;
}

interface ProjectCardProps {
  project: ProjectCardData;
  className?: string;
}

export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer gap-4 h-60 flex flex-col ${className}`}>
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
                <CardTitle className="text-lg">{project.name}</CardTitle>
            </div>
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
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}