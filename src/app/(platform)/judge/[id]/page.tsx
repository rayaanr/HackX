"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLoading } from "@/components/ui/global-loading";
import EmptyComponent from "@/components/empty";
import {
  useHackathon,
  useHackathonProjectsWithDetails,
} from "@/hooks/use-hackathons";
import { useHasJudgeScored, useProjectScore } from "@/hooks/use-judge";
import { hasJudgingPeriodEnded } from "@/lib/helpers/date";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface JudgingPageProps {
  params: Promise<{ id: string }>;
}

interface ProjectJudgeButtonProps {
  hackathonId: string;
  projectId: string;
  hackathon: any;
  className?: string;
}

interface ProjectScoreDisplayProps {
  hackathonId: string;
  projectId: string;
}

function ProjectScoreDisplay({
  hackathonId,
  projectId,
}: ProjectScoreDisplayProps) {
  const { data: scoreData, isLoading } = useProjectScore(
    hackathonId,
    projectId,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-4" />
        </div>
      </div>
    );
  }

  if (!scoreData || scoreData.judgeCount === 0) {
    return (
      <div className="text-xs text-muted-foreground">Score: Not scored</div>
    );
  }

  // Convert from contract scale (0-100) to display scale (0-10)
  const avgScore = scoreData.avgScore / 10;

  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground gap-5">
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-current text-yellow-500" />
        <span className="font-medium text-foreground">
          {avgScore.toFixed(1)}/10
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" /> Judges
        <span className="text-foreground">{scoreData.judgeCount}</span>
      </div>
    </div>
  );
}

function ProjectJudgeButton({
  hackathonId,
  projectId,
  hackathon,
  className,
}: ProjectJudgeButtonProps) {
  const { data: hasScored, isLoading } = useHasJudgeScored(
    hackathonId,
    projectId,
  );

  if (isLoading) {
    return (
      <Button size="sm" disabled variant="outline" className={className}>
        <Skeleton className="h-3 w-16" />
      </Button>
    );
  }

  const judgingEnded = hasJudgingPeriodEnded(hackathon);

  // If already scored, show "Reviewed" in secondary color
  if (hasScored) {
    return (
      <Link href={`/judge/${hackathonId}/${projectId}`}>
        <Button size="sm" variant="secondary" className={className}>
          Already Reviewed
        </Button>
      </Link>
    );
  }

  // If judging period ended but not scored, show disabled state
  if (judgingEnded) {
    return (
      <Button size="sm" disabled variant="outline" className={className}>
        Judging Ended
      </Button>
    );
  }

  // Default state - can review
  return (
    <Link href={`/judge/${hackathonId}/${projectId}`}>
      <Button size="sm" className={className}>
        Review Project
      </Button>
    </Link>
  );
}

export default function JudgingPage({ params }: JudgingPageProps) {
  const { id } = use(params);
  const account = useActiveAccount();

  const {
    data: dbHackathon,
    isLoading: hackathonLoading,
    error: hackathonError,
  } = useHackathon(id);

  const { projects = [], isLoading: projectsLoading } =
    useHackathonProjectsWithDetails(id);

  if (!account) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Judge Hackathon</h1>
          <p className="text-muted-foreground">
            Review and judge submitted projects for this hackathon
          </p>
        </div>
        <EmptyComponent
          title="Connect your wallet"
          description="Connect your wallet to review and judge hackathon submissions"
          type="wallet-connect"
        />
      </div>
    );
  }

  if (hackathonLoading || projectsLoading) {
    return <PageLoading text="Loading hackathon projects for judging" />;
  }

  if (hackathonError || !dbHackathon || dbHackathon.length === 0) {
    notFound();
  }

  const hackathon = dbHackathon;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-col gap-1 items-center"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {hackathon.name} Projects
        </h1>
        <p className="text-muted-foreground">
          Review and judge submitted projects for this hackathon
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={false}
        layout
      >
        {projects.map((project, index) => {
          if (!project) return null;

          const techTags = project.techStack ?? [];

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              whileHover={{ y: -6 }}
            >
              <Card className="project-card-hover h-full">
                <div className="relative z-10 flex h-full flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {project.logo ? (
                        <Avatar className="rounded-md">
                          <AvatarImage
                            src={resolveIPFSToHttp(project.logo)}
                            alt={project.name || "Project logo"}
                            width={48}
                            height={48}
                          />
                          <AvatarFallback>
                            {(project.name || "P").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <span className="text-lg font-bold text-primary">
                            {(project.name || "P").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <CardTitle className="text-lg leading-tight">
                        {project.name || "Untitled Project"}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col pt-0">
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                      {project.intro ||
                        project.description ||
                        "No description provided"}
                    </p>

                    {techTags.length > 0 && (
                      <motion.div className="mb-4 flex flex-wrap gap-1" layout>
                        {techTags.slice(0, 3).map((tech: string) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {techTags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{techTags.length - 3} more
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <ProjectScoreDisplay
                      hackathonId={id}
                      projectId={project.id.toString()}
                    />
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full"
                    >
                      <ProjectJudgeButton
                        hackathonId={id}
                        projectId={project.id.toString()}
                        hackathon={hackathon}
                        className="w-full"
                      />
                    </motion.div>
                  </CardFooter>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <EmptyComponent
            title="No projects submitted yet"
            description="Projects will appear here once participants start submitting their work."
            type="info"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
