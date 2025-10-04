"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, UserCheck, Clock, CheckCircle } from "lucide-react";
import { InlineLoading } from "@/components/ui/global-loading";
import Link from "next/link";
import { ProjectSubmissionDialog } from "./project-submission-dialog";
import { useActiveAccount } from "thirdweb/react";
import { useSendTransaction } from "thirdweb/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useHackathonRegistration,
  useRegisterForHackathon,
} from "@/hooks/use-hackathons";
import { getUIHackathonStatus } from "@/lib/helpers/date";
import type { UIHackathon } from "@/types/hackathon";

interface RegistrationButtonProps {
  hackathonId: string;
  hackathon: UIHackathon;
}

export function RegistrationButton({
  hackathonId,
  hackathon,
}: RegistrationButtonProps) {
  const activeAccount = useActiveAccount();
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    data: isRegistered,
    isLoading: registrationLoading,
    refetch: refetchRegistration,
  } = useHackathonRegistration(hackathonId);

  const { prepareTransaction } = useRegisterForHackathon();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  // Auto-update current time every 30 seconds for dynamic status changes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Get current hackathon status (recalculated each render due to currentTime dependency)
  const hackathonStatus = getUIHackathonStatus({
    ...hackathon,
    votingPeriod: hackathon.votingPeriod || undefined,
  });

  // Check if submission is currently active (even if registration is technically still open)
  const isSubmissionActive = () => {
    const hackStartDate = hackathon.hackathonPeriod?.hackathonStartDate;
    const hackEndDate = hackathon.hackathonPeriod?.hackathonEndDate;

    if (!hackStartDate || !hackEndDate) return false;

    const startDate = new Date(hackStartDate);
    const endDate = new Date(hackEndDate);

    return currentTime >= startDate && currentTime < endDate;
  };

  const handleRegister = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsRegistering(true);
      const transaction = prepareTransaction(hackathonId);
      const result = await sendTransaction(transaction);
      toast.success("Successfully registered for hackathon!", {
        action: {
          label: "View on Explorer",
          onClick: () => {
            const explorerUrl = `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${result.transactionHash}`;
            window.open(explorerUrl, "_blank");
          },
        },
      });
      refetchRegistration(); // Refresh registration status
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error?.message || "Failed to register for hackathon");
    } finally {
      setIsRegistering(false);
    }
  };

  // Show appropriate UI based on hackathon status
  switch (hackathonStatus) {
    case "Coming Soon":
      return (
        <Button size="lg" variant="outline" disabled>
          <Clock className="size-4" />
          Registration Starts Soon
        </Button>
      );

    case "Registration Open":
      if (!activeAccount) {
        return (
          <Button size="lg" variant="outline" disabled>
            Connect Wallet to Participate
          </Button>
        );
      }

      if (registrationLoading) {
        return (
          <Button size="lg" disabled>
            <InlineLoading text="Checking Registration" size="sm" />
          </Button>
        );
      }

      // Check if submission is active (overrides registration status)
      if (isSubmissionActive() && isRegistered) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <UserCheck className="size-4" />
              You are registered for this hackathon
            </div>
            <div className="flex gap-2 justify-center">
              <ProjectSubmissionDialog hackathonId={hackathonId}>
                <Button size="lg">
                  Submit Project <ArrowRight className="size-4" />
                </Button>
              </ProjectSubmissionDialog>
              <Link href={`/projects/create?hackathon=${hackathonId}`}>
                <Button size="lg" variant="outline">
                  Create Project
                </Button>
              </Link>
            </div>
          </div>
        );
      }

      if (isRegistered) {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <UserCheck className="size-4" />
              You are registered for this hackathon
            </div>
            <Button size="lg" variant="outline" disabled>
              <Clock className="size-4" />
              Waiting for Submission Phase
            </Button>
          </div>
        );
      }

      return (
        <Button
          size="lg"
          onClick={handleRegister}
          disabled={isRegistering}
          variant="default"
        >
          {isRegistering ? "Registering..." : "Register to Participate"}
        </Button>
      );

    case "Registration Closed":
    case "Submission Starting":
      if (isRegistered) {
        // Check if we're actually in submission phase now (overrides status)
        if (isSubmissionActive()) {
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
                <UserCheck className="size-4" />
                You are registered for this hackathon
              </div>
              <div className="flex gap-2 justify-center">
                <ProjectSubmissionDialog hackathonId={hackathonId}>
                  <Button size="lg">
                    Submit Project <ArrowRight className="size-4" />
                  </Button>
                </ProjectSubmissionDialog>
                <Link href={`/projects/create?hackathon=${hackathonId}`}>
                  <Button size="lg" variant="outline">
                    Create Project
                  </Button>
                </Link>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <UserCheck className="size-4" />
              You are registered for this hackathon
            </div>
            <Button size="lg" variant="outline" disabled>
              <Clock className="size-4" />
              Waiting for Submission Phase
            </Button>
          </div>
        );
      }
      return (
        <Button size="lg" variant="outline" disabled>
          Registration Closed
        </Button>
      );

    case "Live":
      if (isRegistered) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <UserCheck className="size-4" />
              You are registered for this hackathon
            </div>
            <div className="flex gap-2 justify-center">
              <ProjectSubmissionDialog hackathonId={hackathonId}>
                <Button size="lg">
                  Submit Project <ArrowRight className="size-4" />
                </Button>
              </ProjectSubmissionDialog>
              <Link href={`/projects/create?hackathon=${hackathonId}`}>
                <Button size="lg" variant="outline">
                  Create Project
                </Button>
              </Link>
            </div>
          </div>
        );
      }
      return (
        <Button size="lg" variant="outline" disabled>
          Registration Closed - Hackathon in Progress
        </Button>
      );

    case "Voting":
      if (isRegistered) {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">
              <CheckCircle className="size-4" />
              Hackathon in Voting Phase
            </div>
            <Button size="lg" variant="outline" disabled>
              Submission Period Ended
            </Button>
          </div>
        );
      }
      return (
        <Button size="lg" variant="outline" disabled>
          Hackathon in Voting Phase
        </Button>
      );

    case "Ended":
      if (isRegistered) {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="size-4" />
              Hackathon Completed
            </div>
            <Button size="lg" variant="outline" disabled>
              Hackathon Ended
            </Button>
          </div>
        );
      }
      return (
        <Button size="lg" variant="outline" disabled>
          Hackathon Ended
        </Button>
      );

    default:
      return (
        <Button size="lg" variant="outline" disabled>
          Status Unknown
        </Button>
      );
  }
}
