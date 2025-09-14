// Re-export all blockchain hooks for easier imports
export * from "./use-blockchain-hackathons";
export * from "./use-blockchain-projects";

// Hook aliases for backward compatibility
export {
  useActiveHackathons as useAllHackathons,
  useHackathonById as useHackathonByIdPublic,
} from "./use-blockchain-hackathons";

export {
  useProjectById as useProjectHackathons,
  useProjectsByHackathon as useSubmittedProjectsByHackathon,
} from "./use-blockchain-projects";
