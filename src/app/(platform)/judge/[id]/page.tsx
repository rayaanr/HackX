"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/global-loading";
import { WalletConnectionPrompt } from "@/components/wallet/wallet-connection-prompt";
import {
  useHackathon,
  useHackathonProjectsWithDetails,
} from "@/hooks/use-hackathons";
import type { ProjectWithHackathon } from "@/types/hackathon";

interface JudgingPageProps {
  params: Promise<{ id: string }>;
}

type JudgeProjectForDisplay = ProjectWithHackathon & {
  logo?: string | null;
  intro?: string | null;
  techStack?: string[];
};

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
        <WalletConnectionPrompt
          title="Connect your wallet"
          description="Connect your wallet to review and judge hackathon submissions"
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
        {projects.map((project: JudgeProjectForDisplay, index: number) => {
          const techTags = project.techStack ?? project.tech_stack ?? [];

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
                        <div className="flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={project.logo}
                            alt={project.name || "Project logo"}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                          />
                        </div>
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

                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                      <div>
                        Score: {project.totalScore || 0} (
                        {project.judgeCount || 0} judges)
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Link href={`/judge/${id}/${project.id}`}>
                          <Button size="sm">Review Project</Button>
                        </Link>
                      </motion.div>
                    </div>
                  </CardContent>
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="mb-2 text-lg font-semibold">
                No projects submitted yet
              </h3>
              <p className="text-muted-foreground">
                Projects will appear here once participants start submitting
                their work.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
