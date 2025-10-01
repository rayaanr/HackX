"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { type HackathonFormData } from "@/lib/schemas/hackathon-schema";
import { Trash2, Plus, Trophy, X } from "lucide-react";
import {
  usePrizeCohorts,
  useEvaluationCriteria,
} from "@/hooks/use-prize-cohorts";

export function PrizesStep() {
  const { control } = useFormContext<HackathonFormData>();
  const {
    prizeCohorts,
    addNewPrizeCohort,
    removePrizeCohortByIndex,
    hasPrizeCohorts,
  } = usePrizeCohorts();

  return (
    <div className="space-y-6">
      {hasPrizeCohorts && (
        <div className="flex justify-end">
          <Button type="button" onClick={addNewPrizeCohort} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Prize Cohort
          </Button>
        </div>
      )}

      {!hasPrizeCohorts ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No prizes added yet
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={addNewPrizeCohort}
          >
            Add your first prize
          </Button>
        </div>
      ) : (
        <div className="space-y-6 relative">
          {prizeCohorts.map((prizeCohort, index) => (
            <div
              key={prizeCohort.id}
              className="border rounded-lg p-6 space-y-6"
            >
              <div className="absolute -right-8 top-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="bg-transparent! text-red-500 hover:text-red-700"
                  onClick={() => removePrizeCohortByIndex(index)}
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
                      <FormLabel required>Prize Cohort Name</FormLabel>
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
                        <FormLabel required>Number of Winners</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
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
                        <FormLabel required>
                          Prize Amount for each winner
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="USD per winner" {...field} />
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
                    <FormLabel required>Description</FormLabel>
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

              <EvaluationCriteriaField index={index} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={control}
                  name={`prizeCohorts.${index}.judgingMode`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Judging Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
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
                      <FormLabel required>Voting Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select voting mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="judges_only">
                            Judges Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`prizeCohorts.${index}.maxVotesPerJudge`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Max Votes Per Judge</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EvaluationCriteriaField({ index }: { index: number }) {
  const { control } = useFormContext<HackathonFormData>();
  const {
    criteria,
    addNewCriterion,
    removeCriterionByIndex,
    canRemoveCriterion,
  } = useEvaluationCriteria(index);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium">Evaluation Criteria</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewCriterion}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Criteria
        </Button>
      </div>

      {criteria.map((criterion, criterionIndex) => (
        <div
          key={criterion.id}
          className="border border-dashed rounded-lg p-4 gap-4 items-end relative space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.name`}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel required>Criteria Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Innovation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`prizeCohorts.${index}.evaluationCriteria.${criterionIndex}.points`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Points</FormLabel>
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
                  <FormLabel required>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How innovative is the solution?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`absolute top-0 right-0 ${!canRemoveCriterion(criterionIndex) ? "hidden" : ""}`}
            onClick={() => removeCriterionByIndex(criterionIndex)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
