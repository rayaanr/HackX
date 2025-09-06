import { Suspense } from "react";
import { ActiveProjects } from "@/components/projects/active-projects";
import { RegisteredHackathons } from "@/components/projects/registered-hackathons";

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
