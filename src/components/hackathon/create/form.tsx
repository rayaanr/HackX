"use client";

import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateHackathonStepper } from "./stepper";
import {
  hackathonSchema,
  HackathonFormData,
  validateDateConsistency,
} from "@/lib/schemas/hackathon-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateHackathon } from "@/hooks/queries/use-hackathons";
export function CreateHackathonForm() {
  const router = useRouter();

  const defaultValues = {
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
        experienceLevel: "all" as const,
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
      };

  const methods = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues,
  });

  const { handleSubmit, setError, clearErrors } = methods;

  // Create hackathon mutation
  const createHackathonMutation = useCreateHackathon();

  const handleCreateSuccess = () => {
    toast.success("Hackathon created successfully!");
    router.push("/dashboard");
  };

  const handleCreateError = (error: Error) => {
    console.error("Error creating hackathon:", error);

    // Handle authentication errors
    if (error.message.includes("Authentication")) {
      toast.error("Please log in to create a hackathon");
      router.push("/login");
      return;
    }

    toast.error(error.message || "Failed to create hackathon");
  };

  const onSubmit = async (data: HackathonFormData) => {
    console.log("Form submitted with data:", data);

    // Validate date consistency (client-side pre-validation)
    const dateErrors = validateDateConsistency(data);
    if (Object.keys(dateErrors).length > 0) {
      console.log("Date validation errors:", dateErrors);
      // Set errors for date consistency issues
      Object.entries(dateErrors).forEach(([field, message]) => {
        setError(field as any, { type: "manual", message });
      });
      toast.error("Please fix the date validation errors");
      return;
    }

    clearErrors();
    console.log("Creating hackathon...");
    createHackathonMutation.mutate(data, {
      onSuccess: handleCreateSuccess,
      onError: handleCreateError,
    });
  };

  return (
    <Form {...methods}>
      <form
        id="create-hackathon-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
        onKeyDown={(e) => {
          // Prevent form submission on Enter key press (except in textareas)
          if (
            e.key === "Enter" &&
            e.target instanceof HTMLElement &&
            e.target.tagName !== "TEXTAREA"
          ) {
            e.preventDefault();
          }
        }}
      >
        <CreateHackathonStepper
          isSubmitting={createHackathonMutation.isPending}
        />
      </form>
    </Form>
  );
}
