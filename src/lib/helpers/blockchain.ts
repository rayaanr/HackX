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
  return {
    ...serializeBigInts(hackathon),
    active: hackathon.isActive,
    ...metadata,
  };
}

// Optimized batch fetch utility for hackathons
export async function batchFetchHackathons(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  startId: number = 1,
  count?: number
) {
  try {
    // Get total hackathons if count not specified
    const totalHackathons = count || (await getTotalHackathons(contract));
    const fetchCount = Math.min(totalHackathons, count || totalHackathons);
    const fetchPromises = [];

    for (let i = 0; i < fetchCount; i++) {
      const hackathonId = startId + i;
      fetchPromises.push(getHackathonById(contract, client, hackathonId));
    }

    return await Promise.all(fetchPromises);
  } catch (error) {
    console.error("Error batch fetching hackathons:", error);
    return [];
  }
}
