"use client";

import { useState } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWeb3 } from "@/providers/web3-provider";
import {
  fetchIPFSMetadata,
  getProjectScore,
  prepareSubmitScoreTransaction,
} from "@/lib/helpers/blockchain";
import type { JudgeRatingFormData } from "@/lib/schemas/judge-schema";
import { upload } from "thirdweb/storage";

interface SubmitEvaluationResult {
  success: boolean;
  transactionHash?: string;
  ipfsHash?: string;
  error?: string;
}

/**
 * Dedicated hook for judge functionality including evaluation submission
 */
export function useJudgeEvaluationSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<
    "idle" | "uploading" | "blockchain" | "success"
  >("idle");
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const { contract, client } = useWeb3();

  const calculateTotalScore = (evaluation: JudgeRatingFormData): number => {
    const scores = [
      evaluation.technicalExecution,
      evaluation.innovation,
      evaluation.usability,
      evaluation.marketPotential,
      evaluation.presentation,
    ];
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round((total / scores.length) * 10) / 10; // Average out of 10
  };

  const submitEvaluation = async (
    hackathonId: string | number,
    projectId: string | number,
    evaluation: JudgeRatingFormData,
  ): Promise<SubmitEvaluationResult> => {
    if (!activeAccount?.address) {
      const errorMsg = "Please connect your wallet to submit evaluation.";
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    if (!contract) {
      const errorMsg = "Contract not initialized.";
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    if (!client) {
      const errorMsg = "Thirdweb client not initialized.";
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    }

    setIsSubmitting(true);
    setSubmissionStage("uploading");
    setError(null);

    try {
      const totalScore = calculateTotalScore(evaluation);

      // Prepare feedback data for IPFS upload
      const feedbackData = {
        projectId: Number(projectId),
        judgeAddress: activeAccount.address,
        scores: {
          technicalExecution: evaluation.technicalExecution,
          innovation: evaluation.innovation,
          usability: evaluation.usability,
          marketPotential: evaluation.marketPotential,
          presentation: evaluation.presentation,
        },
        totalScore,
        feedback: {
          overallFeedback: evaluation.overallFeedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
        },
        submittedAt: new Date().toISOString(),
      };

      // Upload feedback to IPFS
      console.log("Uploading feedback to IPFS...");

      const fileName = `judge-feedback-${projectId}-${
        activeAccount.address
      }-${Date.now()}.json`;

      const uris = await upload({
        client,
        files: [
          {
            name: fileName,
            data: JSON.stringify(feedbackData),
          },
        ],
      });

      if (!uris || uris.length === 0) {
        throw new Error("Failed to upload metadata to IPFS.");
      }

      const cid = uris.replace("ipfs://", "");

      console.log("Feedback uploaded to IPFS:", cid);

      // Show IPFS upload success toast
      if (typeof window !== "undefined") {
        const { toast } = await import("sonner");
        toast.success("Uploaded to IPFS", {
          description: "Evaluation feedback uploaded to IPFS successfully!",
          action: {
            label: "View on IPFS",
            onClick: () => {
              const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
              window.open(gatewayUrl, "_blank");
            },
          },
        });
      }

      setSubmissionStage("blockchain");

      // Update toast for blockchain stage (this will update any existing toast with the same id)
      if (typeof window !== "undefined") {
        const { toast } = await import("sonner");
        toast.loading("Submitting evaluation to blockchain...", {
          id: "evaluation-submission",
        });
      }

      // Prepare blockchain transaction
      const transaction = prepareSubmitScoreTransaction(
        contract,
        hackathonId,
        projectId,
        Math.round(totalScore * 10), // Convert to scale of 100 for contract (e.g., 8.5 -> 85)
        cid,
      );

      // Send transaction
      console.log("Submitting score to blockchain...");

      return new Promise((resolve) => {
        sendTransaction(transaction, {
          onSuccess: (result) => {
            console.log("Score submitted successfully:", result);
            setSubmissionStage("success");

            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["hackathon-projects"] });
            queryClient.invalidateQueries({ queryKey: ["project"] });

            // Reset submission stage after a delay
            setTimeout(() => {
              setSubmissionStage("idle");
            }, 2000);

            resolve({
              success: true,
              transactionHash: result.transactionHash,
              ipfsHash: cid,
            });
          },
          onError: (error) => {
            console.error("Blockchain transaction failed:", error);
            setSubmissionStage("idle");
            const errorMsg =
              "Failed to submit evaluation to blockchain. Please try again.";
            setError(new Error(errorMsg));
            resolve({ success: false, error: errorMsg });
          },
        });
      });
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      setSubmissionStage("idle");
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to submit evaluation. Please try again.";
      setError(new Error(errorMsg));
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEvaluationComplete = (evaluation: JudgeRatingFormData): boolean => {
    return (
      evaluation.technicalExecution > 0 &&
      evaluation.innovation > 0 &&
      evaluation.usability > 0 &&
      evaluation.marketPotential > 0 &&
      evaluation.presentation > 0 &&
      evaluation.overallFeedback.trim().length > 0
    );
  };

  const resetSubmissionState = () => {
    setSubmissionStage("idle");
    setError(null);
    setIsSubmitting(false);
  };

  return {
    // State
    isSubmitting,
    submissionStage,
    error,

    // Actions
    submitEvaluation,
    calculateTotalScore,
    isEvaluationComplete,
    resetSubmissionState,
  };
}

/**
 * Hook to get project score for a specific hackathon
 */
export function useProjectScore(
  hackathonId: string | number,
  projectId: string | number,
) {
  const { contract } = useWeb3();

  return useQuery({
    queryKey: ["project-score", hackathonId, projectId],
    queryFn: async () => {
      if (!contract) return null;
      return getProjectScore(contract, hackathonId, projectId);
    },
    enabled: !!contract && !!hackathonId && !!projectId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to check if a judge has already scored a project
 */
export function useHasJudgeScored(
  hackathonId: string | number,
  projectId: string | number,
  judgeAddress?: string,
) {
  const { contract } = useWeb3();
  const activeAccount = useActiveAccount();
  const judge = judgeAddress || activeAccount?.address;

  return useQuery({
    queryKey: ["has-judge-scored", hackathonId, projectId, judge],
    queryFn: async () => {
      if (!contract || !judge) return false;
      const { hasJudgeScored } = await import("@/lib/helpers/blockchain");
      return hasJudgeScored(contract, hackathonId, projectId, judge);
    },
    enabled: !!contract && !!hackathonId && !!projectId && !!judge,
    staleTime: 10 * 1000, // 10 seconds
  });
}

/**
 * Hook to get judge evaluation (feedback) for a project
 */
export function useJudgeEvaluation(
  hackathonId: string | number,
  projectId: string | number,
  judgeAddress?: string,
) {
  const { contract } = useWeb3();
  const activeAccount = useActiveAccount();
  const judge = judgeAddress || activeAccount?.address;

  return useQuery({
    queryKey: ["judge-evaluation", hackathonId, projectId, judge],
    queryFn: async () => {
      if (!contract || !judge) return null;
      const { getJudgeEvaluation } = await import("@/lib/helpers/blockchain");
      return getJudgeEvaluation(contract, hackathonId, projectId, judge);
    },
    enabled: !!contract && !!hackathonId && !!projectId && !!judge,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get and parse judge evaluation data from IPFS
 */
export function useJudgeEvaluationData(
  hackathonId: string | number,
  projectId: string | number,
  judgeAddress?: string,
) {
  const { client } = useWeb3();
  const activeAccount = useActiveAccount();
  const judge = judgeAddress || activeAccount?.address;

  const { data: evaluation } = useJudgeEvaluation(
    hackathonId,
    projectId,
    judge,
  );

  return useQuery({
    queryKey: [
      "judge-evaluation-data",
      hackathonId,
      projectId,
      judge,
      evaluation?.feedbackIpfsHash,
    ],
    queryFn: async () => {
      console.log("useJudgeEvaluationData queryFn called with:", {
        client: !!client,
        evaluation,
        feedbackIpfsHash: evaluation?.feedbackIpfsHash,
      });

      if (!client || !evaluation?.submitted || !evaluation.feedbackIpfsHash) {
        console.log(
          "useJudgeEvaluationData: Missing required data, returning null",
        );
        return null;
      }

      try {
        console.log(
          "Fetching IPFS metadata for hash:",
          evaluation.feedbackIpfsHash,
        );
        const data = await fetchIPFSMetadata(
          client,
          evaluation.feedbackIpfsHash,
        );
        console.log("Raw IPFS data received:", data);

        const typedData = {
          ...(data as {
            projectId: number;
            judgeAddress: string;
            scores: {
              technicalExecution: number;
              innovation: number;
              usability: number;
              marketPotential: number;
              presentation: number;
            };
            totalScore: number;
            feedback: {
              overallFeedback: string;
              strengths?: string;
              improvements?: string;
            };
            submittedAt: string;
          }),
          // Add the IPFS hash to the returned data
          ipfsHash: evaluation.feedbackIpfsHash,
        };

        console.log("Returning typed IPFS data with hash:", typedData);
        return typedData;
      } catch (error) {
        console.error("Failed to fetch evaluation data from IPFS:", error);
        return null;
      }
    },
    enabled:
      !!client && !!evaluation?.submitted && !!evaluation.feedbackIpfsHash,
    staleTime: 60 * 1000, // 1 minute - IPFS data doesn't change
  });
}
