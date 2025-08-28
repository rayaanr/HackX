"use client";

import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/lib/schemas/project-schema";
import { TechStackSelector } from "@/components/forms/tech-stack-selector";

type ProjectFormValues = z.infer<typeof projectSchema>;

export function TechStackStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
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
            label="GitHub Link"
            description="Link to your project's GitHub repository"
            error={errors.githubLink?.message}
          >
            <Input
              {...register("githubLink")}
              placeholder="https://github.com/username/project"
            />
          </FormField>

          <FormField
            label="Demo Video"
            description="Link to your project's demo video (optional)"
            error={errors.demoVideo?.message}
          >
            <Input
              {...register("demoVideo")}
              placeholder="https://example.com/demo"
            />
          </FormField>

          <FormField
            label="Tech Stack"
            description="Technologies used in your project"
            required
            error={errors.techStack?.message}
          >
            <TechStackSelector 
              selectedTags={watchedFields.techStack || []}
              onTagsChange={(tags) => setValue("techStack", tags)}
            />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}