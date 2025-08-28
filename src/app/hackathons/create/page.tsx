"use client";

import { CreateHackathonForm } from "@/components/forms/create-hackathon-form";

export default function CreateHackathonPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create Hackathon</h1>
        <p className="text-muted-foreground mb-8">
          Fill in the details to create your hackathon
        </p>
        <CreateHackathonForm />
      </div>
    </div>
  );
}