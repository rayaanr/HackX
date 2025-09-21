import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen } from "lucide-react";
import { type UIHackathon } from "@/types/hackathon";
import {
  useHackathonParticipants,
  useHackathonProjectsWithDetails,
} from "@/hooks/blockchain/useBlockchainHackathons";
import { ProjectCard, type ProjectCardData } from "@/components/projects/display/project-card";
import { useMemo } from "react";

interface SubmittedProjectsTabProps {
  hackathon: UIHackathon;
}

export function SubmittedProjectsTab({ hackathon }: SubmittedProjectsTabProps) {
  const {
    data: participants = [],
    isLoading: participantsLoading,
    error: participantsError,
  } = useHackathonParticipants(hackathon.id);

  const {
    projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useHackathonProjectsWithDetails(hackathon.id);

  // Transform blockchain projects to ProjectCardData format
  const transformedProjects = useMemo((): ProjectCardData[] => {
    return projects.map((project) => ({
      id: project.id?.toString() || `project-${Date.now()}`,
      name: project.name || "Untitled Project",
      intro: project.intro || project.description || "No description available.",
      hackathon_name: undefined, // Don't show hackathon name in hackathon context
      tech_stack: project.techStack || [],
      updated_at: project.createdAt || new Date().toISOString(),
      totalScore: project.totalScore,
      judgeCount: project.judgeCount,
      logo: project.logo,
      key: `hackathon-project-${project.id}`,
    }));
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {participantsLoading ? "..." : participants.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {participantsError
                ? "Error loading participants"
                : "Registered participants"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Submitted Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectsLoading ? "..." : projects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {projectsError ? "Error loading projects" : "Total submissions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          {participantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : participantsError ? (
            <p className="text-muted-foreground">
              Failed to load participants.
            </p>
          ) : participants.length === 0 ? (
            <p className="text-muted-foreground">
              No participants have registered yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((address, index) => (
                <div
                  key={address}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Participant</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : projectsError ? (
            <p className="text-muted-foreground">Failed to load projects.</p>
          ) : projects.length === 0 ? (
            <p className="text-muted-foreground">
              No projects have been submitted yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transformedProjects.map((project) => (
                <ProjectCard key={project.key} project={project} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
