"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import type {
  ProjectWithHackathon,
  UIProject,
  HackathonRegistrationWithHackathon,
  BlockchainProject,
} from "@/types/hackathon";
import { transformBlockchainProjectToUI } from "@/lib/helpers/blockchain-transforms";
import {
  useUserProjects as useBlockchainUserProjects,
  useProjectById as useBlockchainProjectById,
  useSubmitProject as useBlockchainSubmitProject,
  useProjectsByHackathon as useBlockchainProjectsByHackathon,
} from "@/hooks/blockchain";

// Mock data for projects
const MOCK_PROJECTS: ProjectWithHackathon[] = [
  {
    id: "1",
    name: "DeFi Portfolio Tracker",
    description:
      "A decentralized application for tracking DeFi investments across multiple protocols",
    hackathon_id: "1",
    tech_stack: ["React", "Web3", "Solidity", "The Graph"],
    status: "submitted",
    repository_url: "https://github.com/user/defi-tracker",
    demo_url: "https://defi-tracker.example.com",
    team_members: [
      { name: "Alice Developer", role: "Frontend" },
      { name: "Bob Blockchain", role: "Smart Contracts" },
    ],
    created_by: "0x1234567890123456789012345678901234567890",
    created_at: "2024-12-15T00:00:00Z",
    updated_at: "2024-12-15T12:00:00Z",
    totalScore: 85,
    judgeCount: 3,
    averageScore: 28.3,
    hackathon: {
      id: "1",
      name: "Web3 Innovation Challenge",
      short_description:
        "Build the next generation of decentralized applications",
      location: "Virtual",
      experience_level: "intermediate",
      hackathon_start_date: null,
      hackathon_end_date: "2025-01-31",
      tech_stack: ["React", "Solidity", "Web3", "IPFS"],
      registration_start_date: null,
      registration_end_date: "2024-12-31",
      voting_start_date: null,
      voting_end_date: "2025-02-07",
    },
  },
];

const MOCK_REGISTERED_HACKATHONS: HackathonRegistrationWithHackathon[] = [
  {
    id: "1",
    user_id: "0x1234567890123456789012345678901234567890",
    hackathon_id: "1",
    status: "registered",
    registered_at: "2024-12-01T00:00:00Z",
    hackathon: {
      id: "1",
      name: "Web3 Innovation Challenge",
      short_description:
        "Build the next generation of decentralized applications",
      location: "Virtual",
      experience_level: "intermediate",
      hackathon_start_date: null,
      hackathon_end_date: "2025-01-31",
      tech_stack: ["React", "Solidity", "Web3", "IPFS"],
      registration_start_date: null,
      registration_end_date: "2024-12-31",
      voting_start_date: null,
      voting_end_date: "2025-02-07",
    },
  },
];

interface UseProjectsResult {
  data: ProjectWithHackathon[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseProjectResult {
  data: ProjectWithHackathon | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseRegisteredHackathonsResult {
  data: HackathonRegistrationWithHackathon[];
  isLoading: boolean;
  error: Error | null;
}

// Get all projects for the current user
export function useUserProjects(userAddress?: string): UseProjectsResult {
  const blockchainResult = useBlockchainUserProjects(userAddress);

  // Transform blockchain data to legacy format for backward compatibility
  const transformedData = blockchainResult.data.map(
    (project): ProjectWithHackathon => {
      const uiProject = transformBlockchainProjectToUI(project);
      return {
        ...uiProject,
        // Ensure required fields are present with proper defaults
        hackathon_id: uiProject.hackathon_id || project.hackathonId.toString(),
        repository_url: uiProject.repository_url || null,
        demo_url: uiProject.demo_url || null,
        team_members: uiProject.team_members || null,
        // Convert to legacy format fields
        hackathon: project.hackathonMetadata
          ? {
              id: project.hackathonId.toString(),
              name: project.hackathonMetadata.name,
              short_description: project.hackathonMetadata.shortDescription,
              location: project.hackathonMetadata.location,
              experience_level: project.hackathonMetadata.experienceLevel,
              hackathon_start_date:
                project.hackathonMetadata.hackathonPeriod?.hackathonStartDate ||
                null,
              hackathon_end_date:
                project.hackathonMetadata.hackathonPeriod?.hackathonEndDate ||
                "",
              tech_stack: project.hackathonMetadata.techStack,
              registration_start_date:
                project.hackathonMetadata.registrationPeriod
                  ?.registrationStartDate || null,
              registration_end_date:
                project.hackathonMetadata.registrationPeriod
                  ?.registrationEndDate || null,
              voting_start_date:
                project.hackathonMetadata.votingPeriod?.votingStartDate || null,
              voting_end_date:
                project.hackathonMetadata.votingPeriod?.votingEndDate || null,
            }
          : null,
      };
    },
  );

  return {
    data: transformedData,
    isLoading: blockchainResult.isLoading,
    error: blockchainResult.error,
    refetch: blockchainResult.refetch,
  };
}

// Get a single project by ID
export function useProjectById(projectId: string): UseProjectResult {
  const [data, setData] = useState<ProjectWithHackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 200));

        const project = MOCK_PROJECTS.find((p) => p.id === projectId);
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
export function useProjectHackathons(projectId: string): UseProjectsResult {
  const [data, setData] = useState<ProjectWithHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 200));

        const project = MOCK_PROJECTS.find((p) => p.id === projectId);
        setData(project ? [project] : []);
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

  const refetch = () => {
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    setData(project ? [project] : []);
  };

  return { data, isLoading, error, refetch };
}

// Get registered hackathons for the current user
export function useRegisteredHackathons(
  userAddress?: string,
): UseRegisteredHackathonsResult {
  const account = useActiveAccount();
  const [data, setData] = useState<HackathonRegistrationWithHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const targetAddress = userAddress || account?.address;
        if (targetAddress) {
          const userRegistrations = MOCK_REGISTERED_HACKATHONS.filter(
            (r) => r.user_id === targetAddress,
          );
          setData(userRegistrations);
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

  return { data, isLoading, error };
}

// Submit/create a new project
export function useSubmitProject() {
  const blockchainSubmit = useBlockchainSubmitProject();

  const submitProject = async (projectData: any) => {
    try {
      // Extract hackathon ID from project data or require it to be passed
      const hackathonId = projectData.hackathonId || projectData.hackathon_id;
      if (!hackathonId) {
        throw new Error("Hackathon ID is required to submit a project");
      }

      const result = await blockchainSubmit.submitProject(
        hackathonId.toString(),
        projectData,
      );

      if (result.success) {
        return {
          success: true,
          data: {
            id: result.projectId?.toString() || "",
            name: projectData.name,
            created_at: new Date().toISOString(),
            description: projectData.description,
            tech_stack: projectData.techStack || projectData.tech_stack || [],
            status: "submitted",
            created_by: "", // Will be filled by the contract
            updated_at: new Date().toISOString(),
            hackathon_id: hackathonId.toString(),
          },
        };
      } else {
        return {
          success: false,
          error: result.error || "Unknown error",
        };
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  return { submitProject, isSubmitting: blockchainSubmit.isSubmitting };
}

// Register for a hackathon
export function useRegisterForHackathon() {
  const [isRegistering, setIsRegistering] = useState(false);

  const registerForHackathon = async (hackathonId: string) => {
    setIsRegistering(true);
    try {
      // TODO: Replace with actual smart contract call
      console.log("Registering for hackathon:", hackathonId);

      // Simulate registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true };
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

// Get submitted projects for a specific hackathon
export function useSubmittedProjectsByHackathon(
  hackathonId: string,
): UseProjectsResult {
  const [data, setData] = useState<ProjectWithHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const hackathonProjects = MOCK_PROJECTS.filter(
          (p) => p.hackathon_id === hackathonId,
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
    const hackathonProjects = MOCK_PROJECTS.filter(
      (p) => p.hackathon_id === hackathonId,
    );
    setData(hackathonProjects);
  };

  return { data, isLoading, error, refetch };
}
