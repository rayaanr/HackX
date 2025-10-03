"use client";

import { CreateHackathonForm } from "@/components/hackathon/creation/hackathon-creation-form";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { Button } from "@/components/ui/button";
import { CircularLoader } from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import EmptyComponent from "@/components/empty";
import { useActiveAccount } from "thirdweb/react";
import { Wallet, Shield, Zap } from "lucide-react";
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
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Wallet Required</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    To create a hackathon, you need to connect your wallet. This
                    ensures:
                  </p>
                  <div className="space-y-3 mb-8 text-left">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        Secure ownership and management of your hackathon
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm">
                        On-chain verification and transparency
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <span className="text-sm">
                        Ability to manage prizes and payments
                      </span>
                    </div>
                  </div>
                  <EmptyComponent
                    title="Connect your wallet"
                    description="Connect your wallet to create hackathons"
                    type="wallet-connect"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
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
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <CircularLoader size="sm" className="border-white mr-2" />
                  <span>
                    {isUploadingToIPFS
                      ? "Uploading to IPFS..."
                      : "Creating Hackathon..."}
                  </span>
                </div>
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
