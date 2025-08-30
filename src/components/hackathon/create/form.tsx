"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateHackathonStepper } from "./stepper";
import {
  hackathonSchema,
  HackathonFormData,
  validateDateConsistency,
} from "@/lib/schemas/hackathon-schema";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/lib/api/client";

// Mock data for testing
const mockHackathonData: HackathonFormData = {
  name: "AI Innovation Challenge 2025",
  visual:
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
  shortDescription:
    "Build the next breakthrough AI application that solves real-world problems",
  registrationPeriod: {
    registrationStartDate: new Date("2025-09-01T00:00:00"),
    registrationEndDate: new Date("2025-09-15T23:59:59"),
  },
  hackathonPeriod: {
    hackathonStartDate: new Date("2025-09-20T09:00:00"),
    hackathonEndDate: new Date("2025-09-22T18:00:00"),
  },
  votingPeriod: {
    votingStartDate: new Date("2025-09-23T00:00:00"),
    votingEndDate: new Date("2025-09-25T23:59:59"),
  },
  techStack: [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "TensorFlow",
    "OpenAI API",
  ],
  experienceLevel: "all",
  location: "San Francisco, CA (Hybrid - In-person & Virtual)",
  socialLinks: {
    website: "https://ai-challenge-2025.com",
    discord: "https://discord.gg/ai-challenge",
    twitter: "https://twitter.com/ai_challenge_2025",
    telegram: "https://t.me/ai_challenge_2025",
    github: "https://github.com/ai-challenge-2025",
  },
  fullDescription: `Join us for the most exciting AI hackathon of 2025! 

🚀 **What You'll Build**
Create innovative AI applications that address real-world challenges in healthcare, education, sustainability, or productivity.

🎯 **Challenge Categories**
- Healthcare AI Solutions
- Educational Technology
- Climate & Sustainability
- Productivity & Automation

💡 **Resources Provided**
- Free OpenAI API credits
- Cloud computing resources
- Mentorship from industry experts
- Access to cutting-edge datasets

🏆 **Why Participate?**
- Network with top AI engineers and researchers
- Learn from industry leaders
- Win amazing prizes
- Launch your AI career

This event welcomes participants of all skill levels. Whether you're a seasoned ML engineer or just getting started with AI, you'll find valuable learning opportunities and exciting challenges.`,
  prizeCohorts: [
    {
      name: "Grand Prize",
      numberOfWinners: 1,
      prizeAmount: "$10,000",
      description: "The most innovative and impactful AI solution",
      evaluationCriteria: [
        {
          name: "Innovation",
          points: 25,
          description: "Originality and creativity of the solution",
        },
        {
          name: "Technical Excellence",
          points: 25,
          description: "Code quality, architecture, and implementation",
        },
        {
          name: "Impact",
          points: 25,
          description: "Real-world applicability and potential impact",
        },
        {
          name: "Presentation",
          points: 25,
          description: "Quality of demo and presentation",
        },
      ],
      judgingMode: "manual",
      votingMode: "judges_only",
      maxVotesPerJudge: 3,
    },
    {
      name: "Best Healthcare Solution",
      numberOfWinners: 1,
      prizeAmount: "$5,000",
      description:
        "AI solution with the greatest potential to improve healthcare outcomes",
      evaluationCriteria: [
        {
          name: "Healthcare Impact",
          points: 40,
          description:
            "Potential to improve patient outcomes or healthcare efficiency",
        },
        {
          name: "Feasibility",
          points: 30,
          description: "Practical implementation in healthcare settings",
        },
        {
          name: "Innovation",
          points: 30,
          description: "Novel approach to healthcare challenges",
        },
      ],
      judgingMode: "manual",
      votingMode: "judges_only",
      maxVotesPerJudge: 2,
    },
    {
      name: "People's Choice",
      numberOfWinners: 1,
      prizeAmount: "$2,500",
      description: "The project that receives the most votes from participants",
      evaluationCriteria: [
        {
          name: "Community Appeal",
          points: 100,
          description: "Most votes from hackathon participants",
        },
      ],
      judgingMode: "automated",
      votingMode: "public",
      maxVotesPerJudge: 1,
    },
  ],
  judges: [
    {
      email: "sarah.chen@airesearch.com",
      status: "waiting",
    },
    {
      email: "michael.rodriguez@techcorp.com",
      status: "waiting",
    },
    {
      email: "dr.emily.watson@university.edu",
      status: "waiting",
    },
  ],
  schedule: [
    {
      name: "Opening Ceremony & Keynote",
      description: "Welcome address and keynote on the Future of AI",
      startDateTime: new Date("2025-09-20T09:00:00"),
      endDateTime: new Date("2025-09-20T10:30:00"),
      hasSpeaker: true,
      speaker: {
        name: "Dr. Alex Thompson",
        position: "Chief AI Officer at TechCorp",
        xName: "Dr. Alex Thompson",
        xHandle: "@alexthompsonai",
        picture:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
    },
    {
      name: "Team Formation & Networking",
      description: "Find your teammates and start brainstorming",
      startDateTime: new Date("2025-09-20T10:30:00"),
      endDateTime: new Date("2025-09-20T12:00:00"),
      hasSpeaker: false,
    },
    {
      name: "Hacking Begins!",
      description: "Start building your AI solutions",
      startDateTime: new Date("2025-09-20T13:00:00"),
      endDateTime: new Date("2025-09-22T12:00:00"),
      hasSpeaker: false,
    },
    {
      name: "Mentorship Sessions",
      description: "Get guidance from AI experts and industry mentors",
      startDateTime: new Date("2025-09-21T14:00:00"),
      endDateTime: new Date("2025-09-21T16:00:00"),
      hasSpeaker: true,
      speaker: {
        name: "Lisa Park",
        position: "Senior ML Engineer at Google",
        xName: "Lisa Park",
        xHandle: "@lisapark_ml",
        picture:
          "https://images.unsplash.com/photo-1494790108755-2616b75eb9ff?w=150&h=150&fit=crop&crop=face",
      },
    },
    {
      name: "Project Submissions Due",
      description: "Final submissions and preparation for presentations",
      startDateTime: new Date("2025-09-22T12:00:00"),
      endDateTime: new Date("2025-09-22T13:00:00"),
      hasSpeaker: false,
    },
    {
      name: "Project Presentations",
      description: "Teams present their AI solutions to judges",
      startDateTime: new Date("2025-09-22T14:00:00"),
      endDateTime: new Date("2025-09-22T17:00:00"),
      hasSpeaker: false,
    },
    {
      name: "Awards Ceremony",
      description: "Announcement of winners and closing remarks",
      startDateTime: new Date("2025-09-22T17:00:00"),
      endDateTime: new Date("2025-09-22T18:00:00"),
      hasSpeaker: false,
    },
  ],
};

export function CreateHackathonForm() {
  const { user } = useAuth();
  const router = useRouter();

  // Use mock data based on environment variable
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  const defaultValues = useMockData
    ? mockHackathonData
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
    // Validate date consistency (client-side pre-validation)
    const dateErrors = validateDateConsistency(data);
    if (Object.keys(dateErrors).length > 0) {
      // Set errors for date consistency issues
      Object.entries(dateErrors).forEach(([field, message]) => {
        setError(field as any, { type: "manual", message });
      });
      return;
    }

    clearErrors();
    createHackathonMutation.mutate(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        id="create-hackathon-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <CreateHackathonStepper
          isSubmitting={createHackathonMutation.isPending}
        />
      </form>
    </FormProvider>
  );
}
