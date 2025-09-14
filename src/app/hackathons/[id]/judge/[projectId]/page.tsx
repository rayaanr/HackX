"use client";

import { useHackathon } from "@/hooks/blockchain/useBlockchainHackathons";
import {
  useProjectById,
  useProjectHackathons,
} from "@/hooks/queries/use-projects";
import { useActiveAccount } from "thirdweb/react";
import { transformDatabaseToUI } from "@/lib/helpers/hackathon-transforms";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ProjectReviewHeader } from "@/components/judge/project-evaluation-header";
import { ProjectDetailsSection } from "@/components/judge/project-details-viewer";
import { JudgingInterface } from "@/components/judge/project-evaluation-form";
import { ReviewActions } from "@/components/judge/evaluation-submit-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type JudgeEvaluationFormData } from "@/lib/schemas/judge-evaluation-schema";
import type { PrizeCohort } from "@/lib/schemas/hackathon-schema";
import { Button } from "@/components/ui/button";

export default function ProjectReviewPage() {
  const { id, projectId } = useParams<{ id: string; projectId: string }>();
  const hackathonId = id as string;

  const {
    data: dbHackathon,
    isLoading: hackathonLoading,
    error: hackathonError,
  } = useHackathon(hackathonId);
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProjectById(projectId);
  const { data: projectHackathons = [], isLoading: projectHackathonsLoading } =
    useProjectHackathons(projectId);
  const account = useActiveAccount();

  // State for form data and selected cohort
  const [formData, setFormData] = useState<JudgeEvaluationFormData | null>(
    null
  );
  const [selectedCohort, setSelectedCohort] = useState<PrizeCohort | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transform data safely
  const hackathon =
    dbHackathon && dbHackathon.length > 0
      ? transformDatabaseToUI(dbHackathon[0])
      : null;

  if (hackathonLoading || projectLoading || projectHackathonsLoading) {
    return <div>Loading...</div>;
  }

  // Check for data errors or missing resources first
  if (
    hackathonError ||
    projectError ||
    !dbHackathon ||
    dbHackathon.length === 0 ||
    !project ||
    !hackathon
  ) {
    notFound();
  }

  // Validate wallet connection
  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Wallet Connection Required
          </h2>
          <p className="text-muted-foreground">
            You must connect your wallet to access this page.
          </p>
        </div>
      </div>
    );
  }

  // For now, allow any connected wallet to judge (until judge system is updated for blockchain)
  const judgeAddress = account.address;

  // Convert ProjectWithHackathon[] to ProjectHackathon[] format expected by ProjectDetailsSection
  const convertedProjectHackathons = projectHackathons.map((p) => ({
    hackathon: {
      id: p.hackathon?.id || "",
      name: p.hackathon?.name || "",
      short_description: p.hackathon?.short_description || "",
      hackathon_start_date: p.hackathon?.hackathon_start_date || "",
      hackathon_end_date: p.hackathon?.hackathon_end_date || "",
      registration_start_date: null,
      registration_end_date: null,
      voting_start_date: null,
      voting_end_date: null,
      tech_stack: p.hackathon?.tech_stack || [],
      experience_level: p.hackathon?.experience_level || "",
      prize_cohorts: [],
      participantCount: 0,
    },
    status: p.status,
  }));

  return (
    <div className="space-y-6">
      <ProjectReviewHeader
        hackathonId={hackathonId}
        hackathon={hackathon}
        project={project}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Project Overview</TabsTrigger>
          <TabsTrigger value="hackathon">Hackathon</TabsTrigger>
          <TabsTrigger value="judging">Judging</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectDetailsSection
            project={project}
            projectHackathons={convertedProjectHackathons}
            hackathon={hackathon}
            activeTab="overview"
          />
        </TabsContent>

        <TabsContent value="hackathon" className="space-y-6">
          <ProjectDetailsSection
            project={project}
            projectHackathons={convertedProjectHackathons}
            hackathon={hackathon}
            activeTab="hackathon"
          />
        </TabsContent>

        <TabsContent value="judging" className="space-y-6">
          <JudgingInterface
            hackathon={hackathon}
            onFormDataChange={setFormData}
            onSelectedCohortChange={setSelectedCohort}
          />
          <ReviewActions
            projectId={projectId}
            hackathonId={hackathonId}
            selectedCohort={selectedCohort}
            judgeEmail={judgeAddress}
            formData={formData}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
