"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import type {
  BlockchainProject,
  ProjectMetadata,
  SubmitProjectResult,
  SubmitScoreResult,
} from "@/types/blockchain";
import { transformProjectUIToMetadata } from "@/lib/helpers/blockchain-transforms";

// Mock blockchain project data - replace with actual contract calls
const MOCK_BLOCKCHAIN_PROJECTS: BlockchainProject[] = [
  {
    id: BigInt(1),
    hackathonId: BigInt(1),
    ipfsHash: "QmSampleHashForProject1",
    creator: "0x1234567890123456789012345678901234567890",
    isSubmitted: true,
    totalScore: BigInt(85),
    judgeCount: BigInt(3),
    metadata: {
      name: "DeFi Portfolio Tracker",
      description:
        "A decentralized application for tracking DeFi investments across multiple protocols",
      techStack: ["React", "Web3", "Solidity", "The Graph"],
      repositoryUrl: "https://github.com/user/defi-tracker",
      demoUrl: "https://defi-tracker.example.com",
      teamMembers: [
        { name: "Alice Developer", role: "Frontend" },
        { name: "Bob Blockchain", role: "Smart Contracts" },
      ],
      createdAt: "2024-12-15T00:00:00Z",
      version: "1.0.0",
      uploadedAt: "2024-12-15T12:00:00Z",
      type: "project-metadata",
    },
    averageScore: 28.3,
  },
];

interface UseBlockchainProjectsResult {
  data: BlockchainProject[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseBlockchainProjectResult {
  data: BlockchainProject | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseSubmitProjectResult {
  submitProject: (
    hackathonId: string,
    projectData: any,
  ) => Promise<SubmitProjectResult>;
  isSubmitting: boolean;
}

interface UseSubmitScoreResult {
  submitScore: (
    projectId: string,
    score: number,
    feedback: string,
  ) => Promise<SubmitScoreResult>;
  isSubmitting: boolean;
}

// Get all projects for the current user
export function useUserProjects(
  userAddress?: string,
): UseBlockchainProjectsResult {
  const account = useActiveAccount();
  const [data, setData] = useState<BlockchainProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const targetAddress = userAddress || account?.address;
        if (targetAddress) {
          // TODO: Replace with actual contract call
          // const projectIds = await contract.getUserProjects(targetAddress);
          // const projects = await Promise.all(projectIds.map(id => contract.getProject(id)));

          const userProjects = MOCK_BLOCKCHAIN_PROJECTS.filter(
            (p) => p.creator.toLowerCase() === targetAddress.toLowerCase(),
          );
          setData(userProjects);
        } else {
          setData([]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userAddress, account?.address]);

  const refetch = () => {
    const targetAddress = userAddress || account?.address;
    if (targetAddress) {
      const userProjects = MOCK_BLOCKCHAIN_PROJECTS.filter(
        (p) => p.creator.toLowerCase() === targetAddress.toLowerCase(),
      );
      setData(userProjects);
    } else {
      setData([]);
    }
  };

  return { data, isLoading, error, refetch };
}

// Get a single project by ID
export function useProjectById(projectId: string): UseBlockchainProjectResult {
  const [data, setData] = useState<BlockchainProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 200));

        // TODO: Replace with actual contract call
        // const project = await contract.getProject(BigInt(projectId));
        const project = MOCK_BLOCKCHAIN_PROJECTS.find(
          (p) => p.id === BigInt(projectId),
        );
        setData(project || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  return { data, isLoading, error };
}

// Get projects for a specific hackathon
export function useProjectsByHackathon(
  hackathonId: string,
): UseBlockchainProjectsResult {
  const [data, setData] = useState<BlockchainProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // TODO: Replace with actual contract call
        // const projectIds = await contract.getHackathonProjects(BigInt(hackathonId));
        // const projects = await Promise.all(projectIds.map(id => contract.getProject(id)));

        const hackathonProjects = MOCK_BLOCKCHAIN_PROJECTS.filter(
          (p) => p.hackathonId === BigInt(hackathonId),
        );
        setData(hackathonProjects);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (hackathonId) {
      fetchData();
    }
  }, [hackathonId]);

  const refetch = () => {
    const hackathonProjects = MOCK_BLOCKCHAIN_PROJECTS.filter(
      (p) => p.hackathonId === BigInt(hackathonId),
    );
    setData(hackathonProjects);
  };

  return { data, isLoading, error, refetch };
}

// Submit/create a new project
export function useSubmitProject(): UseSubmitProjectResult {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitProject = async (
    hackathonId: string,
    projectData: any,
  ): Promise<SubmitProjectResult> => {
    setIsSubmitting(true);
    try {
      // Transform UI data to metadata format
      const metadata = transformProjectUIToMetadata(projectData);

      // TODO: Upload metadata to IPFS
      // const ipfsHash = await uploadToIPFS(metadata);
      const ipfsHash = "QmMockHashForNewProject";

      // TODO: Call smart contract
      // const tx = await contract.submitProject(BigInt(hackathonId), ipfsHash);
      // const receipt = await tx.wait();
      // const projectId = receipt.events.find(e => e.event === 'ProjectSubmitted')?.args?.projectId;

      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        projectId: BigInt(Date.now()), // Mock ID
        transactionHash: "0xmocktransactionhash",
      };
    } catch (error) {
      console.error("Error submitting project:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitProject, isSubmitting };
}

// Submit score for a project (judges only)
export function useSubmitScore(): UseSubmitScoreResult {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitScore = async (
    projectId: string,
    score: number,
    feedback: string,
  ): Promise<SubmitScoreResult> => {
    setIsSubmitting(true);
    try {
      // TODO: Create judge evaluation metadata and upload to IPFS
      // const evaluationMetadata = createJudgeEvaluationMetadata(projectId, score, feedback);
      // const ipfsHash = await uploadToIPFS(evaluationMetadata);
      const ipfsHash = "QmMockHashForEvaluation";

      // TODO: Call smart contract
      // const tx = await contract.submitScore(BigInt(projectId), score, ipfsHash);
      // await tx.wait();

      // Simulate score submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        transactionHash: "0xmocktransactionhash",
      };
    } catch (error) {
      console.error("Error submitting score:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitScore, isSubmitting };
}

// Get project scoring data
export function useProjectScore(projectId: string) {
  const [data, setData] = useState<{
    avgScore: number;
    totalScore: number;
    judgeCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 200));

        // TODO: Replace with actual contract call
        // const scoreData = await contract.getProjectScore(BigInt(projectId));

        const project = MOCK_BLOCKCHAIN_PROJECTS.find(
          (p) => p.id === BigInt(projectId),
        );
        if (project) {
          setData({
            avgScore: project.averageScore || 0,
            totalScore: Number(project.totalScore),
            judgeCount: Number(project.judgeCount),
          });
        } else {
          setData(null);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  return { data, isLoading, error };
}
