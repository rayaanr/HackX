"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectStepper } from "./project-creation-stepper";
import { projectSchema, ProjectFormData } from "@/lib/schemas/project-schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { toast } from "sonner";
import { useBlockchainProjects } from "@/hooks/blockchain/useBlockchainProjects";
import { useRouter } from "next/navigation";

export function CreateProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);

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
        });
      }

      // Redirect to projects page
      router.push("/dashboard");
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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CreateProjectStepper />

        <div className="flex justify-end gap-4 pt-8">
          <Button type="button" variant="outline">
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting || !isConnected}>
            {isSubmitting
              ? "Creating Project..."
              : !isConnected
                ? "Connect Wallet Required"
                : form.watch("hackathonIds")?.length > 0
                  ? `Create & Submit to ${
                      form.watch("hackathonIds")?.length
                    } Hackathon${form.watch("hackathonIds")?.length > 1 ? "s" : ""}`
                  : "Create Project"}
          </Button>
        </div>

        {!isConnected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-red-800">
              🔒 <strong>Wallet connection required</strong> - All projects are
              stored on blockchain with IPFS metadata. Please connect your
              wallet to create projects.
            </p>
          </div>
        )}

        {form.watch("hackathonIds")?.length > 0 && isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-green-800">
              ✅ <strong>Ready for creation and submission!</strong> Your
              project will be created and submitted to{" "}
              {form.watch("hackathonIds")?.length} hackathon
              {form.watch("hackathonIds")?.length > 1 ? "s" : ""} on blockchain.
            </p>
          </div>
        )}

        {(!form.watch("hackathonIds") ||
          form.watch("hackathonIds")?.length === 0) &&
          isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Create project independently</strong> - Your project
                will be created on blockchain. You can submit it to hackathons
                later from your projects dashboard.
              </p>
            </div>
          )}
      </form>
    </Form>
  );
}
