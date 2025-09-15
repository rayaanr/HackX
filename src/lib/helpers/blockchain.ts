import { download } from "thirdweb/storage";
import { readContract, prepareContractCall } from "thirdweb";
import type { ThirdwebContract, ThirdwebClient } from "thirdweb";
import type { HackathonFormData } from "@/types/hackathon";

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
      "function createHackathon(string ipfsHash, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, address[] initialJudges) returns (uint256)",
    params: [
      cid,
      BigInt(registrationDeadline),
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
  hackathonId: string | number,
) {
  return prepareContractCall({
    contract,
    method:
      "function registerForHackathon(uint256 hackathonId)",
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
      "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint8 currentPhase, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, bool isActive))",
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
