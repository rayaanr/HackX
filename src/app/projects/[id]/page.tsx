"use client";

import { CreateProjectForm } from "@/components/projects/creation/project-creation-form";

export default function CreateProjectPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create Project</h1>
        <p className="text-muted-foreground mb-8">
          Fill in the details to create your project
        </p>
        <CreateProjectForm />
      </div>
    </div>
  );
}
