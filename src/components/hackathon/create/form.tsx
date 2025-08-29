"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateHackathonStepper } from "./stepper";
import { hackathonSchema, HackathonFormData, validateDateConsistency } from "@/lib/schemas/hackathon-schema";
import { useState } from "react";
import { toast } from "sonner"

export function CreateHackathonForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      shortDescription: "",
      registrationPeriod: {
        registrationStartDate: undefined,
        registrationEndDate: undefined,
      },
      hackathonPeriod: {
        hackathonStartDate: undefined,
        hackathonEndDate: undefined,
      },
      votingPeriod: {
        votingStartDate: undefined,
        votingEndDate: undefined,
      },
      techStack: [],
      experienceLevel: "all",
      location: "",
      socialLinks: {
        website: "",
        discord: "", 
        twitter: "",
        telegram: "",
        github: "",
      },
      fullDescription: "",
      prizeCohorts: [],
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
      toast.success("Hackathon created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error creating hackathon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form id="create-hackathon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <CreateHackathonStepper />
      </form>
    </FormProvider>
  );
}