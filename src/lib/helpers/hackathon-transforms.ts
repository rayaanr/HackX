import type {
  UIHackathon,
  HackathonStatus,
  JudgeStatus,
} from "@/types/hackathon";

// Get status variant for badge styling
export function getStatusVariant(
  status: HackathonStatus,
):
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "green"
  | "red"
  | "blue"
  | "purple"
  | "orange"
  | "yellow" {
  switch (status) {
    case "Live":
    case "Registration Open":
      return "green";
    case "Voting":
      return "blue";
    case "Registration Closed":
      return "yellow";
    case "Ended":
      return "red";
    default:
      return "default";
  }
}

// All database-related functions removed
// Use blockchain-transforms.ts for blockchain data transformations
