"use client";

import { useHackathonByIdPublic } from "@/hooks/queries/use-hackathons";
import {
  useProjectById,
  useProjectHackathons,
} from "@/hooks/queries/use-projects";
import { useCurrentUser } from "@/hooks/use-auth";
import { transformDatabaseToUI } from "@/lib/helpers/hackathon-transforms";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { use, useEffect, useState, useMemo } from "react";
import { ProjectReviewHeader } from "@/components/judge/ProjectReviewHeader";
import { ProjectDetailsSection } from "@/components/judge/ProjectDetailsSection";
import { JudgingInterface } from "@/components/judge/JudgingInterface";
import { ReviewActions } from "@/components/judge/ReviewActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // All hooks must be called before any conditional returns
  const [selectedPrizeCohortId, setSelectedPrizeCohortId] =
    useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transform data safely
  const hackathon = dbHackathon ? transformDatabaseToUI(dbHackathon) : null;

  // Memoize selectedCohort to prevent infinite re-renders
  const selectedCohort = useMemo(() => {
    return hackathon?.prizeCohorts.find(
      (cohort) => cohort.id === selectedPrizeCohortId,
    );
  }, [hackathon?.prizeCohorts, selectedPrizeCohortId]);

  // Initialize selectedPrizeCohortId when hackathon data is available
  useEffect(() => {
    if (hackathon && !selectedPrizeCohortId && hackathon.prizeCohorts[0]?.id) {
      setSelectedPrizeCohortId(hackathon.prizeCohorts[0].id);
    }
  }, [hackathon, selectedPrizeCohortId]);

  // Initialize scores and feedback when selectedCohort changes
  useEffect(() => {
    if (selectedCohort && selectedCohort.evaluationCriteria.length > 0) {
      const initialScores: Record<string, number> = {};
      const initialFeedback: Record<string, string> = {};

      selectedCohort.evaluationCriteria.forEach((criterion) => {
        initialScores[criterion.name] = 0;
        initialFeedback[criterion.name] = "";
      });

      // Only update if the scores are actually different
      setScores((prevScores) => {
        const isDifferent =
          Object.keys(initialScores).some((key) => !(key in prevScores)) ||
          Object.keys(prevScores).length !== Object.keys(initialScores).length;

        return isDifferent ? initialScores : prevScores;
      });

      setFeedback((prevFeedback) => {
        const isDifferent =
          Object.keys(initialFeedback).some((key) => !(key in prevFeedback)) ||
          Object.keys(prevFeedback).length !==
            Object.keys(initialFeedback).length;

        return isDifferent ? initialFeedback : prevFeedback;
      });
    }
  }, [selectedCohort?.id]);

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

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0,
  );
  const maxScore =
    selectedCohort?.evaluationCriteria.reduce(
      (sum, criterion) => sum + criterion.points,
      0,
    ) || 0;

  const handleSubmitEvaluation = async () => {
    if (!selectedCohort || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Use authenticated user's email for judge identification
      // Email validation already performed above

      const { error } = await supabase
        .from("evaluations")
        .upsert(
          {
            project_id: projectId,
            hackathon_id: hackathonId,
            prize_cohort_id:
              selectedPrizeCohortId ||
              (() => {
                throw new Error("No prize cohort selected for evaluation");
              })(),
            judge_email: judgeEmail,
            scores: scores,
            feedback: feedback,
            overall_feedback: overallFeedback,
            total_score: totalScore,
            max_possible_score: maxScore,
          },
          {
            onConflict: "project_id,hackathon_id,prize_cohort_id,judge_email",
          },
        )
        .select("id"); // Minimal return - only need to confirm insertion

      if (error) {
        console.error("Error submitting evaluation:", error);
        const errorMessage = error.message || "Unknown error occurred";
        alert(
          `Failed to submit evaluation: ${errorMessage}. Please try again.`,
        );
        return;
      }

      alert("Evaluation submitted successfully!");
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("Failed to submit evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            selectedPrizeCohortId={selectedPrizeCohortId}
            setSelectedPrizeCohortId={setSelectedPrizeCohortId}
            selectedCohort={selectedCohort}
            scores={scores}
            setScores={setScores}
            feedback={feedback}
            setFeedback={setFeedback}
            overallFeedback={overallFeedback}
            setOverallFeedback={setOverallFeedback}
          />
          {selectedCohort && (
            <ReviewActions
              projectId={projectId}
              hackathonId={hackathonId}
              selectedPrizeCohortId={selectedPrizeCohortId}
              selectedCohort={selectedCohort}
              judgeEmail={judgeEmail}
              scores={scores}
              feedback={feedback}
              overallFeedback={overallFeedback}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
