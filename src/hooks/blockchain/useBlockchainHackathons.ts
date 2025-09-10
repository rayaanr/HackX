"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { prepareContractCall, readContract } from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { useWeb3 } from "@/providers/web3-provider";
import { useHackathonIPFSUpload, useIPFSView } from "@/hooks/ipfs/useIPFS";
import { transformBlockchainToUI } from "@/lib/helpers/hackathon-transforms";
import type { HackathonFormData } from "@/types/hackathon";
import type { UIHackathon } from "@/types/hackathon";

// Helper function to upload visual to IPFS if it's a URL
async function uploadVisualToIPFS(
  visual: string | undefined
): Promise<string | null> {
  if (!visual) return null;

  // If it's already an IPFS URI, return as-is
  if (visual.startsWith("ipfs://")) return visual;

  // If it's a URL, upload it to IPFS
  if (visual.startsWith("http")) {
    try {
      console.log("Uploading visual to IPFS:", visual);
      const response = await fetch("/api/ipfs/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: visual,
          keyValues: {
            type: "hackathon-visual",
            originalUrl: visual,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Visual uploaded to IPFS:", result.ipfsUri);
        return result.ipfsUri;
      } else {
        console.error("Failed to upload visual to IPFS");
        return visual; // Fall back to original URL
      }
    } catch (error) {
      console.error("Error uploading visual to IPFS:", error);
      return visual; // Fall back to original URL
    }
  }

  return visual;
}

// Helper function to convert form data to IPFS metadata
async function formatHackathonMetadata(formData: HackathonFormData) {
  // Upload visual to IPFS if needed
  const visualUri = await uploadVisualToIPFS(formData.visual);

  return {
    name: formData.name,
    shortDescription: formData.shortDescription,
    fullDescription: formData.fullDescription,
    location: formData.location,
    visual: visualUri,
    techStack: formData.techStack,
    experienceLevel: formData.experienceLevel,
    socialLinks: formData.socialLinks || {},
    registrationPeriod: {
      registrationStartDate:
        formData.registrationPeriod?.registrationStartDate?.toISOString() ||
        null,
      registrationEndDate:
        formData.registrationPeriod?.registrationEndDate?.toISOString() || null,
    },
    hackathonPeriod: {
      hackathonStartDate:
        formData.hackathonPeriod?.hackathonStartDate?.toISOString() || null,
      hackathonEndDate:
        formData.hackathonPeriod?.hackathonEndDate?.toISOString() || null,
    },
    votingPeriod: {
      votingStartDate:
        formData.votingPeriod?.votingStartDate?.toISOString() || null,
      votingEndDate:
        formData.votingPeriod?.votingEndDate?.toISOString() || null,
    },
    prizeCohorts: formData.prizeCohorts.map((cohort) => ({
      name: cohort.name,
      numberOfWinners: cohort.numberOfWinners,
      prizeAmount: cohort.prizeAmount,
      description: cohort.description,
      judgingMode: cohort.judgingMode,
      votingMode: cohort.votingMode,
      maxVotesPerJudge: cohort.maxVotesPerJudge,
      evaluationCriteria: cohort.evaluationCriteria.map((criteria) => ({
        name: criteria.name,
        points: criteria.points,
        description: criteria.description,
      })),
    })),
    judges: formData.judges.map((judge) => ({
      email: judge.email,
      status: judge.status,
    })),
    schedule: formData.schedule.map((slot) => ({
      name: slot.name,
      description: slot.description,
      startDateTime: slot.startDateTime.toISOString(),
      endDateTime: slot.endDateTime.toISOString(),
      hasSpeaker: slot.hasSpeaker || false,
      speaker: slot.speaker
        ? {
            name: slot.speaker.name,
            position: slot.speaker.position || null,
            xName: slot.speaker.xName || null,
            xHandle: slot.speaker.xHandle || null,
            picture: slot.speaker.picture || null,
          }
        : null,
    })),
    createdAt: new Date().toISOString(),
    version: "1.0.0", // Metadata version for future compatibility
  };
}

// Helper function to convert dates to Unix timestamps
function dateToUnixTimestamp(date?: Date): number {
  return date ? Math.floor(date.getTime() / 1000) : 0;
}

// Helper function to fetch hackathons from blockchain
async function fetchBlockchainHackathons(contract: any) {
  try {
    console.log("Fetching hackathons from blockchain...");

    // Get the total number of hackathons
    const totalHackathons = await readContract({
      contract,
      method: "function getTotalHackathons() view returns (uint256)",
    });

    console.log("Total hackathons:", totalHackathons.toString());

    if (totalHackathons === BigInt(0)) {
      return [];
    }

    // Fetch all hackathons
    const hackathons = [];
    for (let i = BigInt(1); i <= totalHackathons; i++) {
      try {
        const hackathon = await readContract({
          contract,
          method:
            "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint8 currentPhase, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, bool isActive))",
          params: [i],
        });

        // Get participant count
        let participantCount = 0;
        try {
          const participants = await readContract({
            contract,
            method:
              "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
            params: [i],
          });
          participantCount = participants.length;
        } catch (participantError) {
          console.warn(
            `Could not fetch participants for hackathon ${i}:`,
            participantError
          );
        }

        // Get project count
        let projectCount = 0;
        try {
          const projects = await readContract({
            contract,
            method:
              "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
            params: [i],
          });
          projectCount = projects.length;
        } catch (projectError) {
          console.warn(
            `Could not fetch projects for hackathon ${i}:`,
            projectError
          );
        }

        console.log(
          `Hackathon ${i}:`,
          hackathon,
          `Participants: ${participantCount}, Projects: ${projectCount}`
        );

        // Add the counts to the hackathon object
        const hackathonWithCounts = {
          ...hackathon,
          participantCount,
          projectCount,
        };

        hackathons.push(hackathonWithCounts);
      } catch (hackathonError) {
        console.error(`Error fetching hackathon ${i}:`, hackathonError);
        // Continue with other hackathons
      }
    }

    return hackathons;
  } catch (error) {
    console.error("Error fetching hackathons from blockchain:", error);
    throw new Error("Failed to fetch hackathons from blockchain");
  }
}

// Hook for fetching hackathons with IPFS metadata
export function useAllBlockchainHackathons() {
  const { contract } = useWeb3();
  const viewIPFS = useIPFSView();

  return useQuery({
    queryKey: ["hackathons", "blockchain", "all"],
    queryFn: async () => {
      // First fetch blockchain data
      const blockchainHackathons = await fetchBlockchainHackathons(contract);

      // Then fetch IPFS metadata for each hackathon
      const hackathonsWithMetadata = [];

      for (const hackathon of blockchainHackathons) {
        try {
          console.log(
            `Fetching IPFS metadata for hackathon ${hackathon.id}: ${hackathon.ipfsHash}`
          );

          // Fetch IPFS metadata
          const ipfsData = await viewIPFS.mutateAsync(
            `ipfs://${hackathon.ipfsHash}`
          );

          // Combine blockchain data with IPFS metadata
          const combinedHackathon = {
            id: hackathon.id.toString(),
            // Blockchain fields
            organizer: hackathon.organizer,
            currentPhase: hackathon.currentPhase,
            registrationDeadline: hackathon.registrationDeadline,
            submissionDeadline: hackathon.submissionDeadline,
            judgingDeadline: hackathon.judgingDeadline,
            isActive: hackathon.isActive,
            active: hackathon.isActive, // Backward compatibility
            participantCount: hackathon.participantCount,
            projectCount: hackathon.projectCount,
            ipfsHash: hackathon.ipfsHash,
            // IPFS metadata fields
            ...ipfsData.data,
          };

          hackathonsWithMetadata.push(combinedHackathon);
        } catch (error) {
          console.error(
            `Failed to fetch IPFS metadata for hackathon ${hackathon.id}:`,
            error
          );

          // Still include the hackathon with just blockchain data
          hackathonsWithMetadata.push({
            id: hackathon.id.toString(),
            organizer: hackathon.organizer,
            currentPhase: hackathon.currentPhase,
            registrationDeadline: hackathon.registrationDeadline,
            submissionDeadline: hackathon.submissionDeadline,
            judgingDeadline: hackathon.judgingDeadline,
            isActive: hackathon.isActive,
            active: hackathon.isActive, // Backward compatibility
            participantCount: hackathon.participantCount,
            projectCount: hackathon.projectCount,
            ipfsHash: hackathon.ipfsHash,
            name: `Hackathon #${hackathon.id}`, // Fallback name
            shortDescription: "Metadata unavailable",
            error: "Failed to load metadata",
          });
        }
      }

      return hackathonsWithMetadata;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount) => failureCount < 2,
    enabled: !!contract, // Only run when contract is available
  });
}

// Hook for fetching hackathons in UI format with filtering capabilities
export function useUIBlockchainHackathons() {
  const { contract } = useWeb3();
  const viewIPFS = useIPFSView();

  return useQuery({
    queryKey: ["hackathons", "blockchain", "ui"],
    queryFn: async (): Promise<{
      allHackathons: UIHackathon[];
      liveHackathons: UIHackathon[];
      pastHackathons: UIHackathon[];
    }> => {
      console.log("Fetching hackathons for UI...");

      // Step 1: Fetch all hackathon basic data in parallel
      const totalHackathons = await readContract({
        contract,
        method: "function getTotalHackathons() view returns (uint256)",
      });

      if (totalHackathons === BigInt(0)) {
        return { allHackathons: [], liveHackathons: [], pastHackathons: [] };
      }

      // Step 2: Fetch all hackathon data, participants, and projects in parallel
      const hackathonPromises = [];
      for (let i = BigInt(1); i <= totalHackathons; i++) {
        hackathonPromises.push(
          Promise.all([
            // Fetch hackathon basic data
            readContract({
              contract,
              method:
                "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint8 currentPhase, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, bool isActive))",
              params: [i],
            }),
            // Fetch participants count
            readContract({
              contract,
              method:
                "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
              params: [i],
            }).catch(() => []), // Return empty array on error
            // Fetch projects count
            readContract({
              contract,
              method:
                "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
              params: [i],
            }).catch(() => []), // Return empty array on error
          ])
        );
      }

      const allHackathonData = await Promise.all(hackathonPromises);

      // Step 3: Fetch IPFS metadata in parallel
      const ipfsPromises = allHackathonData.map(([hackathon]) =>
        viewIPFS.mutateAsync(`ipfs://${hackathon.ipfsHash}`).catch((error) => {
          console.error(
            `Failed to fetch IPFS metadata for hackathon ${hackathon.id}:`,
            error
          );
          return { data: {} }; // Return empty data on error
        })
      );

      const ipfsResults = await Promise.all(ipfsPromises);

      // Step 4: Combine all data and transform to UI format
      const combinedHackathons = allHackathonData.map(
        ([hackathon, participants, projects], index) => {
          const ipfsData = ipfsResults[index];

          const blockchainHackathon = {
            ...hackathon,
            participantCount: participants.length,
            projectCount: projects.length,
            active: hackathon.isActive,
            ...ipfsData.data,
          };

          return transformBlockchainToUI(blockchainHackathon);
        }
      );

      // Step 5: Filter hackathons into categories
      const now = new Date();

      const liveHackathons = combinedHackathons.filter((hackathon) => {
        const registrationEnd =
          hackathon.registrationPeriod.registrationEndDate;
        const votingEnd = hackathon.votingPeriod?.votingEndDate;

        // Live if registration hasn't ended or voting hasn't ended
        return (
          (registrationEnd && registrationEnd > now) ||
          (votingEnd && votingEnd > now)
        );
      });

      const pastHackathons = combinedHackathons.filter((hackathon) => {
        const votingEnd = hackathon.votingPeriod?.votingEndDate;
        const hackathonEnd = hackathon.hackathonPeriod.hackathonEndDate;

        // Past if voting has ended or hackathon has ended (whichever is later)
        const endDate = votingEnd || hackathonEnd;
        return endDate && endDate <= now;
      });

      console.log(
        `Processed ${combinedHackathons.length} hackathons: ${liveHackathons.length} live, ${pastHackathons.length} past`
      );

      return {
        allHackathons: combinedHackathons,
        liveHackathons,
        pastHackathons,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount) => failureCount < 2,
    enabled: !!contract, // Only run when contract is available
  });
}

// Hook for fetching a single hackathon by ID from blockchain
export function useBlockchainHackathonById(hackathonId: string) {
  const { contract } = useWeb3();
  const viewIPFS = useIPFSView();

  return useQuery({
    queryKey: ["hackathon", "blockchain", hackathonId],
    queryFn: async (): Promise<UIHackathon | null> => {
      if (!hackathonId || hackathonId === "0") {
        throw new Error("Invalid hackathon ID");
      }

      console.log(`Fetching hackathon ${hackathonId} from blockchain...`);

      try {
        // Fetch hackathon basic data
        const hackathon = await readContract({
          contract,
          method:
            "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint8 currentPhase, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, bool isActive))",
          params: [BigInt(hackathonId)],
        });

        // Fetch participants count
        let participantCount = 0;
        try {
          const participants = await readContract({
            contract,
            method:
              "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
            params: [BigInt(hackathonId)],
          });
          participantCount = participants.length;
        } catch (participantError) {
          console.warn(
            `Could not fetch participants for hackathon ${hackathonId}:`,
            participantError
          );
        }

        // Fetch project count
        let projectCount = 0;
        try {
          const projects = await readContract({
            contract,
            method:
              "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
            params: [BigInt(hackathonId)],
          });
          projectCount = projects.length;
        } catch (projectError) {
          console.warn(
            `Could not fetch projects for hackathon ${hackathonId}:`,
            projectError
          );
        }

        // Fetch IPFS metadata
        let ipfsData = { data: {} };
        try {
          ipfsData = await viewIPFS.mutateAsync(`ipfs://${hackathon.ipfsHash}`);
        } catch (error) {
          console.error(
            `Failed to fetch IPFS metadata for hackathon ${hackathonId}:`,
            error
          );
        }

        // Combine all data
        const blockchainHackathon = {
          ...hackathon,
          participantCount,
          projectCount,
          active: hackathon.isActive,
          ...ipfsData.data,
        };

        console.log(
          `Successfully fetched hackathon ${hackathonId}:`,
          blockchainHackathon
        );

        return transformBlockchainToUI(blockchainHackathon);
      } catch (error) {
        console.error(`Error fetching hackathon ${hackathonId}:`, error);
        throw new Error(
          `Failed to fetch hackathon: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount) => failureCount < 2,
    enabled: !!contract && !!hackathonId && hackathonId !== "0", // Only run when contract and valid ID are available
  });
}

// Hook for fetching participants of a hackathon
export function useHackathonParticipants(hackathonId: string) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["hackathon", "participants", hackathonId],
    queryFn: async (): Promise<string[]> => {
      if (!hackathonId || hackathonId === "0") {
        throw new Error("Invalid hackathon ID");
      }

      console.log(`Fetching participants for hackathon ${hackathonId}...`);

      try {
        const participants = await readContract({
          contract,
          method:
            "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
          params: [BigInt(hackathonId)],
        });

        console.log(
          `Found ${participants.length} participants for hackathon ${hackathonId}`
        );
        return [...participants]; // Convert readonly array to mutable array
      } catch (error) {
        console.error(
          `Error fetching participants for hackathon ${hackathonId}:`,
          error
        );
        throw new Error(
          `Failed to fetch participants: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount) => failureCount < 2,
    enabled: !!contract && !!hackathonId && hackathonId !== "0",
  });
}

// Hook for fetching projects of a hackathon
export function useHackathonProjects(hackathonId: string) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["hackathon", "projects", hackathonId],
    queryFn: async (): Promise<number[]> => {
      if (!hackathonId || hackathonId === "0") {
        throw new Error("Invalid hackathon ID");
      }

      console.log(`Fetching projects for hackathon ${hackathonId}...`);

      try {
        const projects = await readContract({
          contract,
          method:
            "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
          params: [BigInt(hackathonId)],
        });

        console.log(
          `Found ${projects.length} projects for hackathon ${hackathonId}`
        );
        return projects.map((p) => Number(p));
      } catch (error) {
        console.error(
          `Error fetching projects for hackathon ${hackathonId}:`,
          error
        );
        throw new Error(
          `Failed to fetch projects: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount) => failureCount < 2,
    enabled: !!contract && !!hackathonId && hackathonId !== "0",
  });
}

// Custom hook for creating hackathons using blockchain
export function useCreateHackathon() {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const { contract, contractAddress } = useWeb3();
  const { uploadHackathonMetadata } = useHackathonIPFSUpload();

  const createHackathon = async (formData: HackathonFormData) => {
    if (!activeAccount) {
      throw new Error(
        "Wallet not connected. Please connect your wallet to create a hackathon."
      );
    }

    if (!contractAddress) {
      throw new Error(
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables."
      );
    }

    console.log("Uploading hackathon metadata to IPFS...");

    // Step 1: Upload metadata to IPFS using the specialized hook
    const metadata = await formatHackathonMetadata(formData);
    const ipfsResponse = await uploadHackathonMetadata(metadata, formData.name);

    console.log("IPFS upload successful:", ipfsResponse);

    // Step 2: Prepare contract transaction
    const registrationDeadline = dateToUnixTimestamp(
      formData.registrationPeriod?.registrationEndDate
    );
    const submissionDeadline = dateToUnixTimestamp(
      formData.hackathonPeriod?.hackathonEndDate
    );
    const judgingDeadline = dateToUnixTimestamp(
      formData.votingPeriod?.votingEndDate
    );

    console.log("Preparing contract transaction...", {
      ipfsHash: ipfsResponse.cid,
      registrationDeadline,
      submissionDeadline,
      judgingDeadline,
      contractAddress,
    });

    // Prepare the contract call using context contract
    const transaction = prepareContractCall({
      contract,
      method:
        "function createHackathon(string ipfsHash, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline) returns (uint256)",
      params: [
        ipfsResponse.cid, // ipfsHash
        BigInt(registrationDeadline), // registrationDeadline
        BigInt(submissionDeadline), // submissionDeadline
        BigInt(judgingDeadline), // judgingDeadline
      ],
    });

    console.log("Sending transaction...");

    // Step 3: Send transaction using thirdweb hook
    return new Promise<{
      hackathonId: number;
      ipfsHash: string;
      transactionHash: string;
    }>((resolve, reject) => {
      sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("Transaction sent:", result.transactionHash);

          // Parse the transaction receipt to get the hackathon ID
          // Note: In a real implementation, you'd want to parse the transaction logs
          // to get the exact hackathon ID from the HackathonCreated event
          const hackathonId = Date.now(); // This should be replaced with actual event log parsing

          resolve({
            hackathonId,
            ipfsHash: ipfsResponse.cid,
            transactionHash: result.transactionHash,
          });
        },
        onError: (error) => {
          console.error("Transaction failed:", error);

          // Provide more specific error messages
          if (error instanceof Error) {
            if (error.message.includes("User denied")) {
              reject(
                new Error(
                  "Transaction was rejected. Please approve the transaction in your wallet to create the hackathon."
                )
              );
              return;
            }
            if (error.message.includes("insufficient funds")) {
              reject(
                new Error(
                  "Insufficient funds to create hackathon. Please ensure you have enough ETH for gas fees."
                )
              );
              return;
            }
          }

          reject(
            new Error(
              error instanceof Error
                ? error.message
                : "Failed to create hackathon. Please try again."
            )
          );
        },
      });
    });
  };

  return useMutation({
    mutationFn: createHackathon,
    onSuccess: (data) => {
      console.log("Hackathon created successfully:", data);

      // Invalidate relevant queries (when we add blockchain data fetching)
      queryClient.invalidateQueries({ queryKey: ["hackathons"] });
    },
    onError: (error) => {
      console.error("Failed to create hackathon:", error);

      // Handle IPFS errors
      if (error instanceof Error && error.message.includes("IPFS")) {
        throw new Error(
          "Failed to upload hackathon metadata to IPFS. Please try again."
        );
      }
    },
  });
}
