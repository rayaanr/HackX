"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { prepareContractCall, readContract } from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { useWeb3 } from "@/providers/web3-provider";
import { useHackathonIPFSUpload, useIPFSView } from "@/hooks/ipfs/useIPFS";
import type { HackathonFormData } from "@/types/hackathon";

// Helper function to convert form data to IPFS metadata
function formatHackathonMetadata(formData: HackathonFormData) {
  return {
    name: formData.name,
    shortDescription: formData.shortDescription,
    fullDescription: formData.fullDescription,
    location: formData.location,
    visual: formData.visual || null,
    techStack: formData.techStack,
    experienceLevel: formData.experienceLevel,
    socialLinks: formData.socialLinks || {},
    registrationPeriod: {
      registrationStartDate: formData.registrationPeriod?.registrationStartDate?.toISOString() || null,
      registrationEndDate: formData.registrationPeriod?.registrationEndDate?.toISOString() || null,
    },
    hackathonPeriod: {
      hackathonStartDate: formData.hackathonPeriod?.hackathonStartDate?.toISOString() || null,
      hackathonEndDate: formData.hackathonPeriod?.hackathonEndDate?.toISOString() || null,
    },
    votingPeriod: {
      votingStartDate: formData.votingPeriod?.votingStartDate?.toISOString() || null,
      votingEndDate: formData.votingPeriod?.votingEndDate?.toISOString() || null,
    },
    prizeCohorts: formData.prizeCohorts.map(cohort => ({
      name: cohort.name,
      numberOfWinners: cohort.numberOfWinners,
      prizeAmount: cohort.prizeAmount,
      description: cohort.description,
      judgingMode: cohort.judgingMode,
      votingMode: cohort.votingMode,
      maxVotesPerJudge: cohort.maxVotesPerJudge,
      evaluationCriteria: cohort.evaluationCriteria.map(criteria => ({
        name: criteria.name,
        points: criteria.points,
        description: criteria.description,
      })),
    })),
    judges: formData.judges.map(judge => ({
      email: judge.email,
      status: judge.status,
    })),
    schedule: formData.schedule.map(slot => ({
      name: slot.name,
      description: slot.description,
      startDateTime: slot.startDateTime.toISOString(),
      endDateTime: slot.endDateTime.toISOString(),
      hasSpeaker: slot.hasSpeaker || false,
      speaker: slot.speaker ? {
        name: slot.speaker.name,
        position: slot.speaker.position || null,
        xName: slot.speaker.xName || null,
        xHandle: slot.speaker.xHandle || null,
        picture: slot.speaker.picture || null,
      } : null,
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
    const hackathonCounter = await readContract({
      contract,
      method: "function hackathonCounter() view returns (uint256)",
    });

    console.log("Total hackathons:", hackathonCounter.toString());

    if (hackathonCounter === BigInt(0)) {
      return [];
    }

    // Fetch all hackathons
    const hackathons = [];
    for (let i = BigInt(1); i <= hackathonCounter; i++) {
      try {
        const hackathon = await readContract({
          contract,
          method: "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, uint256 participantCount, uint256 projectCount, bool active))",
          params: [i],
        });

        console.log(`Hackathon ${i}:`, hackathon);
        hackathons.push(hackathon);
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
          console.log(`Fetching IPFS metadata for hackathon ${hackathon.id}: ${hackathon.ipfsHash}`);
          
          // Fetch IPFS metadata
          const ipfsData = await viewIPFS.mutateAsync(`ipfs://${hackathon.ipfsHash}`);
          
          // Combine blockchain data with IPFS metadata
          const combinedHackathon = {
            id: hackathon.id.toString(),
            // Blockchain fields
            organizer: hackathon.organizer,
            registrationDeadline: hackathon.registrationDeadline,
            submissionDeadline: hackathon.submissionDeadline,
            judgingDeadline: hackathon.judgingDeadline,
            participantCount: hackathon.participantCount,
            projectCount: hackathon.projectCount,
            active: hackathon.active,
            ipfsHash: hackathon.ipfsHash,
            // IPFS metadata fields
            ...ipfsData.data,
          };
          
          hackathonsWithMetadata.push(combinedHackathon);
        } catch (error) {
          console.error(`Failed to fetch IPFS metadata for hackathon ${hackathon.id}:`, error);
          
          // Still include the hackathon with just blockchain data
          hackathonsWithMetadata.push({
            id: hackathon.id.toString(),
            organizer: hackathon.organizer,
            registrationDeadline: hackathon.registrationDeadline,
            submissionDeadline: hackathon.submissionDeadline,
            judgingDeadline: hackathon.judgingDeadline,
            participantCount: hackathon.participantCount,
            projectCount: hackathon.projectCount,
            active: hackathon.active,
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

// Custom hook for creating hackathons using blockchain
export function useCreateHackathon() {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const { contract, contractAddress } = useWeb3();
  const { uploadHackathonMetadata } = useHackathonIPFSUpload();

  const createHackathon = async (formData: HackathonFormData) => {
    if (!activeAccount) {
      throw new Error("Wallet not connected. Please connect your wallet to create a hackathon.");
    }

    if (!contractAddress) {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    console.log("Uploading hackathon metadata to IPFS...");
    
    // Step 1: Upload metadata to IPFS using the specialized hook
    const metadata = formatHackathonMetadata(formData);
    const ipfsResponse = await uploadHackathonMetadata(metadata, formData.name);

    console.log("IPFS upload successful:", ipfsResponse);
    
    // Step 2: Prepare contract transaction
    const registrationDeadline = dateToUnixTimestamp(formData.registrationPeriod?.registrationEndDate);
    const submissionDeadline = dateToUnixTimestamp(formData.hackathonPeriod?.hackathonEndDate);
    const judgingDeadline = dateToUnixTimestamp(formData.votingPeriod?.votingEndDate);

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
      method: "function createHackathon(string ipfsHash, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline) returns (uint256)",
      params: [
        ipfsResponse.cid, // ipfsHash
        BigInt(registrationDeadline), // registrationDeadline
        BigInt(submissionDeadline), // submissionDeadline
        BigInt(judgingDeadline), // judgingDeadline
      ],
    });

    console.log("Sending transaction...");
    
    // Step 3: Send transaction using thirdweb hook
    return new Promise<{ hackathonId: number; ipfsHash: string; transactionHash: string }>((resolve, reject) => {
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
              reject(new Error("Transaction was rejected. Please approve the transaction in your wallet to create the hackathon."));
              return;
            }
            if (error.message.includes("insufficient funds")) {
              reject(new Error("Insufficient funds to create hackathon. Please ensure you have enough ETH for gas fees."));
              return;
            }
          }
          
          reject(new Error(
            error instanceof Error ? error.message : "Failed to create hackathon. Please try again."
          ));
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
        throw new Error("Failed to upload hackathon metadata to IPFS. Please try again.");
      }
    },
  });
}