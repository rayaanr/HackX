"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { hackathonSchema } from "@/lib/schemas/hackathon-schema";
import { Trash2, Plus, Mail } from "lucide-react";

type HackathonFormValues = z.infer<typeof hackathonSchema>;

export function JudgesStep() {
  const { control } = useFormContext<HackathonFormValues>();
  
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
      <div className="flex justify-end">
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
                  control={control}
                  name={`judges.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judge Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email address of the judge"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="w-32">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="px-3 py-2 text-sm rounded-md border bg-muted">
                    {judge.status}
                  </div>
                </div>
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
    </div>
  );
}