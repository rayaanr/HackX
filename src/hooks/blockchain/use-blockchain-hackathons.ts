"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import type {
  BlockchainHackathon,
  BlockchainProject,
  HackathonMetadata,
  CreateHackathonResult,
  RegisterParticipantResult,
} from "@/types/blockchain";
import {
  transformBlockchainToUI,
  transformUIToMetadata,
} from "@/lib/helpers/blockchain-transforms";

// Mock blockchain data - replace with actual contract calls
const MOCK_BLOCKCHAIN_HACKATHONS: BlockchainHackathon[] = [
  {
    id: BigInt(1),
    ipfsHash: "QmSampleHashForHackathon1",
    organizer: "0x1234567890123456789012345678901234567890",
    currentPhase: 0, // REGISTRATION
    registrationDeadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), // 30 days from now
    submissionDeadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 60), // 60 days from now
    judgingDeadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 90), // 90 days from now
    isActive: true,
    metadata: {
      name: "Web3 Innovation Challenge",
      shortDescription:
        "Build the next generation of decentralized applications",
      fullDescription:
        "This hackathon focuses on creating innovative Web3 applications using blockchain technology.",
      location: "Virtual",
      techStack: ["React", "Solidity", "Web3", "IPFS"],
      experienceLevel: "intermediate",
      socialLinks: {},
      registrationPeriod: {
        registrationStartDate: new Date().toISOString(),
        registrationEndDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      },
      hackathonPeriod: {
        hackathonStartDate: new Date(Date.now() + 86400000 * 31).toISOString(),
        hackathonEndDate: new Date(Date.now() + 86400000 * 60).toISOString(),
      },
      votingPeriod: {
        votingStartDate: new Date(Date.now() + 86400000 * 61).toISOString(),
        votingEndDate: new Date(Date.now() + 86400000 * 90).toISOString(),
      },
      prizeCohorts: [
        {
          name: "Grand Prize",
          numberOfWinners: 1,
          prizeAmount: "10000",
          description: "The best overall project",
          judgingMode: "manual",
          votingMode: "judges_only",
          maxVotesPerJudge: 1,
          evaluationCriteria: [
            {
              name: "Innovation",
              points: 25,
              description: "How innovative is the solution?",
            },
            {
              name: "Technical Excellence",
              points: 25,
              description: "Quality of technical implementation",
            },
            {
              name: "User Experience",
              points: 25,
              description: "How good is the user experience?",
            },
            {
              name: "Impact",
              points: 25,
              description: "Potential impact of the solution",
            },
          ],
        },
      ],
      judges: [
        {
          address: "0x1234567890123456789012345678901234567890",
          status: "accepted",
        },
      ],
      schedule: [],
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      uploadedAt: new Date().toISOString(),
      type: "hackathon-metadata",
    },
    participantCount: 150,
    projectCount: 23,
    judges: ["0x1234567890123456789012345678901234567890"],
    participants: [],
    projects: [BigInt(1), BigInt(2), BigInt(3)],
  },
];

interface UseBlockchainHackathonsResult {
  data: BlockchainHackathon[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseBlockchainHackathonResult {
  data: BlockchainHackathon | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseCreateHackathonResult {
  createHackathon: (data: any) => Promise<CreateHackathonResult>;
  isCreating: boolean;
}

// Get all active hackathons
export function useActiveHackathons(): UseBlockchainHackathonsResult {
  const [data, setData] = useState<BlockchainHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual contract call
        // const activeIds = await contract.getActiveHackathons();
        // const hackathons = await Promise.all(activeIds.map(id => contract.getHackathon(id)));

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setData(MOCK_BLOCKCHAIN_HACKATHONS);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = () => {
    setData(MOCK_BLOCKCHAIN_HACKATHONS);
  };

  return { data, isLoading, error, refetch };
}

// Get hackathons created by a specific user
export function useUserHackathons(
  userAddress?: string,
): UseBlockchainHackathonsResult {
  const account = useActiveAccount();
  const [data, setData] = useState<BlockchainHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const targetAddress = userAddress || account?.address;
        if (targetAddress) {
          // TODO: Replace with actual contract call
          // Filter hackathons created by the user
          const userHackathons = MOCK_BLOCKCHAIN_HACKATHONS.filter(
            (h) => h.organizer.toLowerCase() === targetAddress.toLowerCase(),
          );
          setData(userHackathons);
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
      const userHackathons = MOCK_BLOCKCHAIN_HACKATHONS.filter(
        (h) => h.organizer.toLowerCase() === targetAddress.toLowerCase(),
      );
      setData(userHackathons);
    } else {
      setData([]);
    }
  };

  return { data, isLoading, error, refetch };
}

// Get a single hackathon by ID
export function useHackathonById(
  hackathonId: string,
): UseBlockchainHackathonResult {
  const [data, setData] = useState<BlockchainHackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        // TODO: Replace with actual contract call
        // const hackathon = await contract.getHackathon(BigInt(hackathonId));
        const hackathon = MOCK_BLOCKCHAIN_HACKATHONS.find(
          (h) => h.id === BigInt(hackathonId),
        );
        setData(hackathon || null);
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

  return { data, isLoading, error };
}

// Create a new hackathon
export function useCreateHackathon(): UseCreateHackathonResult {
  const [isCreating, setIsCreating] = useState(false);

  const createHackathon = async (data: any): Promise<CreateHackathonResult> => {
    setIsCreating(true);
    try {
      // Transform UI data to metadata format
      const metadata = transformUIToMetadata(data);

      // TODO: Upload metadata to IPFS
      // const ipfsHash = await uploadToIPFS(metadata);
      const ipfsHash = "QmMockHashForNewHackathon";

      // TODO: Call smart contract
      // const tx = await contract.createHackathon(
      //   ipfsHash,
      //   Math.floor(data.registrationPeriod.registrationEndDate.getTime() / 1000),
      //   Math.floor(data.hackathonPeriod.hackathonEndDate.getTime() / 1000),
      //   Math.floor(data.votingPeriod.votingEndDate.getTime() / 1000)
      // );
      // await tx.wait();

      // Simulate creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        hackathonId: BigInt(Date.now()), // Mock ID
        transactionHash: "0xmocktransactionhash",
      };
    } catch (error) {
      console.error("Error creating hackathon:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsCreating(false);
    }
  };

  return { createHackathon, isCreating };
}

// Register for a hackathon
export function useRegisterForHackathon() {
  const [isRegistering, setIsRegistering] = useState(false);

  const registerForHackathon = async (
    hackathonId: string,
  ): Promise<RegisterParticipantResult> => {
    setIsRegistering(true);
    try {
      // TODO: Create participant metadata and upload to IPFS
      // const participantMetadata = createParticipantMetadata();
      // const ipfsHash = await uploadToIPFS(participantMetadata);

      // TODO: Call smart contract
      // const tx = await contract.registerForHackathon(BigInt(hackathonId), ipfsHash);
      // await tx.wait();

      // Simulate registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        transactionHash: "0xmocktransactionhash",
      };
    } catch (error) {
      console.error("Error registering for hackathon:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsRegistering(false);
    }
  };

  return { registerForHackathon, isRegistering };
}
