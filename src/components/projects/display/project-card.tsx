"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/helpers/date";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
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
  variant?: "default" | "feature";
  isJudge?: boolean; // Whether the current user is a judge
}

function TechBadges({ stack }: { stack: string[] }) {
  if (!stack?.length) return <div className="mt-5 h-[28px]" />; // Empty space to maintain height
  return (
    <div className="mt-5 flex flex-wrap gap-2 min-h-[28px]">
      {stack.slice(0, 4).map((tech) => (
        <Badge
          key={tech}
          variant="outline"
          className="text-[10px] leading-none py-1 px-2 rounded-full border-white/10 bg-white/[0.015] text-white/65 backdrop-blur-sm hover:text-white/90 transition-colors"
        >
          {tech}
        </Badge>
      ))}
      {stack.length > 4 && (
        <Badge
          variant="outline"
          className="text-[10px] leading-none py-1 px-2 rounded-full border-white/10 bg-white/[0.015] text-white/65"
        >
          +{stack.length - 4}
        </Badge>
      )}
    </div>
  );
}

export function ProjectCard({
  project,
  className = "",
  variant = "default",
  isJudge = false,
}: ProjectCardProps) {
  const Root = ({ children }: { children: React.ReactNode }) => (
    <Card className={`project-card-hover h-full ${className}`}>
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </Card>
  );

  if (variant === "feature") {
    // Simplified variant: vertical stack matching default avatar style
    return (
      <Link href={`/projects/${project.id}`} className="group block">
        <Root>
          <CardContent className="relative z-10 flex flex-col h-full p-5 gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="size-12 rounded-md ring-1 ring-white/10 transition-colors group-hover:ring-primary/50">
                <AvatarImage
                  src={resolveIPFSToHttp(project.logo)}
                  alt={project.name || "Project logo"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(project.name || "P").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold tracking-tight truncate group-hover:text-white transition-colors">
                  {project.name}
                </h3>
                {project.hackathon_name && (
                  <p className="text-[11px] uppercase tracking-wide text-white/40 mt-1 line-clamp-1">
                    {project.hackathon_name}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-white/65 line-clamp-3">
              {project.intro}
            </p>
            <TechBadges stack={project.tech_stack} />
            <div className="mt-auto pt-2">
              <ProjectMeta
                project={project}
                prefix="Updated"
                isJudge={isJudge}
              />
            </div>
          </CardContent>
        </Root>
      </Link>
    );
  }

  // Default compact layout
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Root>
        <CardHeader className="mb-3 relative z-10">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 rounded-md ring-1 ring-white/10 transition-colors group-hover:ring-primary/50">
              <AvatarImage
                src={resolveIPFSToHttp(project.logo)}
                alt={project.name || "Project logo"}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {(project.name || "P").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base md:text-lg font-semibold tracking-tight truncate group-hover:text-white transition-colors">
                {project.name}
              </CardTitle>
              {project.hackathon_name && (
                <p className="text-[11px] uppercase tracking-wide text-white/40 mt-1 line-clamp-1">
                  {project.hackathon_name}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 relative z-10 items-center pb-0">
          <p className="text-sm text-white/65 mb-3 line-clamp-2">
            {project.intro}
          </p>
          <TechBadges stack={project.tech_stack} />
        </CardContent>
        <CardFooter className="mt-4 relative z-10">
          <ProjectMeta
            project={project}
            prefix="Last edited"
            isJudge={isJudge}
          />
        </CardFooter>
      </Root>
    </Link>
  );
}

function ProjectMeta({
  project,
  prefix,
  isJudge = false,
}: {
  project: ProjectCardData;
  prefix: string;
  isJudge?: boolean; // Whether the current user is a judge
}) {
  const hasExtras =
    isJudge &&
    (project.totalScore !== undefined || project.judgeCount !== undefined);
  return (
    <div className="flex items-center justify-between w-full text-[11px] text-white/45">
      <span>
        {prefix} {formatRelativeDate(project.updated_at)}
      </span>
      {hasExtras && (
        <span className="flex items-center gap-3 text-white/55">
          {project.totalScore !== undefined && (
            <span className="flex items-center gap-1 font-medium text-white/70">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              >
                <polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.8 5.5 21 7 14 2 9.3 9 8.5 12 2" />
              </svg>
              {project.totalScore}
            </span>
          )}
          {project.judgeCount !== undefined && (
            <span className="flex items-center gap-1 text-white/55">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              >
                <path d="M9 7V2h6v5" />
                <path d="M12 17v5" />
                <path d="M5 8h14" />
                <path d="M3 13h18" />
              </svg>
              {project.judgeCount} Judge
              {project.judgeCount === 1 ? "" : "s"}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
