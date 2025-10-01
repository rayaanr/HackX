"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, UserCheck, Clock, CheckCircle } from "lucide-react";
import { InlineLoading } from "@/components/ui/global-loading";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { useSendTransaction } from "thirdweb/react";
import { useState } from "react";
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

  const {
    data: isRegistered,
    isLoading: registrationLoading,
    refetch: refetchRegistration,
  } = useHackathonRegistration(hackathonId);

  const { prepareTransaction } = useRegisterForHackathon();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  // Get current hackathon status
  const hackathonStatus = getUIHackathonStatus({
    ...hackathon,
    votingPeriod: hackathon.votingPeriod || undefined,
  });

  const handleRegister = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsRegistering(true);
      const transaction = prepareTransaction(hackathonId);
      await sendTransaction(transaction);
      toast.success("Successfully registered for hackathon!");
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
          <Clock className="mr-2 h-4 w-4" />
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

      if (isRegistered) {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <UserCheck className="mr-2 h-4 w-4" />
              You are registered for this hackathon
            </div>
            <Button size="lg" variant="outline" disabled>
              <Clock className="mr-2 h-4 w-4" />
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
          {isRegistering ? (
            <InlineLoading text="Registering" size="sm" />
          ) : (
            "Register to Participate"
          )}
        </Button>
      );

    case "Registration Closed":
      if (isRegistered) {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <UserCheck className="mr-2 h-4 w-4" />
              You are registered for this hackathon
            </div>
            <Button size="lg" variant="outline" disabled>
              <Clock className="mr-2 h-4 w-4" />
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
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <UserCheck className="mr-2 h-4 w-4" />
              You are registered for this hackathon
            </div>
            <Link href={`/projects/create?hackathon=${hackathonId}`}>
              <Button size="lg" className="w-full">
                Submit Project <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
              <CheckCircle className="mr-2 h-4 w-4" />
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
              <CheckCircle className="mr-2 h-4 w-4" />
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
