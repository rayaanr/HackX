"use client";

import { CreateHackathonForm } from "@/components/forms/create-hackathon-form";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { Button } from "@/components/ui/button";

export default function CreateHackathonPage() {
  return (
    <div className="-mx-4 -my-4 md:-mx-6 md:-my-6">
      <StickyPageHeader
        title="Create Hackathon"
        subtitle="Fill in the details to create your hackathon"
        backHref="/hackathons"
        actions={
          <>
            <Button type="button" variant="outline" form="create-hackathon-form">
              Save Draft
            </Button>
            <Button type="submit" form="create-hackathon-form">
              Create Hackathon
            </Button>
          </>
        }
      />
      <div className="px-4 py-8 md:px-6">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <CreateHackathonForm />
          </div>
        </div>
      </div>
    </div>
  );
}