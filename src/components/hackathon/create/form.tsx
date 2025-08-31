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
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api/client";
import { getRandomHackathons } from "@/data/hackathons";

export function CreateHackathonForm() {
  const router = useRouter();

  // Get a random mock hackathon for testing
  const randomMockData = getRandomHackathons(1)[0];

  // Convert mock data to form format
  const mockFormData: HackathonFormData = {
    name: randomMockData.name,
    visual: randomMockData.visual || "",
    shortDescription: randomMockData.shortDescription,
    fullDescription: randomMockData.fullDescription,
    location: randomMockData.location,
    techStack: randomMockData.techStack,
    experienceLevel: randomMockData.experienceLevel,
    registrationPeriod: randomMockData.registrationPeriod || {
      registrationStartDate: undefined,
      registrationEndDate: undefined,
    },
    hackathonPeriod: randomMockData.hackathonPeriod || {
      hackathonStartDate: undefined,
      hackathonEndDate: undefined,
    },
    votingPeriod: randomMockData.votingPeriod || {
      votingStartDate: undefined,
      votingEndDate: undefined,
    },
    socialLinks: {
      website: (randomMockData.socialLinks as any)?.website || "",
      discord: (randomMockData.socialLinks as any)?.discord || "",
      twitter: (randomMockData.socialLinks as any)?.twitter || "",
      telegram: (randomMockData.socialLinks as any)?.telegram || "",
      github: (randomMockData.socialLinks as any)?.github || "",
    },
    prizeCohorts: randomMockData.prizeCohorts,
    judges: randomMockData.judges,
    schedule: randomMockData.schedule.map((slot: any) => ({
      ...slot,
      speaker: slot.speaker
        ? {
            ...slot.speaker,
            picture: slot.speaker.picture || "",
          }
        : undefined,
    })),
  };

  // Use mock data based on environment variable
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const defaultValues = useMockData
    ? mockFormData
    : {
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
  const createHackathonMutation = useMutation({
    mutationFn: (data: HackathonFormData) => apiClient.createHackathon(data),
    onSuccess: (result) => {
      toast.success(result.message || "Hackathon created successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Error creating hackathon:", error);

      if (error instanceof ApiError) {
        // Handle validation errors
        if (error.status === 400 && error.details) {
          // Set field errors from validation
          Object.entries(error.details).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as any, {
                type: "server",
                message: messages[0] as string,
              });
            }
          });
          toast.error("Please fix the validation errors");
          return;
        }

        // Handle authentication errors
        if (error.status === 401) {
          toast.error("Please log in to create a hackathon");
          router.push("/login");
          return;
        }

        toast.error(error.message);
      } else {
        toast.error("Failed to create hackathon");
      }
    },
  });

  const onSubmit = async (data: HackathonFormData) => {
    console.log('Form submitted with data:', data);
    
    // Validate date consistency (client-side pre-validation)
    const dateErrors = validateDateConsistency(data);
    if (Object.keys(dateErrors).length > 0) {
      console.log('Date validation errors:', dateErrors);
      // Set errors for date consistency issues
      Object.entries(dateErrors).forEach(([field, message]) => {
        setError(field as any, { type: "manual", message });
      });
      toast.error("Please fix the date validation errors");
      return;
    }

    clearErrors();
    console.log('Creating hackathon...');
    createHackathonMutation.mutate(data);
  };

  return (
    <Form {...methods}>
      <form
        id="create-hackathon-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
        onKeyDown={(e) => {
          // Prevent form submission on Enter key press (except in textareas)
          if (e.key === 'Enter' && e.target instanceof HTMLElement && e.target.tagName !== 'TEXTAREA') {
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
