// Query key factory for hackathons
export const hackathonKeys = {
  all: ['hackathons'] as const,
  user: () => [...hackathonKeys.all, 'user'] as const,
} as const;

// Query key factory for dashboard
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
} as const;