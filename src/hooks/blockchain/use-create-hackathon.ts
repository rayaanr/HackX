"use client";

import { useState } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { useQueryClient } from "@tanstack/react-query";
import { upload } from "thirdweb/storage";
import { useWeb3 } from "@/providers/web3-provider";
import { prepareCreateHackathonTransaction } from "@/lib/helpers/blockchain";
import type { HackathonFormData } from "@/types/hackathon";

interface CreateHackathonResult {
  success: boolean;
  hackathonId?: number;
  cid?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Dedicated hook for creating hackathons with IPFS metadata upload and blockchain transaction
 */
export function useCreateHackathon() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const { contract, client, contractAddress } = useWeb3();

  const createHackathon = async (
    formData: HackathonFormData,
  ): Promise<CreateHackathonResult> => {
    if (!activeAccount) {
      const errorMsg = "Please connect your wallet to create a hackathon.";
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    if (!contractAddress) {
      const errorMsg =
        "Contract not configured. Please check your environment variables.";
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    if (!client) {
      const errorMsg = "Thirdweb client not initialized.";
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    setIsCreating(true);
    setError(null);

    try {
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
          registrationStartDate:
            formData.registrationPeriod?.registrationStartDate?.toISOString() ||
            null,
          registrationEndDate:
            formData.registrationPeriod?.registrationEndDate?.toISOString() ||
            null,
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
        prizeCohorts: formData.prizeCohorts,
        judges: formData.judges,
        schedule: formData.schedule.map((slot) => ({
          ...slot,
          startDateTime: slot.startDateTime.toISOString(),
          endDateTime: slot.endDateTime.toISOString(),
        })),
        createdAt: new Date().toISOString(),
        version: "1.0.0",
        uploadedAt: new Date().toISOString(),
        type: "hackathon-metadata" as const,
      };

      // Step 2: Upload to IPFS using pure Thirdweb function
      const fileName = `hackathon-${formData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;

      const uris = await upload({
        client, // thirdweb client
        files: [
          {
            name: fileName,
            data: metadata,
          },
        ],
      });

      if (!uris || uris.length === 0) {
        throw new Error("Failed to upload metadata to IPFS.");
      }

      const cid = uris.replace("ipfs://", "");

      // Step 3: Prepare and send blockchain transaction
      const transaction = prepareCreateHackathonTransaction(
        contract,
        cid,
        formData,
      );

      return new Promise<CreateHackathonResult>((resolve) => {
        sendTransaction(transaction, {
          onSuccess: (result) => {
            // TODO: Parse transaction logs to get exact hackathon ID
            const hackathonId = Date.now();

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["hackathons"] });

            resolve({
              success: true,
              hackathonId,
              cid,
              transactionHash: result.transactionHash,
            });
          },
          onError: (error) => {
            console.error("❌ Transaction failed:", error);
            const message =
              error instanceof Error ? error.message.toLowerCase() : "";

            let errorMessage: string;
            if (
              message.includes("user denied") ||
              message.includes("rejected")
            ) {
              errorMessage =
                "Transaction was cancelled. Please approve the transaction to create your hackathon.";
            } else if (message.includes("insufficient funds")) {
              errorMessage =
                "Insufficient funds for gas fees. Please add ETH to your wallet and try again.";
            } else if (message.includes("network")) {
              errorMessage =
                "Network error. Please check your internet connection and try again.";
            } else {
              errorMessage = `Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`;
            }

            setError(new Error(errorMessage));
            resolve({
              success: false,
              error: errorMessage,
            });
          },
        });
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(new Error(errorMessage));
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createHackathon,
    isCreating,
    error,
    // Utility methods
    isConnected: !!activeAccount,
    userAddress: activeAccount?.address,
  };
}
