import { download, upload } from "thirdweb/storage";
import { readContract, prepareContractCall, waitForReceipt } from "thirdweb";
import type { ThirdwebContract, ThirdwebClient } from "thirdweb";
import type { HackathonFormData } from "@/types/hackathon";
import type { ProjectFormData } from "@/lib/schemas/project-schema";

/**
 * Core blockchain utility functions
 * Optimized to work with Thirdweb and eliminate duplication
 */

// BigInt serialization utility
export function serializeBigInts(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return Number(obj);
  if (Array.isArray(obj)) return obj.map(serializeBigInts);
  if (typeof obj === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInts(value);
    }
    return serialized;
  }
  return obj;
}

// Date conversion utilities
function dateToUnixTimestamp(date?: Date): number {
  return date ? Math.floor(date.getTime() / 1000) : 0;
}

// Contract transaction preparation
export function prepareCreateHackathonTransaction(
  contract: ThirdwebContract,
  cid: string,
  formData: HackathonFormData
) {
  const registrationDeadline = dateToUnixTimestamp(
    formData.registrationPeriod?.registrationEndDate
  );
  const submissionStartDate = dateToUnixTimestamp(
    formData.hackathonPeriod?.hackathonStartDate
  );
  const submissionDeadline = dateToUnixTimestamp(
    formData.hackathonPeriod?.hackathonEndDate
  );
  const judgingDeadline = dateToUnixTimestamp(
    formData.votingPeriod?.votingEndDate
  );

  // Extract judge addresses from the form data
  const initialJudges = formData.judges?.map((judge) => judge.address) || [];

  return prepareContractCall({
    contract,
    method:
      "function createHackathon(string ipfsHash, uint256 registrationDeadline, uint256 submissionStartDate, uint256 submissionDeadline, uint256 judgingDeadline, address[] initialJudges) returns (uint256)",
    params: [
      cid,
      BigInt(registrationDeadline),
      BigInt(submissionStartDate),
      BigInt(submissionDeadline),
      BigInt(judgingDeadline),
      initialJudges,
    ],
  });
}

// Fetch total hackathons count
export async function getTotalHackathons(
  contract: ThirdwebContract
): Promise<number> {
  const result = await readContract({
    contract,
    method: "function getTotalHackathons() view returns (uint256)",
  });
  return Number(result);
}

// Fetch hackathon participants
export async function getHackathonParticipants(
  contract: ThirdwebContract,
  hackathonId: string | number
): Promise<string[]> {
  try {
    const participants = await readContract({
      contract,
      method:
        "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
      params: [BigInt(hackathonId)],
    });
    return (participants || []).map((p: any) =>
      typeof p === "bigint" ? p.toString() : p
    );
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return [];
  }
}

// Fetch hackathon projects
export async function getHackathonProjects(
  contract: ThirdwebContract,
  hackathonId: string | number
): Promise<number[]> {
  try {
    const projects = await readContract({
      contract,
      method:
        "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
      params: [BigInt(hackathonId)],
    });
    return (projects || []).map((p: any) =>
      typeof p === "bigint" ? Number(p) : p
    );
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

// Check if user is registered for a hackathon
export async function isUserRegistered(
  contract: ThirdwebContract,
  hackathonId: string | number,
  userAddress: string
): Promise<boolean> {
  try {
    const isRegistered = await readContract({
      contract,
      method: "function isRegistered(uint256, address) view returns (bool)",
      params: [BigInt(hackathonId), userAddress],
    });
    return Boolean(isRegistered);
  } catch (error) {
    console.error("Failed to check registration status:", error);
    return false;
  }
}

// Register for hackathon
export function prepareRegisterForHackathonTransaction(
  contract: ThirdwebContract,
  hackathonId: string | number
) {
  return prepareContractCall({
    contract,
    method: "function registerForHackathon(uint256 hackathonId)",
    params: [BigInt(hackathonId)],
  });
}

// Fetch metadata from IPFS
export async function fetchIPFSMetadata(
  client: ThirdwebClient,
  ipfsHash: string
) {
  try {
    const file = await download({
      client,
      uri: `ipfs://${ipfsHash}`,
    });
    return await file.json();
  } catch (error) {
    // Fallback with dweb.link
    try {
      const response = await fetch(`https://dweb.link/ipfs/${ipfsHash}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (fallbackError) {
      console.warn(
        `Failed to fetch metadata from both IPFS and dweb.link for hash ${ipfsHash}:`,
        fallbackError
      );
      return {};
    }
  }
}

// Fetch Hackathon Data by ID
export async function getHackathonById(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  hackathonId: string | number
) {
  const id = BigInt(hackathonId);
  const hackathon = await readContract({
    contract,
    method:
      "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint8 currentPhase, uint256 registrationDeadline, uint256 submissionStartDate, uint256 submissionDeadline, uint256 judgingDeadline, bool isActive))",
    params: [id],
  });
  const metadata = await fetchIPFSMetadata(client, hackathon.ipfsHash);

  // Flatten the data structure - if metadata has a 'data' property, spread it at root level
  const flattenedData = metadata.data ? metadata.data : metadata;

  return {
    ...serializeBigInts(hackathon),
    active: hackathon.isActive,
    ...flattenedData,
    // Keep original metadata structure for backward compatibility
    metadata: metadata,
  };
}

// ===== PROJECT BLOCKCHAIN FUNCTIONS =====

// Upload project metadata to IPFS
export async function uploadProjectToIPFS(
  client: ThirdwebClient,
  projectData: ProjectFormData
): Promise<{ cid: string}> {
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

  const fileName = `project-${projectData.name
    .toLowerCase()
    .replace(/\\s+/g, "-")}-${Date.now()}.json`;

  const uris = await upload({
    client,
    files: [
      {
        name: fileName,
        data: metadata,
      },
    ],
  });

  const cid = uris.replace("ipfs://", "");

  return { cid };
}

// Prepare create project transaction
export function prepareCreateProjectTransaction(
  contract: ThirdwebContract,
  cid: string
) {
  return prepareContractCall({
    contract,
    method: "function createProject(string projectIpfsHash) returns (uint256)",
    params: [cid],
  });
}

// Prepare submit project to hackathon transaction
export function prepareSubmitProjectToHackathonTransaction(
  contract: ThirdwebContract,
  hackathonId: string | number,
  projectId: string | number
) {
  return prepareContractCall({
    contract,
    method:
      "function submitProjectToHackathon(uint256 hackathonId, uint256 projectId)",
    params: [BigInt(hackathonId), BigInt(projectId)],
  });
}

// Extract project ID from transaction receipt
export function extractProjectIdFromReceipt(receipt: any): number | null {
  if (!receipt.logs || receipt.logs.length === 0) {
    return null;
  }

  // Look for ProjectCreated event in logs
  const projectCreatedLog = receipt.logs.find((log: any) => {
    // Check if this log could be the ProjectCreated event
    return log.topics && log.topics.length > 1;
  });

  if (projectCreatedLog && projectCreatedLog.topics[1]) {
    // Extract project ID from the indexed parameter (topics[1])
    return parseInt(projectCreatedLog.topics[1], 16);
  }

  return null;
}

// Get user projects from blockchain
export async function getUserProjects(
  contract: ThirdwebContract,
  userAddress: string
): Promise<number[]> {
  try {
    const projectIds = await readContract({
      contract,
      method: "function getUserProjects(address user) view returns (uint256[])",
      params: [userAddress],
    });

    return (projectIds || []).map((id: any) => Number(id));
  } catch (error) {
    console.error("Failed to fetch user project IDs:", error);
    return [];
  }
}

// Get project details by ID
export async function getProjectById(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  projectId: string | number
) {
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
      metadata = await fetchIPFSMetadata(client, project.ipfsHash);
    }
  } catch (error) {
    console.warn(`Failed to fetch metadata for project ${projectId}:`, error);
  }

  return {
    ...serializeBigInts(project),
    ...metadata,
    blockchainId: Number(projectId),
  };
}

// Get total projects count
export async function getTotalProjects(
  contract: ThirdwebContract
): Promise<number> {
  const result = await readContract({
    contract,
    method: "function getTotalProjects() view returns (uint256)",
  });
  return Number(result);
}
