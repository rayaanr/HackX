"use client";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { Trash2, Plus, Mail } from "lucide-react";

type HackathonFormValues = z.infer<typeof hackathonSchema>;

export function JudgesStep() {
  const { register, control, formState: { errors } } = useFormContext<HackathonFormValues>();
  
  const { fields: judges, append: appendJudge, remove: removeJudge } = useFieldArray({
    control,
    name: "judges",
  });

  const appendNewJudge = () => {
    appendJudge({
      email: "",
      status: "invited"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Judges</h3>
        <Button type="button" onClick={appendNewJudge} variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Judge
        </Button>
      </div>

      {judges.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No judges added yet
          </p>
          <Button 
            type="button" 
            variant="outline" 
            className="mt-4"
            onClick={appendNewJudge}
          >
            Add your first judge
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {judges.map((judge, index) => (
            <div key={judge.id} className="flex items-end gap-4">
              <div className="flex-1">
                <FormField
                  label="Judge Email"
                  required
                >
                  <Input
                    type="email"
                    {...register(`judges.${index}.email`)}
                    placeholder="judge@example.com"
                    className={errors.judges?.[index]?.email ? "border-destructive" : ""}
                  />
                  {errors.judges?.[index]?.email && (
                    <p className="text-sm text-destructive">
                      {errors.judges?.[index]?.email?.message}
                    </p>
                  )}
                </FormField>
              </div>
              
              <div className="w-32">
                <FormField label="Status">
                  <div className="px-3 py-2 text-sm rounded-md border bg-muted">
                    {judge.status}
                  </div>
                </FormField>
              </div>
              
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={() => removeJudge(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4">
        <p className="text-sm text-muted-foreground">
          Judges will receive an email invitation to join your hackathon. They can accept or decline the invitation.
        </p>
      </div>
    </div>
  );
}