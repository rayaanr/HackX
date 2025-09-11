"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSendTransaction, useActiveAccount, useReadContract } from "thirdweb/react";
import { readContract } from "thirdweb";
import { useWeb3 } from "@/providers/web3-provider";
import { upload } from "thirdweb/storage";
import {
  dateToUnixTimestamp,
  prepareCreateHackathonTransaction,
  fetchSingleHackathon,
  batchFetchHackathons,
} from "@/lib/helpers/blockchain";
import type { HackathonFormData } from "@/types/hackathon";

/**
 * Unified hook for all hackathon blockchain operations
 * Optimized to use Thirdweb's built-in features and eliminate code duplication
 */
export function useBlockchainHackathons() {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const { contract, client, contractAddress } = useWeb3();

  // Fetch all hackathons with optimized caching
  const {
    data: hackathons = [],
    isLoading: isLoadingHackathons,
    error: hackathonsError,
    refetch: refetchHackathons,
  } = useQuery({
    queryKey: ["hackathons"],
    queryFn: () => batchFetchHackathons(contract, client),
    enabled: !!contract && !!client,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get total hackathons count
  const { data: totalHackathons = 0 } = useReadContract({
    contract,
    method: "function getTotalHackathons() view returns (uint256)",
    queryOptions: {
      enabled: !!contract,
    },
  });

  // Create hackathon mutation with optimized flow
  const createHackathonMutation = useMutation({
    mutationFn: async (formData: HackathonFormData) => {
      if (!activeAccount) {
        throw new Error("Please connect your wallet to create a hackathon.");
      }

      if (!contractAddress) {
        throw new Error("Contract not configured. Please check your environment variables.");
      }

      console.log("=� Creating hackathon with optimized flow...");

      // Step 1: Prepare metadata
      const metadata = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        location: formData.location,
        visual: formData.visual,
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
        prizeCohorts: formData.prizeCohorts,
        judges: formData.judges,
        schedule: formData.schedule.map((slot) => ({
          ...slot,
          startDateTime: slot.startDateTime.toISOString(),
          endDateTime: slot.endDateTime.toISOString(),
        })),
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      };

      // Step 2: Upload to IPFS using Thirdweb
      console.log("=� Uploading metadata to IPFS...");
      const fileName = `hackathon-${formData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
      
      const uris = await upload({
        client,
        files: [{
          name: fileName,
          data: metadata,
        }],
      });

      const ipfsUri = uris[0];
      const cid = ipfsUri.replace("ipfs://", "");
      console.log(" Metadata uploaded:", { uri: ipfsUri, cid });

      // Step 3: Prepare and send transaction
      const transaction = prepareCreateHackathonTransaction(contract, cid, formData);
      console.log("= Contract transaction prepared");

      return new Promise<{
        hackathonId: number;
        ipfsHash: string;
        transactionHash: string;
        metadataUri: string;
      }>((resolve, reject) => {
        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("<� Hackathon creation successful!");
            console.log("Transaction hash:", result.transactionHash);

            // TODO: Parse transaction logs to get exact hackathon ID
            const hackathonId = Date.now();

            resolve({
              hackathonId,
              ipfsHash: cid,
              transactionHash: result.transactionHash,
              metadataUri: ipfsUri,
            });
          },
          onError: (error) => {
            console.error("L Transaction failed:", error);
            const message = error instanceof Error ? error.message.toLowerCase() : "";
            
            if (message.includes("user denied") || message.includes("rejected")) {
              reject(new Error("Transaction was cancelled. Please approve the transaction to create your hackathon."));
            } else if (message.includes("insufficient funds")) {
              reject(new Error("Insufficient funds for gas fees. Please add ETH to your wallet and try again."));
            } else if (message.includes("network")) {
              reject(new Error("Network error. Please check your internet connection and try again."));
            } else {
              reject(new Error(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`));
            }
          },
        });
      });
    },
    onSuccess: (data) => {
      console.log("<� Hackathon created successfully!", data);
      queryClient.invalidateQueries({ queryKey: ["hackathons"] });
    },
    onError: (error) => {
      console.error("=� Hackathon creation failed:", error);
    },
  });

  // Fetch single hackathon by ID
  const fetchHackathon = (hackathonId: string | number) =>
    useQuery({
      queryKey: ["hackathon", hackathonId],
      queryFn: () => fetchSingleHackathon(contract, client, hackathonId),
      enabled: !!contract && !!client && !!hackathonId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

  return {
    // Data
    hackathons,
    totalHackathons: Number(totalHackathons),
    
    // Loading states
    isLoadingHackathons,
    isCreatingHackathon: createHackathonMutation.isPending,
    
    // Error states
    hackathonsError,
    createHackathonError: createHackathonMutation.error,
    
    // Actions
    createHackathon: createHackathonMutation.mutate,
    refetchHackathons,
    fetchHackathon,
    
    // Utils
    isConnected: !!activeAccount,
    userAddress: activeAccount?.address,
  };
}

/**
 * Hook for fetching a single hackathon by ID
 */
export function useHackathon(hackathonId: string | number) {
  const { contract, client } = useWeb3();
  
  return useQuery({
    queryKey: ["hackathon", hackathonId],
    queryFn: () => fetchSingleHackathon(contract, client, hackathonId),
    enabled: !!contract && !!client && !!hackathonId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Legacy exports for backward compatibility
export const useCreateHackathon = () => {
  const { createHackathon, isCreatingHackathon, createHackathonError } = useBlockchainHackathons();
  return { 
    mutate: createHackathon, 
    isPending: isCreatingHackathon, 
    error: createHackathonError 
  };
};

export const useUIBlockchainHackathons = useBlockchainHackathons;
export const useBlockchainHackathonById = useHackathon;

// Additional hooks for participants and projects
export function useHackathonParticipants(hackathonId: string | number) {
  const { contract } = useWeb3();
  
  return useQuery({
    queryKey: ["hackathon-participants", hackathonId],
    queryFn: async () => {
      if (!contract) return [];
      try {
        const participants = await readContract({
          contract,
          method: "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
          params: [BigInt(hackathonId)],
        });
        // Convert any BigInt values to strings to avoid serialization issues
        return (participants || []).map((p: any) => typeof p === 'bigint' ? p.toString() : p);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
        return [];
      }
    },
    enabled: !!contract && !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useHackathonProjects(hackathonId: string | number) {
  const { contract } = useWeb3();
  
  return useQuery({
    queryKey: ["hackathon-projects", hackathonId],
    queryFn: async () => {
      if (!contract) return [];
      try {
        const projects = await readContract({
          contract,
          method: "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
          params: [BigInt(hackathonId)],
        });
        // Convert BigInt values to numbers to avoid serialization issues
        return (projects || []).map((p: any) => typeof p === 'bigint' ? Number(p) : p);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        return [];
      }
    },
    enabled: !!contract && !!hackathonId,
    staleTime: 2 * 60 * 1000,
  });
}
