"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { HackathonFormData } from "@/lib/schemas/hackathon-schema";

// Default prize cohort structure
const getDefaultPrizeCohort = () => ({
  name: "",
  numberOfWinners: 1,
  prizeAmount: "",
  description: "",
  judgingMode: "manual" as const,
  votingMode: "public" as const,
  maxVotesPerJudge: 1,
  evaluationCriteria: [
    {
      name: "",
      points: 10,
      description: "",
    },
  ],
});

// Default evaluation criterion
const getDefaultEvaluationCriterion = () => ({
  name: "",
  points: 10,
  description: "",
});

export function usePrizeCohorts() {
  const { control } = useFormContext<HackathonFormData>();

  const {
    fields: prizeCohorts,
    append: appendPrizeCohort,
    remove: removePrizeCohort,
  } = useFieldArray({
    control,
    name: "prizeCohorts",
  });

  // Add new prize cohort
  const addNewPrizeCohort = () => {
    appendPrizeCohort(getDefaultPrizeCohort());
  };

  // Remove prize cohort by index
  const removePrizeCohortByIndex = (index: number) => {
    removePrizeCohort(index);
  };

  // Check if there are any prize cohorts
  const hasPrizeCohorts = prizeCohorts.length > 0;

  return {
    prizeCohorts,
    addNewPrizeCohort,
    removePrizeCohortByIndex,
    hasPrizeCohorts,
  };
}

export function useEvaluationCriteria(prizeCohortIndex: number) {
  const { control } = useFormContext<HackathonFormData>();

  const {
    fields: criteria,
    append: appendCriteria,
    remove: removeCriteria,
  } = useFieldArray({
    control,
    name: `prizeCohorts.${prizeCohortIndex}.evaluationCriteria`,
  });

  // Add new evaluation criterion
  const addNewCriterion = () => {
    appendCriteria(getDefaultEvaluationCriterion());
  };

  // Remove evaluation criterion by index
  const removeCriterionByIndex = (index: number) => {
    // Prevent removing the first (and possibly only) criterion
    if (criteria.length > 1) {
      removeCriteria(index);
    }
  };

  // Check if criterion can be removed (prevent removing last one)
  const canRemoveCriterion = (index: number) => {
    return criteria.length > 1;
  };

  return {
    criteria,
    addNewCriterion,
    removeCriterionByIndex,
    canRemoveCriterion,
  };
}
