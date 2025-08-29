"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateHackathonStepper, CreateHackathonStepperRef } from "@/components/forms/create-hackathon-stepper";
import { CompactStepperNav } from "@/components/forms/compact-stepper-nav";
import { hackathonSchema, HackathonFormData, validateDateConsistency } from "@/lib/schemas/hackathon-schema";
import { Button } from "@/components/ui/button";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { useState, useRef } from "react";
import { toast } from "sonner";

const STEPS = [
  { id: "overview", title: "Overview" },
  { id: "prizes", title: "Prizes" },
  { id: "judges", title: "Judges" },
  { id: "schedule", title: "Schedule" }
];

export function CreateHackathonPageWrapper() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState("overview");
  const stepperRef = useRef<CreateHackathonStepperRef | null>(null);
  
  const methods = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
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
    const dateErrors = validateDateConsistency(data);
    if (Object.keys(dateErrors).length > 0) {
      Object.entries(dateErrors).forEach(([field, message]) => {
        setError(field as any, { type: "manual", message });
      });
      return;
    }

    setIsSubmitting(true);
    clearErrors();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
      toast.success("Hackathon created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error creating hackathon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Save draft clicked");
    toast.success("Draft saved successfully!");
  };

  const handleStepClick = (stepId: string) => {
    if (stepperRef.current) {
      stepperRef.current.goTo(stepId);
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="-mx-4 -my-4 md:-mx-6 md:-my-6">
      <StickyPageHeader
        title="Create Hackathon"
        subtitle="Fill in the details to create your hackathon"
        backHref="/hackathons"
        navigation={
          <CompactStepperNav
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        }
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button 
              type="submit" 
              form="create-hackathon-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Hackathon"}
            </Button>
          </>
        }
      />
      <div className="px-4 py-8 md:px-6">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <FormProvider {...methods}>
              <form id="create-hackathon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <CreateHackathonStepper 
                  ref={stepperRef}
                  onStepChange={setCurrentStep}
                />
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
}