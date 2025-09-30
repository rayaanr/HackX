"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, UserCheck } from "lucide-react";
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

interface RegistrationButtonProps {
  hackathonId: string;
}

export function RegistrationButton({ hackathonId }: RegistrationButtonProps) {
  const activeAccount = useActiveAccount();
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    data: isRegistered,
    isLoading: registrationLoading,
    refetch: refetchRegistration,
  } = useHackathonRegistration(hackathonId);

  const { prepareTransaction } = useRegisterForHackathon();
  const { mutateAsync: sendTransaction } = useSendTransaction();

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
        <Link href={`/projects/create?hackathon=${hackathonId}`}>
          <Button size="lg" className="w-full">
            Start Submit <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
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
}
