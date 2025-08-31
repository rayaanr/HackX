"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectStepper } from "@/components/forms/create-project-stepper";
import { projectSchema, ProjectFormData } from "@/lib/schemas/project-schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function CreateProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      logo: "",
      name: "",
      intro: "",
      itchVideo: "",
      sector: [],
      progress: "",
      fundraisingStatus: "",
      description: "",
      githubLink: "",
      demoVideo: "",
      techStack: [],
      hackathonIds: [],
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Here you would typically send the data to your API
      toast.success("Project created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error creating project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <CreateProjectStepper />
        
        <div className="flex justify-end gap-4 pt-8">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}