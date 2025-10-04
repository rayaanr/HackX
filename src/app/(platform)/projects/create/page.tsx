"use client";

import { CreateProjectForm } from "@/components/projects/creation/project-creation-form";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function CreateProjectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);

  // Listen for loading state changes from the form
  useEffect(() => {
    const handleLoadingChange = (event: CustomEvent) => {
      setIsLoading(event.detail.isLoading);
    };

    const handleIPFSUploadChange = (event: CustomEvent) => {
      setIsUploadingToIPFS(event.detail.isUploadingToIPFS);
    };

    window.addEventListener(
      "projectLoadingChange",
      handleLoadingChange as EventListener,
    );
    window.addEventListener(
      "projectIPFSUploadChange",
      handleIPFSUploadChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "projectLoadingChange",
        handleLoadingChange as EventListener,
      );
      window.removeEventListener(
        "projectIPFSUploadChange",
        handleIPFSUploadChange as EventListener,
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
      "stepper-create-project",
    );
    console.log("🔍 Found stepper button:", stepperCreateButton);
    if (stepperCreateButton) {
      stepperCreateButton.click();
    }
  };

  /**
   * Handler for the Fill with Mock Data button.
   */
  const handleFillMockData = () => {
    // Find and trigger the form's mock data button
    const mockDataButton = document.getElementById("fill-mock-data-project");
    if (mockDataButton) {
      mockDataButton.click();
    }
  };

  return (
    <div className="-mx-4 -my-4 md:-mx-6 md:-my-6">
      <StickyPageHeader
        title="Create Project"
        subtitle="Fill in the details to create your project"
        backHref="/projects"
        actions={
          <>
            <Button type="button" variant="outline" disabled>
              Save Draft
            </Button>
            <Button
              type="button"
              id="header-create-project"
              onClick={handleHeaderCreate}
              disabled={isLoading}
              className="min-w-[180px]"
            >
              {isLoading
                ? isUploadingToIPFS
                  ? "Uploading to IPFS..."
                  : "Creating Project..."
                : "Create Project"}
            </Button>
          </>
        }
      />
      <div className="px-4 py-8 md:px-6">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <CreateProjectForm />
          </div>
        </div>
      </div>
    </div>
  );
}
