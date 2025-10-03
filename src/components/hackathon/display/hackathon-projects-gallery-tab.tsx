import { type UIHackathon } from "@/types/hackathon";
import {
  ProjectCard,
  type ProjectCardData,
} from "@/components/projects/display/project-card";
import { useMemo } from "react";
import { ComponentLoading } from "@/components/ui/global-loading";
import { useHackathonProjectsWithDetails } from "@/hooks/use-hackathons";
import EmptyComponent from "@/components/empty";
import { motion } from "motion/react";

interface SubmittedProjectsTabProps {
  hackathon: UIHackathon;
}

export function SubmittedProjectsTab({ hackathon }: SubmittedProjectsTabProps) {
  const {
    projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useHackathonProjectsWithDetails(hackathon.id);

  // Transform blockchain projects to ProjectCardData format
  const transformedProjects = useMemo((): ProjectCardData[] => {
    return projects
      .filter((project) => project !== null && project !== undefined)
      .map((project) => ({
        id: project.id?.toString() || `project-${Date.now()}`,
        name: project.name || "Untitled Project",
        intro:
          project.intro || project.description || "No description available.",
        hackathon_name: undefined, // Don't show hackathon name in hackathon context
        tech_stack: project.techStack || [],
        updated_at: project.createdAt || new Date().toISOString(),
        averageScore: project.averageScore,
        logo: project.logo,
        key: `hackathon-project-${project.id}`,
      }));
  }, [projects]);

  return (
    <div className="space-y-6">
      {projectsLoading ? (
        <ComponentLoading text="Loading projects" height="200px" />
      ) : projectsError ? (
        <EmptyComponent
          title="Failed to load projects"
          description="There was an error loading projects. Please try again."
          type="error"
          variant="ghost"
        />
      ) : projects.length === 0 ? (
        <EmptyComponent
          title="No projects yet"
          description="No projects have been submitted to this hackathon yet."
          type="info"
          variant="ghost"
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {transformedProjects.map((project, index) => (
            <motion.div
              key={project.key}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.215, 0.61, 0.355, 1],
                    delay: index * 0.05,
                  },
                },
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
