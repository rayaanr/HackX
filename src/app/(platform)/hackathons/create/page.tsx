"use client";

import { CreateHackathonForm } from "@/components/hackathon/creation/hackathon-creation-form";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { Button } from "@/components/ui/button";
import { CircularLoader } from "@/components/ui/loader";
import { useState, useEffect } from "react";

export default function CreateHackathonPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Listen for loading state changes from the form
  useEffect(() => {
    const handleLoadingChange = (event: CustomEvent) => {
      setIsLoading(event.detail.isLoading);
    };

    window.addEventListener(
      "hackathonLoadingChange",
      handleLoadingChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "hackathonLoadingChange",
        handleLoadingChange as EventListener
      );
    };
  }, []);
  /**
   * Handler for the header Create button.
   *
   * This is non-submitting and only works by programmatically clicking
   * the stepper's Create button (which contains all the validation logic).
   * This prevents multiple submission paths and ensures consistent behavior.
   */
  const handleHeaderCreate = () => {
    console.log("🔴 Header Create button clicked!");
    // Find and trigger the stepper's create button
    const stepperCreateButton = document.getElementById(
      "stepper-create-hackathon"
    );
    console.log("🔍 Found stepper button:", stepperCreateButton);
    if (stepperCreateButton) {
      stepperCreateButton.click();
    }
  };
  return (
    <div className="-mx-4 -my-4 md:-mx-6 md:-my-6">
      <StickyPageHeader
        title="Create Hackathon"
        subtitle="Fill in the details to create your hackathon"
        backHref="/hackathons"
        actions={
          <>
            <Button type="button" variant="outline" disabled>
              Save Draft
            </Button>
            <Button
              type="button"
              id="header-create-hackathon"
              onClick={handleHeaderCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularLoader size="sm" className="mr-2" />
                  Creating Hackathon...
                </>
              ) : (
                "Create Hackathon"
              )}
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
