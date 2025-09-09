"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { type JudgeEvaluationFormData } from "@/lib/schemas/judge-evaluation-schema";
import type { PrizeCohort } from "@/lib/schemas/hackathon-schema";

interface ReviewActionsProps {
  projectId: string;
  hackathonId: string;
  selectedCohort: PrizeCohort | undefined;
  judgeEmail: string;
  formData: JudgeEvaluationFormData | null;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  onSubmitSuccess?: () => void;
}

export function ReviewActions({
  projectId,
  hackathonId,
  selectedCohort,
  judgeEmail,
  formData,
  isSubmitting,
  setIsSubmitting,
  onSubmitSuccess,
}: ReviewActionsProps) {
  const isFormValid =
    formData &&
    formData.selectedPrizeCohortId &&
    formData.overallFeedback.trim().length >= 10 &&
    Object.keys(formData.criteriaEvaluations).length > 0 &&
    Object.values(formData.criteriaEvaluations).every(
      (evaluation) => evaluation.feedback.trim().length > 0
    );

  const handleSubmitEvaluation = async () => {
    if (!selectedCohort || !formData || isSubmitting || !isFormValid) return;
    if (formData.selectedPrizeCohortId !== selectedCohort.id) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Calculate total score and max score from form data
      const scores = Object.fromEntries(
        Object.entries(formData.criteriaEvaluations).map(
          ([name, evaluation]) => [name, evaluation.score]
        )
      );

      const feedback = Object.fromEntries(
        Object.entries(formData.criteriaEvaluations).map(
          ([name, evaluation]) => [name, evaluation.feedback]
        )
      );

      const allowed = new Set(
        selectedCohort.evaluationCriteria
          .map((c) => String(c.points) && c.name)
          .filter(Boolean)
      );
      const totalScore = Object.entries(scores).reduce(
        (sum, [name, score]) => (allowed.has(name) ? sum + Number(score) : sum),
        0
      );
      const maxScore = selectedCohort.evaluationCriteria.reduce(
        (sum, criterion) => sum + criterion.points,
        0
      );

      const { error } = await supabase
        .from("evaluations")
        .upsert(
          {
            project_id: projectId,
            hackathon_id: hackathonId,
            prize_cohort_id: formData.selectedPrizeCohortId,
            judge_email: judgeEmail,
            scores: scores,
            feedback: feedback,
            overall_feedback: formData.overallFeedback,
            total_score: totalScore,
            max_possible_score: maxScore,
          },
          {
            onConflict: "project_id,hackathon_id,prize_cohort_id,judge_email",
          }
        )
        .select("id");

      if (error) {
        console.error("Error submitting evaluation:", error);
        const errorMessage = error.message || "Unknown error occurred";
        alert(
          `Failed to submit evaluation: ${errorMessage}. Please try again.`
        );
        return;
      }

      alert("Evaluation submitted successfully!");
      onSubmitSuccess?.();
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
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Evaluation"}
      </Button>
    </div>
  );
}
