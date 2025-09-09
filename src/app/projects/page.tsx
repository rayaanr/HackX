import { Suspense } from "react";
import { ActiveProjects } from "@/components/projects/display/active-projects";
import { RegisteredHackathons } from "@/components/projects/display/registered-hackathons";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div>Loading active projects...</div>}>
        <ActiveProjects />
      </Suspense>

      <Suspense fallback={<div>Loading registered hackathons...</div>}>
        <RegisteredHackathons />
      </Suspense>
    </div>
  );
}
