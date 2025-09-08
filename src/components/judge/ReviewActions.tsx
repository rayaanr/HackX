"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface PrizeCohort {
  id: string;
  evaluationCriteria: Array<{ points: number }>;
}

interface ReviewActionsProps {
  projectId: string;
  hackathonId: string;
  selectedPrizeCohortId: string;
  selectedCohort: PrizeCohort | undefined;
  judgeEmail: string;
  scores: Record<string, number>;
  feedback: Record<string, string>;
  overallFeedback: string;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

export function ReviewActions({
  projectId,
  hackathonId,
  selectedPrizeCohortId,
  selectedCohort,
  judgeEmail,
  scores,
  feedback,
  overallFeedback,
  isSubmitting,
  setIsSubmitting,
}: ReviewActionsProps) {
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
    <div className="pt-6">
      <Button
        onClick={handleSubmitEvaluation}
        className="w-full"
        disabled={!selectedPrizeCohortId || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Evaluation"}
      </Button>
    </div>
  );
}