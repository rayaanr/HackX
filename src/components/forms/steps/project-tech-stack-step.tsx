"use client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/schemas/project-schema";
import { TechStackSelector } from "@/components/forms/tech-stack-selector";

type ProjectFormValues = z.infer<typeof projectSchema>;

export function TechStackStep() {
  const {
    control,
    setValue,
    watch,
  } = useFormContext<ProjectFormValues>();

  const watchedFields = watch();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={control}
            name="githubLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/username/project"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Link to your project's GitHub repository</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="demoVideo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demo Video</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/demo"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Link to your project's demo video (optional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="techStack"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tech Stack *</FormLabel>
                <FormControl>
                  <TechStackSelector 
                    selectedTags={watchedFields.techStack || []}
                    onTagsChange={(tags) => setValue("techStack", tags)}
                  />
                </FormControl>
                <FormDescription>Technologies used in your project</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}