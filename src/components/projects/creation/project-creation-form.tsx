"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectStepper } from "./project-creation-stepper";
import { projectSchema, ProjectFormData } from "@/lib/schemas/project-schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBlockchainProjects } from "@/hooks/use-projects";
import { useRouter } from "next/navigation";
import { MOCK_PROJECT_DATA } from "@/data/mock-project-data";
import { Shuffle, Info } from "lucide-react";
import { ClassicLoader } from "@/components/ui/loader";

export function CreateProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const router = useRouter();

  const { submitProject, submitToHackathon, isConnected } =
    useBlockchainProjects();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      logo: "",
      name: "",
      intro: "",
      pitchVideo: "",
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

  // Listen for IPFS upload state changes
  useEffect(() => {
    const handleIPFSUploadChange = (event: CustomEvent) => {
      setIsUploadingToIPFS(event.detail.isUploadingToIPFS);
    };

    window.addEventListener(
      "projectIPFSUploadChange" as any,
      handleIPFSUploadChange,
    );

    return () => {
      window.removeEventListener(
        "projectIPFSUploadChange" as any,
        handleIPFSUploadChange,
      );
    };
  }, []);

  const handleFillMockData = () => {
    const randomIndex = Math.floor(Math.random() * MOCK_PROJECT_DATA.length);
    const mockData = MOCK_PROJECT_DATA[randomIndex];

    // Remove logo from mock data - users should upload their own images
    const { logo, ...mockDataWithoutLogo } = mockData;

    form.reset(mockDataWithoutLogo);
    toast.success(`Form filled with "${mockData.name}" mock data!`);
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    // Dispatch loading state change
    window.dispatchEvent(
      new CustomEvent("projectLoadingChange", { detail: { isLoading: true } }),
    );

    try {
      console.log("🚀 Creating project with data:", data);

      // Only allow blockchain submission if wallet is connected
      if (!isConnected) {
        throw new Error("Please connect your wallet to create projects.");
      }

      // Step 1: Create the project on blockchain
      console.log("📤 Creating project on blockchain...");
      const createResult = await new Promise<{
        projectId: number;
        ipfsHash: string;
        transactionHash: string;
      }>((resolve, reject) => {
        submitProject(
          { projectData: data, hackathonId: "0" }, // hackathonId not used in createProject
          {
            onSuccess: resolve,
            onError: reject,
          },
        );
      });

      console.log("✅ Project created successfully:", createResult);

      // Step 2: If user has hackathons selected, submit to each one
      if (data.hackathonIds && data.hackathonIds.length > 0) {
        console.log(
          `📤 Submitting to ${data.hackathonIds.length} hackathon(s)...`,
        );

        // Submit to each selected hackathon
        const submissionPromises = data.hackathonIds.map((hackathonId) => {
          return new Promise((resolve, reject) => {
            submitToHackathon(
              {
                projectId: createResult.projectId,
                hackathonId: hackathonId,
              },
              {
                onSuccess: resolve,
                onError: reject,
              },
            );
          });
        });

        try {
          await Promise.all(submissionPromises);
          console.log("✅ All hackathon submissions completed");

          toast.success(
            `Project created and submitted to ${data.hackathonIds.length} hackathon(s)!`,
            {
              description: "Successfully stored on IPFS and blockchain.",
            },
          );
        } catch (submissionError) {
          console.warn("⚠️ Some hackathon submissions failed:", submissionError);
          toast.success("Project created successfully!", {
            description:
              "Project is stored on blockchain, but some hackathon submissions may have failed.",
          });
        }
      } else {
        toast.success("Project created successfully!", {
          description:
            "Your project is now stored on IPFS and blockchain. You can submit it to hackathons later.",
          action: {
            label: "View on Explorer",
            onClick: () => {
              const explorerUrl = `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${createResult.transactionHash}`;
              window.open(explorerUrl, "_blank");
            },
          },
        });
      }

      // Redirect to projects page
      router.push("/projects/" + createResult.projectId);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error creating project. Please try again.",
        { description: "Check console for details" },
      );
    } finally {
      setIsSubmitting(false);
      // Dispatch loading state change
      window.dispatchEvent(
        new CustomEvent("projectLoadingChange", {
          detail: { isLoading: false },
        }),
      );
    }
  };

  return (
    <Form {...form}>
      {/* Mock Data Controls */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Testing Mode: Use mock data to quickly test the project creation
              flow
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillMockData}
            id="fill-mock-data-project"
            className="gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Fill with Mock Data
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CreateProjectStepper
          isSubmitting={isSubmitting}
          isUploadingToIPFS={isUploadingToIPFS}
        />
        {/* Hidden submit button for programmatic access */}
        <Button
          type="submit"
          id="stepper-create-project"
          disabled={isSubmitting || isUploadingToIPFS || !isConnected}
          className="hidden"
        >
          {isUploadingToIPFS ? (
            <>
              <ClassicLoader size="sm" className="mr-2" />
              Uploading to IPFS...
            </>
          ) : isSubmitting ? (
            <>
              <ClassicLoader size="sm" className="mr-2" />
              Creating Project...
            </>
          ) : !isConnected ? (
            "Connect Wallet Required"
          ) : form.watch("hackathonIds")?.length > 0 ? (
            `Create & Submit to ${
              form.watch("hackathonIds")?.length
            } Hackathon${form.watch("hackathonIds")?.length > 1 ? "s" : ""}`
          ) : (
            "Create Project"
          )}
        </Button>
      </form>
    </Form>
  );
}
