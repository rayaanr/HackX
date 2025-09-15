"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useHackathon,
  useHackathonProjects,
} from "@/hooks/blockchain/useBlockchainHackathons";
import { useBlockchainProject } from "@/hooks/blockchain/useBlockchainProjects";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

interface JudgingPageProps {
  params: Promise<{ id: string }>;
}

export default function JudgingPage({ params }: JudgingPageProps) {
  const { id } = use(params);

  const {
    data: dbHackathon,
    isLoading: hackathonLoading,
    error: hackathonError,
  } = useHackathon(id);

  const {
    data: projectIds = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useHackathonProjects(id);

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
        {projectIds.map((projectId: number) => (
          <Card
            key={projectId}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {projectId.toString()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Project #{projectId}
                    </CardTitle>
                    <Badge variant="secondary">Submitted</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Click to view project details and submit your evaluation.
              </p>

              <div className="flex items-center justify-between">
                <Link href={`/hackathons/${id}/judge/${projectId}`}>
                  <Button size="sm">Review Project</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projectIds.length === 0 && (
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
