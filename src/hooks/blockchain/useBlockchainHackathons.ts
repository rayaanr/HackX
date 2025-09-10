"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { useWeb3 } from "@/providers/web3-provider";
import { useHackathonIPFSUpload } from "@/hooks/ipfs/useIPFS";
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