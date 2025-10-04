import { download, upload } from "thirdweb/storage";
import { readContract, prepareContractCall } from "thirdweb";
import type { ThirdwebContract, ThirdwebClient } from "thirdweb";
import type { HackathonFormData } from "@/types/hackathon";
import type { ProjectFormData } from "@/lib/schemas/project-schema";
import type {
  BlockchainProject,
  ProjectMetadata,
  ContractProject,
} from "@/types/blockchain";

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
// Note: Blockchain timestamps are always UTC Unix timestamps (seconds since epoch)
// JavaScript Date.getTime() returns UTC milliseconds, so division by 1000 gives UTC seconds
function dateToUnixTimestamp(date?: Date): number {
  return date ? Math.floor(date.getTime() / 1000) : 0;
}

// Contract transaction preparation
export function prepareCreateHackathonTransaction(
  contract: ThirdwebContract,
  cid: string,
  formData: HackathonFormData,
) {
  const registrationStartDate = dateToUnixTimestamp(
    formData.registrationPeriod?.registrationStartDate,
  );
  const registrationDeadline = dateToUnixTimestamp(
    formData.registrationPeriod?.registrationEndDate,
  );
  const submissionStartDate = dateToUnixTimestamp(
    formData.hackathonPeriod?.hackathonStartDate,
  );
  const submissionDeadline = dateToUnixTimestamp(
    formData.hackathonPeriod?.hackathonEndDate,
  );
  const judgingStartDate = dateToUnixTimestamp(
    formData.votingPeriod?.votingStartDate,
  );
  const judgingDeadline = dateToUnixTimestamp(
    formData.votingPeriod?.votingEndDate,
  );

  // Extract judge addresses from the form data
  const initialJudges = formData.judges?.map((judge) => judge.address) || [];

  return prepareContractCall({
    contract,
    method:
      "function createHackathon(string ipfsHash, uint256 registrationStartDate, uint256 registrationDeadline, uint256 submissionStartDate, uint256 submissionDeadline, uint256 judgingStartDate, uint256 judgingDeadline, address[] initialJudges) returns (uint256)",
    params: [
      cid,
      BigInt(registrationStartDate),
      BigInt(registrationDeadline),
      BigInt(submissionStartDate),
      BigInt(submissionDeadline),
      BigInt(judgingStartDate),
      BigInt(judgingDeadline),
      initialJudges,
    ],
  });
}

// Fetch total hackathons count
export async function getTotalHackathons(
  contract: ThirdwebContract,
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
  hackathonId: string | number,
): Promise<string[]> {
  try {
    const participants = await readContract({
      contract,
      method:
        "function getHackathonParticipants(uint256 hackathonId) view returns (address[])",
      params: [BigInt(hackathonId)],
    });
    return (participants || []).map((p: any) =>
      typeof p === "bigint" ? p.toString() : p,
    );
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return [];
  }
}

// Fetch hackathon projects
export async function getHackathonProjects(
  contract: ThirdwebContract,
  hackathonId: string | number,
): Promise<number[]> {
  try {
    const projects = await readContract({
      contract,
      method:
        "function getHackathonProjects(uint256 hackathonId) view returns (uint256[])",
      params: [BigInt(hackathonId)],
    });
    return (projects || []).map((p: any) =>
      typeof p === "bigint" ? Number(p) : p,
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
  userAddress: string,
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
    method: "function registerForHackathon(uint256 hackathonId)",
    params: [BigInt(hackathonId)],
  });
}

// Fetch metadata from IPFS
export async function fetchIPFSMetadata(
  client: ThirdwebClient,
  ipfsHash: string,
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
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (fallbackError) {
      console.warn(
        `Failed to fetch metadata from both IPFS and dweb.link for hash ${ipfsHash}:`,
        fallbackError,
      );
      return {};
    }
  }
}

// Fetch Hackathon Data by ID
export async function getHackathonById(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  hackathonId: string | number,
) {
  const id = BigInt(hackathonId);
  const hackathon = await readContract({
    contract,
    method:
      "function getHackathon(uint256 hackathonId) view returns ((uint256 id, string ipfsHash, address organizer, uint256 registrationStartDate, uint256 registrationDeadline, uint256 submissionStartDate, uint256 submissionDeadline, uint256 judgingStartDate, uint256 judgingDeadline, bool isActive))",
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
  projectData: ProjectFormData,
): Promise<{ cid: string }> {
  // Import processImageForIPFS dynamically to avoid circular dependencies
  const { processImageForIPFS } = await import("./ipfs");

  // Step 1: Process the logo - upload to IPFS
  console.log("📸 Processing project logo...");
  let logoUri: string | null = null;

  if (projectData.logo) {
    logoUri = await processImageForIPFS(client, projectData.logo);
    console.log(`✅ Logo processed: ${logoUri}`);
  }

  // Step 2: Create metadata with IPFS logo URI
  const metadata = {
    name: projectData.name,
    intro: projectData.intro,
    description: projectData.description,
    logo: logoUri,
    sector: projectData.sector || [],
    progress: projectData.progress,
    fundraisingStatus: projectData.fundraisingStatus,
    githubLink: projectData.githubLink || null,
    demoVideo: projectData.demoVideo || null,
    pitchVideo: projectData.pitchVideo || null,
    techStack: projectData.techStack || [],
    submittedToHackathons: projectData.hackathonIds || [],
    createdAt: new Date().toISOString(),
    version: "1.0.0",
  };

  const fileName = `project-${projectData.name
    .toLowerCase()
    .replace(/\\s+/g, "-")}-${Date.now()}.json`;

  // Step 3: Upload metadata JSON to IPFS
  console.log("📦 Uploading project metadata to IPFS...");
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
  console.log(`✅ Project metadata uploaded: ${cid}`);

  return { cid };
}

// Prepare create project transaction
export function prepareCreateProjectTransaction(
  contract: ThirdwebContract,
  cid: string,
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
  projectId: string | number,
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

// Get user project IDs only (lightweight version)
export async function getUserProjects(
  contract: ThirdwebContract,
  userAddress: string,
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

export async function getUserProjectsWithDetails(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  userAddress: string,
) {
  try {
    console.log("🔗 Fetching user projects with details...", { userAddress });

    // Step 1: Get user's project IDs using the contract function
    const rawProjectIds = await readContract({
      contract,
      method: "function getUserProjects(address user) view returns (uint256[])",
      params: [userAddress],
    });

    console.log(
      "📊 Raw project IDs from contract:",
      rawProjectIds,
      typeof rawProjectIds,
    );

    // Additional debugging - log each project ID individually
    if (rawProjectIds && Array.isArray(rawProjectIds)) {
      rawProjectIds.forEach((id, index) => {
        console.log(
          `📋 Project ID[${index}]: ${id} (type: ${typeof id}, value: ${String(
            id,
          )})`,
        );
        console.log(
          `📋 Project ID[${index}] BigInt conversion test: ${BigInt(id)}`,
        );
      });
    }

    if (!rawProjectIds || rawProjectIds.length === 0) {
      console.log("ℹ️ No projects found for user");
      return [];
    }

    // Step 2: Fetch details for each project
    const projectPromises = rawProjectIds.map(async (projectId: any) => {
      try {
        // Debug logging
        console.log(
          `🔍 Processing project ID: ${projectId} (type: ${typeof projectId})`,
        );

        const numericId = Number(projectId);
        console.log(`� Converted to numeric ID: ${numericId}`);

        // Validate the numeric ID is reasonable
        if (
          numericId < 0 ||
          numericId > Number.MAX_SAFE_INTEGER ||
          !Number.isFinite(numericId)
        ) {
          console.error(
            `❌ Invalid project ID: ${numericId} (original: ${projectId})`,
          );
          return null;
        }

        // Additional check for the specific problematic value
        const projectIdString = String(projectId);
        if (projectIdString.includes("e+") || projectIdString.length > 20) {
          console.error(`❌ Suspicious project ID format: ${projectIdString}`);
          return null;
        }

        // Skip project ID 0 as it's often uninitialized in contracts
        if (numericId === 0) {
          console.log(`ℹ️ Skipping project ID 0 (likely uninitialized)`);
          return null;
        }

        // Ensure projectId is properly converted to BigInt for contract call
        let bigIntProjectId: bigint;
        try {
          bigIntProjectId =
            typeof projectId === "bigint" ? projectId : BigInt(projectId);
          console.log(`🔧 Using BigInt ID for contract: ${bigIntProjectId}`);
        } catch (conversionError) {
          console.error(
            `❌ Failed to convert project ID to BigInt:`,
            conversionError,
          );
          return null;
        }

        // Get project details from contract using correct ABI
        const project = await readContract({
          contract,
          method:
            "function getProject(uint256 projectId) view returns ((uint256 id, string ipfsHash, address creator, address[] teamMembers, bool isCreated))",
          params: [bigIntProjectId],
        });

        console.log(`📄 Project ${numericId} contract data:`, project);

        // Fetch metadata from IPFS
        let metadata: any = {};
        if (project.ipfsHash) {
          try {
            const rawMetadata = await fetchIPFSMetadata(
              client,
              project.ipfsHash,
            );
            console.log(
              `📁 Raw IPFS metadata for project ${numericId}:`,
              rawMetadata,
            );

            // Flatten nested metadata structure - check if data is nested under 'data' property
            if (rawMetadata && typeof rawMetadata === "object") {
              if (rawMetadata.data && typeof rawMetadata.data === "object") {
                // Use nested data and merge with top-level properties
                metadata = { ...rawMetadata, ...rawMetadata.data };
                console.log(
                  `📋 Flattened metadata for project ${numericId}:`,
                  metadata,
                );
              } else {
                metadata = rawMetadata;
              }
            }

            console.log(`📁 Project ${numericId} IPFS metadata processed`);
          } catch (error) {
            console.warn(
              `Failed to fetch IPFS metadata for project ${numericId}:`,
              error,
            );
          }
        }

        return {
          // Contract data (serialized for JSON compatibility)
          id: numericId,
          ipfsHash: project.ipfsHash,
          creator: project.creator,
          teamMembers: project.teamMembers || [],
          isCreated: project.isCreated,

          // Flattened IPFS metadata (project details)
          name: metadata.name || "Untitled Project",
          description: metadata.description || metadata.intro || "",
          intro: metadata.intro || "",
          logo: metadata.logo || "",
          sector: metadata.sector || [],
          progress: metadata.progress || "",
          fundraisingStatus: metadata.fundraisingStatus || "",
          githubLink: metadata.githubLink || "",
          demoVideo: metadata.demoVideo || "",
          pitchVideo: metadata.pitchVideo || "",
          techStack: metadata.techStack || [],
          hackathonIds:
            metadata.hackathonIds || metadata.submittedToHackathons || [],

          // Version and timestamps
          version: metadata.version || "1.0.0",
          createdAt: metadata.createdAt || new Date().toISOString(),
        };
      } catch (error) {
        console.error(`❌ Failed to fetch project ${projectId}:`, error);
        return null;
      }
    });

    const projects = await Promise.all(projectPromises);
    const validProjects = projects.filter(Boolean);

    console.log("✅ Successfully fetched user projects:", validProjects.length);
    return validProjects;
  } catch (error) {
    console.error("❌ Failed to fetch user projects with details:", error);
    return [];
  }
}

// Get hackathon IDs that a project has been submitted to
export async function getProjectHackathons(
  contract: ThirdwebContract,
  projectId: string | number,
): Promise<string[]> {
  try {
    const hackathonIds: string[] = [];
    let index = 0;

    // Keep reading until we get 0 (which means no more hackathons)
    while (true) {
      try {
        const hackathonId = await readContract({
          contract,
          method:
            "function projectHackathons(uint256, uint256) view returns (uint256)",
          params: [BigInt(projectId), BigInt(index)],
        });

        // If hackathonId is 0, we've reached the end
        if (hackathonId === BigInt(0)) break;

        hackathonIds.push(hackathonId.toString());
        index++;
      } catch (error) {
        // If we get an error (out of bounds), we've reached the end
        break;
      }
    }

    return hackathonIds;
  } catch (error) {
    console.error(
      `Failed to fetch hackathons for project ${projectId}:`,
      error,
    );
    return [];
  }
}

// Get project details by ID
export async function getProjectById(
  contract: ThirdwebContract,
  client: ThirdwebClient,
  projectId: string | number,
): Promise<BlockchainProject | null> {
  try {
    const project = await readContract({
      contract,
      method:
        "function getProject(uint256 projectId) view returns ((uint256 id, string ipfsHash, address creator, address[] teamMembers, bool isCreated))",
      params: [BigInt(projectId)],
    });

    // Convert contract data to proper format
    const contractProject: ContractProject = {
      id: project.id,
      ipfsHash: project.ipfsHash,
      creator: project.creator,
      teamMembers: [...project.teamMembers],
      isCreated: project.isCreated,
    };

    // Fetch metadata from IPFS
    let metadata: Partial<ProjectMetadata> = {};
    try {
      if (project.ipfsHash) {
        const rawMetadata = await fetchIPFSMetadata(client, project.ipfsHash);

        // Flatten nested metadata structure - check if data is nested under 'data' property
        if (rawMetadata && typeof rawMetadata === "object") {
          if (rawMetadata.data && typeof rawMetadata.data === "object") {
            // Use nested data and merge with top-level properties
            metadata = { ...rawMetadata, ...rawMetadata.data };
          } else {
            metadata = rawMetadata;
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch metadata for project ${projectId}:`, error);
    }

    // Fetch hackathon IDs from the contract (source of truth)
    const hackathonIds = await getProjectHackathons(contract, projectId);

    // Construct properly typed BlockchainProject
    const blockchainProject: BlockchainProject = {
      ...serializeBigInts(contractProject),
      metadata: metadata as ProjectMetadata,

      // Flattened metadata properties for UI convenience
      name: (metadata as any).name || "Untitled Project",
      intro: (metadata as any).intro || "",
      description: (metadata as any).description || "",
      logo: (metadata as any).logo || "",
      sector: (metadata as any).sector || [],
      progress: (metadata as any).progress || "",
      fundraisingStatus: (metadata as any).fundraisingStatus || "",
      githubLink: (metadata as any).githubLink || "",
      demoVideo: (metadata as any).demoVideo || "",
      pitchVideo: (metadata as any).pitchVideo || "",
      techStack: (metadata as any).techStack || [],
      hackathonIds: hackathonIds, // Use contract data as source of truth
      version: (metadata as any).version || "1.0.0",
      createdAt: (metadata as any).createdAt || new Date().toISOString(),

      // Computed properties - will be fetched separately using getProjectScore
      averageScore: undefined,
    };

    return blockchainProject;
  } catch (error) {
    console.error(`Failed to fetch project ${projectId}:`, error);
    return null;
  }
}

// Get project team members
export async function getProjectTeamMembers(
  contract: ThirdwebContract,
  projectId: string | number,
): Promise<string[]> {
  const result = await readContract({
    contract,
    method:
      "function getProjectTeamMembers(uint256 projectId) view returns (address[])",
    params: [BigInt(projectId)],
  });
  return result as string[];
}

// Get judge assignments - returns hackathon IDs that the judge is assigned to
export async function getJudgeAssignments(
  contract: ThirdwebContract,
  judgeAddress: string,
): Promise<number[]> {
  const result = await readContract({
    contract,
    method:
      "function getJudgeAssignments(address judge) view returns (uint256[])",
    params: [judgeAddress],
  });
  return (result as bigint[]).map((id) => Number(id));
}

// Get total projects count
export async function getTotalProjects(
  contract: ThirdwebContract,
): Promise<number> {
  const result = await readContract({
    contract,
    method: "function getTotalProjects() view returns (uint256)",
  });
  return Number(result);
}

// ===== JUDGE SCORING FUNCTIONS =====

// Prepare submit score transaction
export function prepareSubmitScoreTransaction(
  contract: ThirdwebContract,
  hackathonId: string | number,
  projectId: string | number,
  totalScore: number,
  feedbackIpfsHash: string,
) {
  return prepareContractCall({
    contract,
    method:
      "function submitScore(uint256 hackathonId, uint256 projectId, uint256 score, string feedbackIpfsHash)",
    params: [
      BigInt(hackathonId),
      BigInt(projectId),
      BigInt(totalScore),
      feedbackIpfsHash,
    ],
  });
}

// Get project score for a specific hackathon
export async function getProjectScore(
  contract: ThirdwebContract,
  hackathonId: string | number,
  projectId: string | number,
): Promise<{
  avgScore: number;
  totalScore: number;
  judgeCount: number;
} | null> {
  try {
    const result = await readContract({
      contract,
      method:
        "function getProjectScore(uint256 hackathonId, uint256 projectId) view returns (uint256 avgScore, uint256 totalScore, uint256 judgeCount)",
      params: [BigInt(hackathonId), BigInt(projectId)],
    });

    return {
      avgScore: Number(result[0]),
      totalScore: Number(result[1]),
      judgeCount: Number(result[2]),
    };
  } catch (error) {
    console.error(
      `Failed to get project score for hackathon ${hackathonId}, project ${projectId}:`,
      error,
    );
    return null;
  }
}

// Check if a judge has already scored a project
export async function hasJudgeScored(
  contract: ThirdwebContract,
  hackathonId: string | number,
  projectId: string | number,
  judge: string,
): Promise<boolean> {
  try {
    const result = await readContract({
      contract,
      method:
        "function hasJudgeScored(uint256 hackathonId, uint256 projectId, address judge) view returns (bool)",
      params: [BigInt(hackathonId), BigInt(projectId), judge],
    });
    return result;
  } catch (error) {
    console.error(`Failed to check if judge has scored project:`, error);
    return false;
  }
}

// Get judge evaluation (feedback) for a project
export async function getJudgeEvaluation(
  contract: ThirdwebContract,
  hackathonId: string | number,
  projectId: string | number,
  judge: string,
): Promise<{ submitted: boolean; feedbackIpfsHash: string } | null> {
  try {
    const result = await readContract({
      contract,
      method:
        "function getJudgeEvaluation(uint256 hackathonId, uint256 projectId, address judge) view returns (bool submitted, string feedbackIpfsHash)",
      params: [BigInt(hackathonId), BigInt(projectId), judge],
    });

    return {
      submitted: result[0],
      feedbackIpfsHash: result[1],
    };
  } catch (error) {
    console.error(`Failed to get judge evaluation:`, error);
    return null;
  }
}
