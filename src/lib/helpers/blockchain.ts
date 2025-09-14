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
export function dateToUnixTimestamp(date?: Date): number {
  return date ? Math.floor(date.getTime() / 1000) : 0;
}

export function unixTimestampToDate(
  timestamp: bigint | number | string | undefined,
): Date | undefined {
  if (!timestamp) return undefined;
  const ts =
    typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);
  return ts > 0 ? new Date(ts * 1000) : undefined;
}

// IPFS utility
export function extractCID(uri: string): string {
  return uri.replace("ipfs://", "");
}

// Contract transaction preparation
export function prepareCreateHackathonTransaction(
  contract: ThirdwebContract,
  cid: string,
  formData: HackathonFormData,
) {
  const registrationDeadline = dateToUnixTimestamp(
    formData.registrationPeriod?.registrationEndDate,
  );
  const submissionDeadline = dateToUnixTimestamp(
    formData.hackathonPeriod?.hackathonEndDate,
  );
  const judgingDeadline = dateToUnixTimestamp(
    formData.votingPeriod?.votingEndDate,
  );

  return prepareContractCall({
    contract,
    method:
      "function createHackathon(string ipfsHash, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline) returns (uint256)",
    params: [
      cid,
      BigInt(registrationDeadline),
      BigInt(submissionDeadline),
      BigInt(judgingDeadline),
    ],
  });
}

// Optimized batch fetch utility for hackathons
export async function batchFetchHackathons(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  startId: number = 1,
  count?: number,
) {
  try {
    // Get total hackathons if count not specified
    const totalHackathons = count
      ? BigInt(count)
      : await readContract({
          contract,
          method: "function getTotalHackathons() view returns (uint256)",
        });

    if (totalHackathons === BigInt(0)) {
      return [];
    }

    const endId = count ? startId + count - 1 : Number(totalHackathons);

    // Batch fetch basic hackathon data first
    const hackathonPromises = [];
    for (let i = startId; i <= endId; i++) {
      hackathonPromises.push(
        readContract({
          contract,
          method:
            "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint8 currentPhase, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, bool isActive))",
          params: [BigInt(i)],
        }).catch(() => null),
      );
    }

    const hackathonResults = await Promise.all(hackathonPromises);
    const validHackathons = hackathonResults.filter(Boolean);

    if (validHackathons.length === 0) {
      return [];
    }

    // Batch fetch metadata for valid hackathons
    const metadataPromises = validHackathons.map(async (hackathon) => {
      if (!hackathon) {
        return { hackathon: null, metadata: {} };
      }
      try {
        const file = await download({
          client,
          uri: `ipfs://${hackathon.ipfsHash}`,
        });
        const metadata = await file.json();
        return { hackathon, metadata };
      } catch (error) {
        console.warn(
          `Failed to fetch metadata for hackathon ${hackathon.id}:`,
          error,
        );
        return { hackathon, metadata: {} };
      }
    });

    const results = await Promise.all(metadataPromises);

    // Return combined data, filtering out null hackathons and converting BigInt values
    return results
      .filter(({ hackathon }) => hackathon !== null)
      .map(({ hackathon, metadata }) => ({
        ...serializeBigInts(hackathon!),
        active: hackathon!.isActive,
        ...metadata,
      }));
  } catch (error) {
    console.error("Failed to fetch hackathons:", error);
    return [];
  }
}

// Optimized single hackathon fetch utility
export async function fetchSingleHackathon(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  hackathonId: string | number,
) {
  try {
    const id = BigInt(hackathonId);

    // Fetch basic hackathon data
    const hackathon = await readContract({
      contract,
      method:
        "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint8 currentPhase, uint256 registrationDeadline, uint256 submissionDeadline, uint256 judgingDeadline, bool isActive))",
      params: [id],
    });

    // Fetch metadata from IPFS
    let metadata = {};
    try {
      const file = await download({
        client,
        uri: `ipfs://${hackathon.ipfsHash}`,
      });
      metadata = await file.json();
    } catch (error) {
      console.warn(
        `Failed to fetch metadata for hackathon ${hackathonId}:`,
        error,
      );
    }

    return {
      ...serializeBigInts(hackathon),
      active: hackathon.isActive,
      ...metadata,
    };
  } catch (error) {
    console.error(`Failed to fetch hackathon ${hackathonId}:`, error);
    throw error;
  }
}
