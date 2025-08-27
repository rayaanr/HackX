"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateHackathonStepper } from "@/components/forms/create-hackathon-stepper";
import { hackathonSchema, HackathonFormData, validateDateConsistency } from "@/lib/schemas/hackathon-schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CreateHackathonForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      techStack: [],
      experienceLevel: "all",
      location: "",
      socialLinks: [],
      fullDescription: "",
      prizeCohorts: [],
      judgingMode: "manual",
      votingMode: "public",
      maxVotesPerJudge: 5,
      judges: [],
      schedule: [],
    },
  });

  const { handleSubmit, setError, clearErrors } = methods;

  const onSubmit = async (data: HackathonFormData) => {
    // Validate date consistency
    const dateErrors = validateDateConsistency(data);
    if (Object.keys(dateErrors).length > 0) {
      // Set errors for date consistency issues
      Object.entries(dateErrors).forEach(([field, message]) => {
        setError(field as any, { type: "manual", message });
      });
      return;
    }

    setIsSubmitting(true);
    clearErrors();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
      // Here you would typically send the data to your API
      alert("Hackathon created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error creating hackathon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <CreateHackathonStepper />
        
        <div className="flex justify-end gap-4 pt-8">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Hackathon"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}