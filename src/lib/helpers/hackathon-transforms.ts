import type {
  UIHackathon,
  HackathonStatus,
  JudgeStatus,
} from "@/types/hackathon";
import {
  getHackathonStatusVariant,
  getStatusDisplayText,
  type StatusVariant,
} from "./status";

// Re-export the centralized status utilities for backward compatibility
export function getStatusVariant(status: HackathonStatus): StatusVariant {
  return getHackathonStatusVariant(status);
}

export { getStatusDisplayText };

// All database-related functions removed
// Use blockchain-transforms.ts for blockchain data transformations
