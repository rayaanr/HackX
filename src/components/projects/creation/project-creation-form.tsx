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
  
  const { submitProject, isConnected } = useBlockchainProjects();

  const form = useForm<ProjectFormData>({
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

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      console.log("🚀 Creating project with data:", data);

      // Only allow blockchain submission if wallet is connected
      if (!isConnected) {
        throw new Error("Please connect your wallet to create and submit projects.");
      }

      // If user has hackathons selected, submit to blockchain
      if (data.hackathonIds.length > 0) {
        let blockchainResults = [];
        
        // Submit to each selected hackathon on blockchain
        for (const hackathonId of data.hackathonIds) {
          try {
            console.log(`📤 Submitting to hackathon ${hackathonId} on blockchain...`);
            const result = await new Promise((resolve, reject) => {
              submitProject({ projectData: data, hackathonId }, {
                onSuccess: resolve,
                onError: reject
              });
            });
            blockchainResults.push({ hackathonId, result, success: true });
            console.log(`✅ Successfully submitted to hackathon ${hackathonId}`);
          } catch (error) {
            console.error(`❌ Failed to submit to hackathon ${hackathonId}:`, error);
            
            // Provide specific error messages for different failure scenarios
            let errorMessage = `Failed to submit to hackathon ${hackathonId}`;
            if (error instanceof Error) {
              if (error.message.includes("Submission phase not active")) {
                errorMessage = `Hackathon ${hackathonId} is not currently accepting submissions. Check the hackathon phase.`;
              } else if (error.message.includes("user denied") || error.message.includes("rejected")) {
                errorMessage = `Transaction cancelled for hackathon ${hackathonId}`;
              } else if (error.message.includes("insufficient funds")) {
                errorMessage = `Insufficient funds for gas fees when submitting to hackathon ${hackathonId}`;
              }
            }
            
            blockchainResults.push({ hackathonId, error: errorMessage, success: false });
          }
        }

        // Check if at least one submission was successful
        const successfulSubmissions = blockchainResults.filter(r => r.success);
        const failedSubmissions = blockchainResults.filter(r => !r.success);
        
        if (successfulSubmissions.length > 0) {
          toast.success(
            `Project submitted to ${successfulSubmissions.length} hackathon(s) on blockchain!`,
            {
              description: `Successfully stored on IPFS and blockchain. ${failedSubmissions.length > 0 ? 
                `${failedSubmissions.length} submission(s) failed.` : ''}`
            }
          );
          
          // Show specific errors for failed submissions
          if (failedSubmissions.length > 0) {
            failedSubmissions.forEach(result => {
              toast.error(`Submission failed`, {
                description: result.error
              });
            });
          }
        } else {
          // Show all specific error messages
          const errorMessages = failedSubmissions.map(r => r.error).join(", ");
          throw new Error(`All blockchain submissions failed: ${errorMessages}`);
        }
      } else {
        throw new Error("Please select at least one hackathon to submit your project to.");
      }

      // Redirect to projects page
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Error submitting project:", error);
      toast.error(
        error instanceof Error ? error.message : "Error creating project. Please try again.",
        { description: "Check console for details" }
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
          <Button type="submit" disabled={isSubmitting || !isConnected || form.watch("hackathonIds")?.length === 0}>
            {isSubmitting ? "Submitting to Blockchain..." : 
             !isConnected ? "Connect Wallet Required" :
             form.watch("hackathonIds")?.length === 0 ? "Select Hackathons" :
             "Submit to Blockchain"}
          </Button>
        </div>

        {!isConnected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-red-800">
              🔒 <strong>Wallet connection required</strong> - All projects are stored on blockchain with IPFS metadata. 
              Please connect your wallet to create and submit projects.
            </p>
          </div>
        )}

        {form.watch("hackathonIds")?.length > 0 && isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-green-800">
              ✅ <strong>Ready for blockchain submission!</strong> Your project will be submitted to {form.watch("hackathonIds")?.length} hackathon(s) 
              on the blockchain with IPFS metadata storage.
            </p>
          </div>
        )}

        {form.watch("hackathonIds")?.length === 0 && isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Select hackathons</strong> to submit your project to. At least one hackathon selection is required.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}
