"use client";

import { CreateHackathonForm } from "@/components/hackathon/creation/hackathon-creation-form";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { Button } from "@/components/ui/button";
import EmptyComponent from "@/components/empty";
import { useActiveAccount } from "thirdweb/react";
import { useState, useEffect } from "react";

export default function CreateHackathonPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const activeAccount = useActiveAccount();

  // Listen for loading state changes from the form
  useEffect(() => {
    const handleLoadingChange = (event: CustomEvent) => {
      setIsLoading(event.detail.isLoading);
    };

    const handleIPFSUploadChange = (event: CustomEvent) => {
      setIsUploadingToIPFS(event.detail.isUploadingToIPFS);
    };

    window.addEventListener(
      "hackathonLoadingChange",
      handleLoadingChange as EventListener,
    );
    window.addEventListener(
      "hackathonIPFSUploadChange",
      handleIPFSUploadChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "hackathonLoadingChange",
        handleLoadingChange as EventListener,
      );
      window.removeEventListener(
        "hackathonIPFSUploadChange",
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
      "stepper-create-hackathon",
    );
    console.log("🔍 Found stepper button:", stepperCreateButton);
    if (stepperCreateButton) {
      stepperCreateButton.click();
    }
  };

  // If wallet is not connected, show wallet connection prompt
  if (!activeAccount) {
    return (
      <div className="-mx-4 -my-4 md:-mx-6 md:-my-6">
        <StickyPageHeader
          title="Create Hackathon"
          subtitle="Connect your wallet to create a hackathon"
          backHref="/hackathons"
        />
        <div className="px-4 py-8 md:px-6">
          <EmptyComponent
            title="Wallet Required"
            description="Connect your wallet to create a hackathon."
            type="wallet-connect"
            variant="card"
          />
        </div>
      </div>
    );
  }

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
              disabled={isLoading || !activeAccount}
              className="min-w-[180px]"
            >
              {isLoading
                ? isUploadingToIPFS
                  ? "Uploading to IPFS..."
                  : "Creating Hackathon..."
                : "Create Hackathon"}
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
