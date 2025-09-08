"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createJudgeEvaluationSchema,
  type JudgeEvaluationFormData,
  type CriterionEvaluation,
} from "@/lib/schemas/judge-evaluation-schema";

interface EvaluationCriterion {
  name: string;
  description: string;
  points: number;
}

interface PrizeCohort {
  id: string;
  name: string;
  evaluationCriteria: EvaluationCriterion[];
}

interface Hackathon {
  prizeCohorts: PrizeCohort[];
}

interface JudgingInterfaceProps {
  hackathon: Hackathon;
  onFormDataChange: (data: JudgeEvaluationFormData) => void;
  onSelectedCohortChange: (cohort: PrizeCohort | undefined) => void;
}

export function JudgingInterface({
  hackathon,
  onFormDataChange,
  onSelectedCohortChange,
}: JudgingInterfaceProps) {
  // Create initial form with first cohort selected
  const initialCohort = hackathon.prizeCohorts[0];
  const schema = initialCohort ? createJudgeEvaluationSchema(initialCohort.evaluationCriteria) : createJudgeEvaluationSchema([]);

  // Generate default values
  const getDefaultValues = (cohort: PrizeCohort | null): JudgeEvaluationFormData => {
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
  };

  const form = useForm<JudgeEvaluationFormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialCohort || null),
    mode: "onChange",
  });

  const { watch, setValue, reset } = form;
  const selectedPrizeCohortId = watch("selectedPrizeCohortId");
  
  // Find the selected cohort
  const selectedCohort = hackathon.prizeCohorts.find(
    (cohort) => cohort.id === selectedPrizeCohortId
  );

  // Update parent component when form data changes
  useEffect(() => {
    const subscription = watch((data) => {
      if (data && typeof data === 'object') {
        onFormDataChange(data as JudgeEvaluationFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormDataChange]);

  // Update parent component when selected cohort changes
  useEffect(() => {
    onSelectedCohortChange(selectedCohort);
  }, [selectedCohort, onSelectedCohortChange]);

  // Reset form when cohort changes
  useEffect(() => {
    if (selectedCohort) {
      reset(getDefaultValues(selectedCohort));
    }
  }, [selectedPrizeCohortId, selectedCohort, reset]);

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Prize Cohort Selection */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Select A Prize Cohort</h2>
          <FormField
            control={form.control}
            name="selectedPrizeCohortId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full bg-muted">
                      <SelectValue placeholder="Select a prize cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      {hackathon.prizeCohorts.map((cohort) => (
                        <SelectItem key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Evaluation Criteria Table */}
        {selectedCohort && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Evaluation Criteria</h2>

            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 py-3 border-b border-muted text-sm font-medium text-muted-foreground">
              <div>Name</div>
              <div>Description</div>
              <div>Max Score</div>
              <div>Your Score</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-1">
              {selectedCohort.evaluationCriteria.map((criterion) => (
                <div
                  key={criterion.name}
                  className="space-y-3 py-4 border-b border-muted/50"
                >
                  <div className="grid grid-cols-4 gap-4 items-start">
                    <div className="font-medium text-sm">
                      {criterion.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {criterion.description}
                    </div>
                    <div className="font-medium text-sm">
                      {criterion.points}
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name={`criteriaEvaluations.${criterion.name}.score`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max={criterion.points}
                                step="0.5"
                                value={field.value || 0}
                                onChange={(e) => {
                                  const value = Math.min(
                                    criterion.points,
                                    Math.max(0, parseFloat(e.target.value) || 0)
                                  );
                                  field.onChange(value);
                                }}
                                className="w-20 h-8 text-center bg-muted"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 items-start">
                    <FormLabel className="text-xs text-muted-foreground">
                      Feedback
                    </FormLabel>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`criteriaEvaluations.${criterion.name}.feedback`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder={`Provide specific feedback for ${criterion.name}...`}
                                value={field.value || ""}
                                onChange={field.onChange}
                                className="min-h-[60px] text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="space-y-3 pt-6 border-t border-muted/50">
              <FormField
                control={form.control}
                name="overallFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Overall Feedback
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide overall feedback for this project submission..."
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}