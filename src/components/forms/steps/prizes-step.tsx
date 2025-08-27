"use client";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { Trash2, Plus } from "lucide-react";

type HackathonFormValues = z.infer<typeof hackathonSchema>;

export function PrizesStep() {
  const { register, control, formState: { errors } } = useFormContext<HackathonFormValues>();
  
  const { fields: prizeCohorts, append: appendPrizeCohort, remove: removePrizeCohort } = useFieldArray({
    control,
    name: "prizeCohorts",
  });

  const appendNewPrizeCohort = () => {
    appendPrizeCohort({
      name: "",
      numberOfWinners: 1,
      prizeAmount: 0,
      description: "",
      evaluationCriteria: [
        {
          name: "",
          points: 10,
          description: "",
        }
      ]
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Prize Cohorts</h3>
        <Button type="button" onClick={appendNewPrizeCohort} variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Prize Cohort
        </Button>
      </div>

      {prizeCohorts.map((prizeCohort, index) => (
        <div key={prizeCohort.id} className="border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium">Prize Cohort #{index + 1}</h4>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => removePrizeCohort(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Prize Cohort Name"
              required
            >
              <Input
                {...register(`prizeCohorts.${index}.name`)}
                placeholder="Overall Winner, Best Design, etc."
                className={errors.prizeCohorts?.[index]?.name ? "border-destructive" : ""}
              />
              {errors.prizeCohorts?.[index]?.name && (
                <p className="text-sm text-destructive">
                  {errors.prizeCohorts?.[index]?.name?.message}
                </p>
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Number of Winners"
                required
              >
                <Input
                  type="number"
                  {...register(`prizeCohorts.${index}.numberOfWinners`, { valueAsNumber: true })}
                  placeholder="1"
                  min="1"
                  className={errors.prizeCohorts?.[index]?.numberOfWinners ? "border-destructive" : ""}
                />
                {errors.prizeCohorts?.[index]?.numberOfWinners && (
                  <p className="text-sm text-destructive">
                    {errors.prizeCohorts?.[index]?.numberOfWinners?.message}
                  </p>
                )}
              </FormField>

              <FormField
                label="Prize Amount ($)"
                required
              >
                <Input
                  type="number"
                  {...register(`prizeCohorts.${index}.prizeAmount`, { valueAsNumber: true })}
                  placeholder="1000"
                  min="0"
                  className={errors.prizeCohorts?.[index]?.prizeAmount ? "border-destructive" : ""}
                />
                {errors.prizeCohorts?.[index]?.prizeAmount && (
                  <p className="text-sm text-destructive">
                    {errors.prizeCohorts?.[index]?.prizeAmount?.message}
                  </p>
                )}
              </FormField>
            </div>
          </div>

          <FormField
            label="Description"
            required
          >
            <Textarea
              {...register(`prizeCohorts.${index}.description`)}
              placeholder="Describe this prize cohort"
              className={errors.prizeCohorts?.[index]?.description ? "border-destructive" : ""}
            />
            {errors.prizeCohorts?.[index]?.description && (
              <p className="text-sm text-destructive">
                {errors.prizeCohorts?.[index]?.description?.message}
              </p>
            )}
          </FormField>

          <EvaluationCriteriaField index={index} />
        </div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Judging Mode"
          required
        >
          <select
            {...register("judgingMode")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="manual">Manual</option>
            <option value="automated">Automated</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {errors.judgingMode && (
            <p className="text-sm text-destructive">
              {errors.judgingMode.message}
            </p>
          )}
        </FormField>

        <FormField
          label="Voting Mode"
          required
        >
          <select
            {...register("votingMode")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="judges_only">Judges Only</option>
          </select>
          {errors.votingMode && (
            <p className="text-sm text-destructive">
              {errors.votingMode.message}
            </p>
          )}
        </FormField>
      </div>

      <FormField
        label="Max Votes Per Judge"
        required
      >
        <Input
          type="number"
          {...register("maxVotesPerJudge", { valueAsNumber: true })}
          placeholder="5"
          min="1"
          className={errors.maxVotesPerJudge ? "border-destructive" : ""}
        />
        {errors.maxVotesPerJudge && (
          <p className="text-sm text-destructive">
            {errors.maxVotesPerJudge.message}
          </p>
        )}
      </FormField>
    </div>
  );
}

function EvaluationCriteriaField({ index }: { index: number }) {
  const { register, control, formState: { errors } } = useFormContext<HackathonFormValues>();
  
  const { fields: criteria, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: `prizeCohorts.${index}.evaluationCriteria`,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium">Evaluation Criteria</h4>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => appendCriteria({
            name: "",
            points: 10,
            description: ""
          })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Criteria
        </Button>
      </div>

      {criteria.map((criterion, criterionIndex) => (
        <div key={criterion.id} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <FormField label="Criteria Name" required>
              <Input
                {...register(`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.name`)}
                placeholder="Innovation"
                className={errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.name ? "border-destructive" : ""}
              />
              {errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.name && (
                <p className="text-sm text-destructive">
                  {errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.name?.message}
                </p>
              )}
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Points" required>
              <Input
                type="number"
                {...register(`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.points`, { valueAsNumber: true })}
                placeholder="10"
                min="1"
                className={errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.points ? "border-destructive" : ""}
              />
              {errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.points && (
                <p className="text-sm text-destructive">
                  {errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.points?.message}
                </p>
              )}
            </FormField>
          </div>

          <div className="md:col-span-5">
            <FormField label="Description" required>
              <Input
                {...register(`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.description`)}
                placeholder="How innovative is the solution?"
                className={errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.description ? "border-destructive" : ""}
              />
              {errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.description && (
                <p className="text-sm text-destructive">
                  {errors.prizeCohorts?.[index]?.evaluationCriteria?.[criterionIndex]?.description?.message}
                </p>
              )}
            </FormField>
          </div>

          <div className="md:col-span-1">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => removeCriteria(criterionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}