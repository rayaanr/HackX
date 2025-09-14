"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useSendTransaction,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { readContract, prepareContractCall } from "thirdweb";
import { useWeb3 } from "@/providers/web3-provider";
import { upload, download } from "thirdweb/storage";
import type { ProjectFormData } from "@/lib/schemas/project-schema";
import type { UIProject } from "@/types/hackathon";
import { serializeBigInts } from "@/lib/helpers/blockchain";

/**
 * Unified hook for all project blockchain operations
 * Handles IPFS storage and smart contract interactions
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

  // Get user's project IDs from blockchain
  const {
    data: userProjectIds = [],
    isLoading: isLoadingUserProjectIds,
    error: userProjectIdsError,
    refetch: refetchUserProjectIds,
  } = useQuery({
    queryKey: ["blockchain-user-projects", activeAccount?.address],
    queryFn: async () => {
      console.log("🔗 Fetching user project IDs from blockchain...", {
        contract: !!contract,
        activeAccount: activeAccount?.address,
        contractAddress,
      });

      if (!contract || !activeAccount) {
        console.log("⚠️ Missing contract or account for project IDs fetch");
        return [];
      }

      try {
        const projectIds = await readContract({
          contract,
          method:
            "function getUserProjects(address user) view returns (uint256[])",
          params: [activeAccount.address],
        });

        const ids = (projectIds || []).map((id: any) => Number(id));
        console.log("✅ Fetched user project IDs:", ids);
        return ids;
      } catch (error) {
        console.error("❌ Failed to fetch user project IDs:", error);
        return [];
      }
    },
    enabled: !!contract && !!activeAccount?.address,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Batch fetch user's projects from blockchain with metadata
  const {
    data: userProjects = [],
    isLoading: isLoadingUserProjects,
    error: userProjectsError,
    refetch: refetchUserProjects,
  } = useQuery({
    queryKey: ["blockchain-user-projects-detailed", userProjectIds],
    queryFn: async () => {
      console.log("📊 Fetching detailed user projects...", {
        contract: !!contract,
        client: !!client,
        userProjectIds,
      });

      if (!contract || !client || userProjectIds.length === 0) {
        console.log(
          "⚠️ Missing requirements for detailed projects fetch or no project IDs",
        );
        return [];
      }

      try {
        // Batch fetch project data
        const projectPromises = userProjectIds.map(async (projectId) => {
          try {
            const project = await readContract({
              contract,
              method:
                "function getProject(uint256 projectId) view returns ((uint256 id, uint256 hackathonId, string ipfsHash, address creator, bool isSubmitted, uint256 totalScore, uint256 judgeCount))",
              params: [BigInt(projectId)],
            });

            // Fetch metadata from IPFS
            let metadata = {};
            try {
              if (project.ipfsHash) {
                const file = await download({
                  client,
                  uri: `ipfs://${project.ipfsHash}`,
                });
                metadata = await file.json();
              }
            } catch (error) {
              console.warn(
                `Failed to fetch metadata for project ${projectId}:`,
                error,
              );
            }

            return {
              ...serializeBigInts(project),
              ...metadata,
              blockchainId: projectId,
            };
          } catch (error) {
            console.warn(`Failed to fetch project ${projectId}:`, error);
            return null;
          }
        });

        const projects = await Promise.all(projectPromises);
        const filteredProjects = projects.filter(Boolean);
        console.log("✅ Fetched detailed user projects:", filteredProjects);
        return filteredProjects;
      } catch (error) {
        console.error("❌ Failed to fetch user projects:", error);
        return [];
      }
    },
    enabled: !!contract && !!client && userProjectIds.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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

      // Step 1: Prepare metadata for IPFS
      const metadata = {
        name: projectData.name,
        intro: projectData.intro,
        description: projectData.description,
        logo: projectData.logo || null,
        sector: projectData.sector || [],
        progress: projectData.progress,
        fundraisingStatus: projectData.fundraisingStatus,
        githubLink: projectData.githubLink || null,
        demoVideo: projectData.demoVideo || null,
        itchVideo: projectData.itchVideo || null,
        techStack: projectData.techStack || [],
        submittedToHackathons: projectData.hackathonIds || [],
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      };

      // Step 2: Upload to IPFS using Thirdweb
      console.log("📁 Uploading project metadata to IPFS...");
      const fileName = `project-${projectData.name.toLowerCase().replace(/\\s+/g, "-")}-${Date.now()}.json`;

      const uris = await upload({
        client,
        files: [
          {
            name: fileName,
            data: metadata,
          },
        ],
      });

      const ipfsUri = uris[0];
      const cid = ipfsUri.replace("ipfs://", "");
      console.log("✅ Metadata uploaded:", { uri: ipfsUri, cid });

      // Step 3: Prepare blockchain transaction
      const transaction = prepareContractCall({
        contract,
        method:
          "function submitProject(uint256 hackathonId, string projectIpfsHash) returns (uint256)",
        params: [BigInt(hackathonId), cid],
      });

      console.log("🔗 Contract transaction prepared");

      return new Promise<{
        projectId: number;
        ipfsHash: string;
        transactionHash: string;
        metadataUri: string;
      }>((resolve, reject) => {
        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("🎉 Project submission successful!");
            console.log("Transaction hash:", result.transactionHash);

            // TODO: Parse transaction logs to get exact project ID
            const projectId = Date.now();

            resolve({
              projectId,
              ipfsHash: cid,
              transactionHash: result.transactionHash,
              metadataUri: ipfsUri,
            });
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
                  `Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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

  // Fetch single project by blockchain ID
  const fetchProject = (projectId: string | number) =>
    useQuery({
      queryKey: ["blockchain-project", projectId],
      queryFn: async () => {
        if (!contract || !client) return null;
        try {
          const project = await readContract({
            contract,
            method:
              "function getProject(uint256 projectId) view returns ((uint256 id, uint256 hackathonId, string ipfsHash, address creator, bool isSubmitted, uint256 totalScore, uint256 judgeCount))",
            params: [BigInt(projectId)],
          });

          // Fetch metadata from IPFS
          let metadata = {};
          try {
            if (project.ipfsHash) {
              const file = await download({
                client,
                uri: `ipfs://${project.ipfsHash}`,
              });
              metadata = await file.json();
            }
          } catch (error) {
            console.warn(
              `Failed to fetch metadata for project ${projectId}:`,
              error,
            );
          }

          return {
            ...serializeBigInts(project),
            ...metadata,
            blockchainId: Number(projectId),
          };
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
    userProjectIds,
    userProjects,

    // Loading states
    isLoadingUserProjectIds,
    isLoadingUserProjects,
    isSubmittingProject: submitProjectMutation.isPending,

    // Error states
    userProjectIdsError,
    userProjectsError,
    submitProjectError: submitProjectMutation.error,

    // Actions
    submitProject: submitProjectMutation.mutate,
    refetchUserProjectIds,
    refetchUserProjects,
    fetchProject,

    // Utils
    isConnected: !!activeAccount,
    userAddress: activeAccount?.address,
  };
}

/**
 * Hook for fetching a single project by blockchain ID
 */
export function useBlockchainProject(projectId: string | number) {
  const { contract, client } = useWeb3();

  return useQuery({
    queryKey: ["blockchain-project", projectId],
    queryFn: async () => {
      if (!contract || !client) return null;
      try {
        const project = await readContract({
          contract,
          method:
            "function getProject(uint256 projectId) view returns ((uint256 id, uint256 hackathonId, string ipfsHash, address creator, bool isSubmitted, uint256 totalScore, uint256 judgeCount))",
          params: [BigInt(projectId)],
        });

        // Fetch metadata from IPFS
        let metadata = {};
        try {
          if (project.ipfsHash) {
            const file = await download({
              client,
              uri: `ipfs://${project.ipfsHash}`,
            });
            metadata = await file.json();
          }
        } catch (error) {
          console.warn(
            `Failed to fetch metadata for project ${projectId}:`,
            error,
          );
        }

        return {
          ...serializeBigInts(project),
          ...metadata,
          blockchainId: Number(projectId),
        };
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

// Legacy exports for backward compatibility
export const useSubmitProject = () => {
  const { submitProject, isSubmittingProject, submitProjectError } =
    useBlockchainProjects();
  return {
    mutate: submitProject,
    isPending: isSubmittingProject,
    error: submitProjectError,
  };
};

export const useUserBlockchainProjects = () => {
  const {
    userProjects,
    isLoadingUserProjects,
    userProjectsError,
    refetchUserProjects,
  } = useBlockchainProjects();
  return {
    data: userProjects,
    isLoading: isLoadingUserProjects,
    error: userProjectsError,
    refetch: refetchUserProjects,
  };
};
