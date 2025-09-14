"use client";

import { Button } from "@/components/ui/button";
import { type JudgeEvaluationFormData } from "@/lib/schemas/judge-evaluation-schema";
import type { PrizeCohort } from "@/lib/schemas/hackathon-schema";

interface ReviewActionsProps {
  projectId: string;
  hackathonId: string;
  selectedCohort: PrizeCohort | undefined;
  judgeEmail: string; // Will be wallet address when passed from parent
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
      (evaluation) => evaluation.feedback.trim().length > 0,
    );

  const handleSubmitEvaluation = async () => {
    if (!selectedCohort || !formData || isSubmitting || !isFormValid) return;
    if (formData.selectedPrizeCohortId !== selectedCohort.id) return;

    setIsSubmitting(true);

    try {
      // Calculate total score and max score from form data
      const scores = Object.fromEntries(
        Object.entries(formData.criteriaEvaluations).map(
          ([name, evaluation]) => [name, evaluation.score],
        ),
      );

      const feedback = Object.fromEntries(
        Object.entries(formData.criteriaEvaluations).map(
          ([name, evaluation]) => [name, evaluation.feedback],
        ),
      );

      const allowed = new Set(
        selectedCohort.evaluationCriteria
          .map((c) => String(c.points) && c.name)
          .filter(Boolean),
      );
      const totalScore = Object.entries(scores).reduce(
        (sum, [name, score]) => (allowed.has(name) ? sum + Number(score) : sum),
        0,
      );
      const maxScore = selectedCohort.evaluationCriteria.reduce(
        (sum, criterion) => sum + criterion.points,
        0,
      );

      // TODO: Replace with smart contract call to submit evaluation
      // For now, just simulate the submission
      const evaluationData = {
        project_id: projectId,
        hackathon_id: hackathonId,
        prize_cohort_id: formData.selectedPrizeCohortId,
        judge_address: judgeEmail, // This is now a wallet address
        scores: scores,
        feedback: feedback,
        overall_feedback: formData.overallFeedback,
        total_score: totalScore,
        max_possible_score: maxScore,
      };

      console.log(
        "Evaluation data to be submitted to blockchain:",
        evaluationData,
      );

      // Simulate successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
