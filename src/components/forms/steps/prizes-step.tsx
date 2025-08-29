"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { Trash2, Plus } from "lucide-react";

type HackathonFormValues = z.infer<typeof hackathonSchema>;

export function PrizesStep() {
  const { control } = useFormContext<HackathonFormValues>();
  
  const { fields: prizeCohorts, append: appendPrizeCohort, remove: removePrizeCohort } = useFieldArray({
    control,
    name: "prizeCohorts",
  });

  const appendNewPrizeCohort = () => {
    appendPrizeCohort({
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
              control={control}
              name={`prizeCohorts.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize Cohort Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Overall Winner, Best Design, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`prizeCohorts.${index}.numberOfWinners`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Winners *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`prizeCohorts.${index}.prizeAmount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize Amount ($) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={control}
            name={`prizeCohorts.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe this prize cohort"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name={`prizeCohorts.${index}.judgingMode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judging Mode *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select judging mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automated">Automated</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`prizeCohorts.${index}.votingMode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voting Mode *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voting mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="judges_only">Judges Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name={`prizeCohorts.${index}.maxVotesPerJudge`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Votes Per Judge *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <EvaluationCriteriaField index={index} />
        </div>
      ))}
    </div>
  );
}

function EvaluationCriteriaField({ index }: { index: number }) {
  const { control } = useFormContext<HackathonFormValues>();
  
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
            <FormField
              control={control}
              name={`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Criteria Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Innovation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={control}
              name={`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.points`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-5">
            <FormField
              control={control}
              name={`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="How innovative is the solution?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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