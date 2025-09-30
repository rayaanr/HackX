"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveAccount } from "thirdweb/react";
import { WalletConnectionPrompt } from "@/components/wallet/wallet-connection-prompt";
import { notFound } from "next/navigation";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useHackathon,
  useHackathonProjectsWithDetails,
} from "@/hooks/use-hackathons";

interface JudgingPageProps {
  params: Promise<{ id: string }>;
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
        <WalletConnectionPrompt
          title="Connect your wallet"
          description="Connect your wallet to review and judge hackathon submissions"
        />
      </div>
    );
  }

  if (hackathonLoading || projectsLoading) {
    return <div>Loading...</div>;
  }

  if (hackathonError || !dbHackathon || dbHackathon.length === 0) {
    notFound();
  }

  const hackathon = dbHackathon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {hackathon.name} Projects
        </h1>
        <p className="text-muted-foreground">
          Review and judge submitted projects for this hackathon
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {projects.map((project: any) => (
          <Card
            key={project.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                {project.logo ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={project.logo}
                      alt={project.name || "Project logo"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {(project.name || "P").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight">
                    {project.name || "Untitled Project"}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    Submitted
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {project.intro ||
                  project.description ||
                  "No description provided"}
              </p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.techStack.slice(0, 3).map((tech: string) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.techStack.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.techStack.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Score: {project.totalScore || 0} ({project.judgeCount || 0}{" "}
                  judges)
                </div>
                <Link href={`/judge/${id}/${project.id}`}>
                  <Button size="sm">Review Project</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">
              No projects submitted yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Projects will appear here once participants start submitting their
              work.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
