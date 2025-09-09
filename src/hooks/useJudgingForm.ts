"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createJudgeEvaluationSchema,
  type JudgeEvaluationFormData,
  type CriterionEvaluation,
} from "@/lib/schemas/judge-evaluation-schema";
import type { PrizeCohort } from "@/lib/schemas/hackathon-schema";

interface JudgingFormOptions {
  hackathon: {
    prizeCohorts: PrizeCohort[];
  };
  onFormDataChange: (data: JudgeEvaluationFormData) => void;
  onSelectedCohortChange: (cohort: PrizeCohort | undefined) => void;
}

// Helper function to generate default values for evaluation form
function generateDefaultFormValues(
  cohort: PrizeCohort | null,
): JudgeEvaluationFormData {
  const criteriaEvaluations: Record<string, CriterionEvaluation> = {};

  if (cohort) {
    cohort.evaluationCriteria.forEach((criterion) => {
      criteriaEvaluations[criterion.name] = {
        score: 0,
        feedback: "",
      };
    });
  }

  return {
    selectedPrizeCohortId: cohort?.id || "",
    criteriaEvaluations,
    overallFeedback: "",
  };
}

export function useJudgingForm({
  hackathon,
  onFormDataChange,
  onSelectedCohortChange,
}: JudgingFormOptions) {
  // State for cohort selection
  const [selectedCohortId, setSelectedCohortId] = useState<string>(
    hackathon.prizeCohorts[0]?.id || "",
  );

  // Find the selected cohort
  const selectedCohort = hackathon.prizeCohorts.find(
    (cohort) => cohort.id === selectedCohortId,
  );

  // Handle cohort selection change
  const handleCohortChange = (cohortId: string) => {
    setSelectedCohortId(cohortId);
  };

  // Memoize schema to provide stable object reference across renders
  // Only recreate when the evaluation criteria actually change
  const schema = useMemo(() => {
    return selectedCohort
      ? createJudgeEvaluationSchema(selectedCohort.evaluationCriteria)
      : createJudgeEvaluationSchema([]);
  }, [selectedCohort?.evaluationCriteria]);

  // Memoize default values to provide stable reference
  const defaultValues = useMemo(() => {
    return generateDefaultFormValues(selectedCohort || null);
  }, [selectedCohort]);

  const form = useForm<JudgeEvaluationFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
    shouldUnregister: true, // Drop stale fields when form remounts
  });

  const { watch } = form;

  // Update parent component when selected cohort changes
  useEffect(() => {
    onSelectedCohortChange(selectedCohort);
  }, [selectedCohort, onSelectedCohortChange]);

  // Update parent component when form data changes
  useEffect(() => {
    const subscription = watch((data) => {
      if (data && typeof data === "object") {
        onFormDataChange(data as JudgeEvaluationFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormDataChange]);

  // Reset form when cohort changes
  useEffect(() => {
    form.reset(generateDefaultFormValues(selectedCohort || null));
  }, [selectedCohort, form]);

  // Create a formKey that changes whenever selectedCohortId changes
  // This allows consumers to force-remount the form on cohort switch
  const formKey = useMemo(() => {
    return `judging-form-${selectedCohortId || "no-cohort"}`;
  }, [selectedCohortId]);

  return {
    form,
    selectedCohort,
    selectedCohortId,
    handleCohortChange,
    hackathon,
    formKey,
  };
}
