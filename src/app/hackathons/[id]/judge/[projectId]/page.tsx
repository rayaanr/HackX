"use client";

import { useHackathonByIdPublic } from "@/hooks/queries/use-hackathons";
import {
  useProjectById,
  useProjectHackathons,
} from "@/hooks/queries/use-projects";
import { useCurrentUser } from "@/hooks/use-auth";
import { transformDatabaseToUI } from "@/lib/helpers/hackathon-transforms";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { ProjectReviewHeader } from "@/components/judge/ProjectReviewHeader";
import { ProjectDetailsSection } from "@/components/judge/ProjectDetailsSection";
import { JudgingInterface } from "@/components/judge/JudgingInterface";
import { ReviewActions } from "@/components/judge/ReviewActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type JudgeEvaluationFormData } from "@/lib/schemas/judge-evaluation-schema";
import type { PrizeCohort } from "@/lib/schemas/hackathon-schema";

interface ProjectReviewPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default function ProjectReviewPage({ params }: ProjectReviewPageProps) {
  const { id: hackathonId, projectId } = use(params);

  const {
    data: dbHackathon,
    isLoading: hackathonLoading,
    error: hackathonError,
  } = useHackathonByIdPublic(hackathonId);
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProjectById(projectId);
  const { data: projectHackathons = [], isLoading: projectHackathonsLoading } =
    useProjectHackathons(projectId);
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();

  // State for form data and selected cohort
  const [formData, setFormData] = useState<JudgeEvaluationFormData | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<PrizeCohort | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transform data safely
  const hackathon = dbHackathon ? transformDatabaseToUI(dbHackathon) : null;

  if (
    hackathonLoading ||
    projectLoading ||
    projectHackathonsLoading ||
    userLoading
  ) {
    return <div>Loading...</div>;
  }

  // Check for data errors or missing resources first
  if (
    hackathonError ||
    projectError ||
    !dbHackathon ||
    !project ||
    !hackathon
  ) {
    notFound();
  }

  // Validate authentication and judge access
  if (userError || !currentUser?.email) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p className="text-muted-foreground">
            You must be signed in as a judge to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Validate judge email format
  const judgeEmail = currentUser.email;
  if (!judgeEmail.includes("@") || !judgeEmail.includes(".")) {
    throw new Error("Invalid email format for judge authentication");
  }

  // Check if current user is assigned as judge for this hackathon
  const isAuthorizedJudge = hackathon?.judges?.some(
    (judge) => judge.email === judgeEmail,
  );
  if (!isAuthorizedJudge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You are not assigned as a judge for this hackathon.
          </p>
        </div>
      </div>
    );
  }


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
            projectHackathons={projectHackathons}
            hackathon={hackathon}
            activeTab="overview"
          />
        </TabsContent>

        <TabsContent value="hackathon" className="space-y-6">
          <ProjectDetailsSection
            project={project}
            projectHackathons={projectHackathons}
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
            judgeEmail={judgeEmail}
            formData={formData}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
