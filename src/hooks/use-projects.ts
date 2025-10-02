"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useSendTransaction,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { waitForReceipt } from "thirdweb";
import { useWeb3 } from "@/providers/web3-provider";
import type { ProjectFormData } from "@/lib/schemas/project-schema";
import type { BlockchainProject } from "@/types/blockchain";
import {
  uploadProjectToIPFS,
  prepareCreateProjectTransaction,
  prepareSubmitProjectToHackathonTransaction,
  extractProjectIdFromReceipt,
  getUserProjectsWithDetails,
  getProjectById,
  getProjectTeamMembers,
} from "@/lib/helpers/blockchain";
import { toast } from "sonner";

/**
 * Unified hook for all project blockchain operations
 * Uses blockchain helper functions and provides React Query integration
 */
export function useBlockchainProjects() {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const { contract, client, contractAddress } = useWeb3();

  // Get total projects count from blockchain
  const { data: totalProjects = 0 } = useReadContract({
    contract,
    method: "function getTotalProjects() view returns (uint256)",
    queryOptions: {
      enabled: !!contract,
    },
  });

  // Get user's projects with full details from blockchain
  const {
    data: userProjects = [],
    isLoading: isLoadingUserProjects,
    error: userProjectsError,
    refetch: refetchUserProjects,
  } = useQuery({
    queryKey: ["blockchain-user-projects-detailed", activeAccount?.address],
    queryFn: async () => {
      console.log("� Fetching user projects with details...", {
        contract: !!contract,
        client: !!client,
        activeAccount: activeAccount?.address,
        contractAddress,
      });

      if (!contract || !client || !activeAccount?.address) {
        console.log("⚠️ Missing requirements for projects fetch");
        return [];
      }

      try {
        const projects = await getUserProjectsWithDetails(
          contract,
          client,
          activeAccount.address,
        );
        console.log("✅ Fetched user projects with details:", projects);
        return projects;
      } catch (error) {
        console.error("❌ Failed to fetch user projects with details:", error);
        return [];
      }
    },
    enabled: !!contract && !!client && !!activeAccount?.address,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Submit project to blockchain mutation
  const submitProjectMutation = useMutation({
    mutationFn: async ({
      projectData,
      hackathonId,
    }: {
      projectData: ProjectFormData;
      hackathonId: string;
    }) => {
      if (!activeAccount) {
        throw new Error("Please connect your wallet to submit a project.");
      }

      if (!contractAddress) {
        throw new Error(
          "Contract not configured. Please check your environment variables.",
        );
      }

      console.log("🚀 Submitting project to blockchain...");

      // Step 1: Upload to IPFS using helper function
      console.log("📁 Uploading project metadata to IPFS...");
      const { cid } = await uploadProjectToIPFS(client, projectData);
      console.log("✅ Metadata uploaded:", { cid });

      // Step 2: Create the project on blockchain using helper function
      const createProjectTransaction = prepareCreateProjectTransaction(
        contract,
        cid,
      );
      console.log("🔗 Create project transaction prepared");

      return new Promise<{
        projectId: number;
        ipfsHash: string;
        transactionHash: string;
      }>((resolve, reject) => {
        sendTransaction(createProjectTransaction, {
          onSuccess: async (createResult) => {
            console.log("🎉 Project created successfully!");
            console.log(
              "Create transaction hash:",
              createResult.transactionHash,
            );

            try {
              // Wait for the transaction receipt
              const receipt = await waitForReceipt(createResult);
              console.log("📋 Transaction receipt:", receipt);

              // Extract project ID using helper function
              let projectId = extractProjectIdFromReceipt(receipt);
              if (!projectId) {
                console.warn(
                  "⚠️ Could not extract project ID from receipt, using fallback",
                );
                projectId = Date.now();
              } else {
                console.log("✅ Extracted project ID from receipt:", projectId);
              }

              resolve({
                projectId,
                ipfsHash: cid,
                transactionHash: createResult.transactionHash,
              });
            } catch (receiptError) {
              console.warn(
                "⚠️ Could not get transaction receipt:",
                receiptError,
              );

              // Fallback
              const projectId = Date.now();
              resolve({
                projectId,
                ipfsHash: cid,
                transactionHash: createResult.transactionHash,
              });
            }
          },
          onError: (error) => {
            console.error("❌ Transaction failed:", error);
            const message =
              error instanceof Error ? error.message.toLowerCase() : "";

            if (
              message.includes("user denied") ||
              message.includes("rejected")
            ) {
              reject(
                new Error(
                  "Transaction was cancelled. Please approve the transaction to submit your project.",
                ),
              );
            } else if (message.includes("insufficient funds")) {
              reject(
                new Error(
                  "Insufficient funds for gas fees. Please add ETH to your wallet and try again.",
                ),
              );
            } else if (message.includes("network")) {
              reject(
                new Error(
                  "Network error. Please check your internet connection and try again.",
                ),
              );
            } else {
              reject(
                new Error(
                  `Transaction failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                ),
              );
            }
          },
        });
      });
    },
    onSuccess: (data) => {
      console.log("🎉 Project submitted successfully!", data);
      // Invalidate and refetch user projects
      queryClient.invalidateQueries({ queryKey: ["blockchain-user-projects"] });
      queryClient.invalidateQueries({
        queryKey: ["blockchain-user-projects-detailed"],
      });
    },
    onError: (error) => {
      console.error("❌ Project submission failed:", error);
    },
  });

  // Submit existing project to hackathon mutation
  const submitToHackathonMutation = useMutation({
    mutationFn: async ({
      projectId,
      hackathonId,
    }: {
      projectId: string | number;
      hackathonId: string | number;
    }) => {
      if (!activeAccount) {
        throw new Error("Please connect your wallet to submit to hackathon.");
      }

      if (!contractAddress) {
        throw new Error(
          "Contract not configured. Please check your environment variables.",
        );
      }

      console.log(
        `🚀 Submitting project ${projectId} to hackathon ${hackathonId}...`,
      );

      // Use helper function to prepare transaction
      const submitToHackathonTransaction =
        prepareSubmitProjectToHackathonTransaction(
          contract,
          hackathonId,
          projectId,
        );

      return new Promise<{
        projectId: string | number;
        hackathonId: string | number;
        transactionHash: string;
      }>((resolve, reject) => {
        sendTransaction(submitToHackathonTransaction, {
          onSuccess: (result) => {
            console.log("🎉 Project submitted to hackathon successfully!");
            console.log("Transaction hash:", result.transactionHash);

            resolve({
              projectId,
              hackathonId,
              transactionHash: result.transactionHash,
            });
          },
          onError: (error) => {
            console.error("❌ Hackathon submission failed:", error);
            const message =
              error instanceof Error ? error.message.toLowerCase() : "";

            if (
              message.includes("user denied") ||
              message.includes("rejected")
            ) {
              reject(
                new Error(
                  "Transaction was cancelled. Please approve the transaction to submit to hackathon.",
                ),
              );
            } else if (message.includes("insufficient funds")) {
              reject(
                new Error(
                  "Insufficient funds for gas fees. Please add ETH to your wallet and try again.",
                ),
              );
            } else if (message.includes("network")) {
              reject(
                new Error(
                  "Network error. Please check your internet connection and try again.",
                ),
              );
            } else {
              reject(
                new Error(
                  `Hackathon submission failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                ),
              );
            }
          },
        });
      });
    },
    onSuccess: (data) => {
      console.log("🎉 Project submitted to hackathon successfully!", data);
      toast.success("Project submitted to hackathon successfully!", {
        id: "submit-to-hackathon",
      });
      // Invalidate and refetch user projects
      queryClient.invalidateQueries({ queryKey: ["blockchain-user-projects"] });
      queryClient.invalidateQueries({
        queryKey: ["blockchain-user-projects-detailed"],
      });
    },
    onError: (error) => {
      console.error("❌ Hackathon submission failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit project",
        { id: "submit-to-hackathon" },
      );
    },
  });

  // Fetch single project by blockchain ID
  const fetchProject = (projectId: string | number) =>
    useQuery({
      queryKey: ["blockchain-project", projectId],
      queryFn: async () => {
        if (!contract || !client) return null;
        try {
          return await getProjectById(contract, client, projectId);
        } catch (error) {
          console.error(`Failed to fetch project ${projectId}:`, error);
          throw error;
        }
      },
      enabled: !!contract && !!client && !!projectId,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    });

  return {
    // Data
    totalProjects: Number(totalProjects),
    userProjects,

    // Loading states
    isLoadingUserProjects,
    isSubmittingProject: submitProjectMutation.isPending,
    isSubmittingToHackathon: submitToHackathonMutation.isPending,

    // Error states
    userProjectsError,
    submitProjectError: submitProjectMutation.error,
    submitToHackathonError: submitToHackathonMutation.error,

    // Actions
    submitProject: submitProjectMutation.mutate,
    submitToHackathon: submitToHackathonMutation.mutate,
    refetchUserProjects,
    fetchProject,

    // Utils
    isConnected: !!activeAccount,
    userAddress: activeAccount?.address,
  };
}

/**
 * Hook for fetching a single project by blockchain ID
 * Uses the helper function from blockchain.ts
 */
export function useBlockchainProject(projectId: string | number) {
  const { contract, client } = useWeb3();

  return useQuery<BlockchainProject | null>({
    queryKey: ["blockchain-project", projectId],
    queryFn: async () => {
      if (!contract || !client) return null;
      try {
        return await getProjectById(contract, client, projectId);
      } catch (error) {
        console.error(`Failed to fetch project ${projectId}:`, error);
        throw error;
      }
    },
    enabled: !!contract && !!client && !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching project team members by blockchain ID
 */
export function useProjectTeamMembers(projectId: string | number) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["project-team-members", projectId],
    queryFn: async () => {
      if (!contract) return [];
      try {
        return await getProjectTeamMembers(contract, projectId);
      } catch (error) {
        console.error(
          `Failed to fetch team members for project ${projectId}:`,
          error,
        );
        return [];
      }
    },
    enabled: !!contract && !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
