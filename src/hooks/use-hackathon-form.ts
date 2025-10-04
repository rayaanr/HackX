"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  hackathonSchema,
  HackathonFormData,
  validateDateConsistency,
} from "@/lib/schemas/hackathon-schema";
import { useCreateHackathon } from "@/hooks/use-create-hackathon";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Default form values
const getDefaultHackathonFormValues = (): HackathonFormData => ({
  name: "",
  shortDescription: "",
  registrationPeriod: {
    registrationStartDate: undefined,
    registrationEndDate: undefined,
  },
  hackathonPeriod: {
    hackathonStartDate: undefined,
    hackathonEndDate: undefined,
  },
  votingPeriod: {
    votingStartDate: undefined,
    votingEndDate: undefined,
  },
  techStack: [],
  experienceLevel: "all" as const,
  location: "",
  socialLinks: {
    website: "",
    discord: "",
    twitter: "",
    telegram: "",
    github: "",
  },
  fullDescription: "",
  prizeCohorts: [],
  judges: [],
  schedule: [],
});

// Form submission handlers
function createSuccessHandler(router: any) {
  return (data: {
    hackathonId: number;
    cid: string;
    transactionHash: string;
  }) => {
    // Navigation handled here, success notification handled in useCreateHackathon
    router.push("/hackathons");
  };
}

function createErrorHandler(router: any) {
  return (error: Error) => {
    console.error("Error creating hackathon:", error);

    // Handle wallet connection errors
    if (error.message.includes("Wallet not connected")) {
      toast.error("Please connect your wallet to create a hackathon");
      return;
    }

    // Handle transaction rejection
    if (error.message.includes("Transaction was rejected")) {
      toast.error(
        "Transaction rejected. Please approve the transaction to create your hackathon.",
      );
      return;
    }

    // Handle insufficient funds
    if (error.message.includes("insufficient funds")) {
      toast.error(
        "Insufficient funds for gas fees. Please add ETH to your wallet.",
      );
      return;
    }

    toast.error(error.message || "Failed to create hackathon");
  };
}

// Form validation handler
function validateHackathonForm(
  data: HackathonFormData,
  setError: any,
  clearErrors: any,
): boolean {
  // Validate date consistency (client-side pre-validation)
  const dateErrors = validateDateConsistency(data);
  if (Object.keys(dateErrors).length > 0) {
    console.log("Date validation errors:", dateErrors);
    // Set errors for date consistency issues
    Object.entries(dateErrors).forEach(([field, message]) => {
      setError(field as any, { type: "manual", message });
    });
    toast.error("Please fix the date validation errors");
    return false;
  }

  clearErrors();
  return true;
}

export function useHackathonForm() {
  const router = useRouter();

  const methods = useForm<HackathonFormData>({
    resolver: zodResolver(hackathonSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: getDefaultHackathonFormValues(),
  });

  const { handleSubmit, setError, clearErrors } = methods;

  // Create hackathon hook
  const { createHackathon, isCreating, isUploadingToIPFS, error } =
    useCreateHackathon();

  // Success and error handlers
  const handleCreateSuccess = createSuccessHandler(router);
  const handleCreateError = createErrorHandler(router);

  // Form submission handler
  const onSubmit = async (data: HackathonFormData) => {
    console.log("Form submitted with data:", data);

    // Dispatch loading state change
    window.dispatchEvent(
      new CustomEvent("hackathonLoadingChange", {
        detail: { isLoading: true },
      }),
    );

    // Dispatch IPFS upload state change
    window.dispatchEvent(
      new CustomEvent("hackathonIPFSUploadChange", {
        detail: { isUploadingToIPFS: true },
      }),
    );

    // Validate form
    if (!validateHackathonForm(data, setError, clearErrors)) {
      // Dispatch loading state change on validation failure
      window.dispatchEvent(
        new CustomEvent("hackathonLoadingChange", {
          detail: { isLoading: false },
        }),
      );

      // Dispatch IPFS upload state change on validation failure
      window.dispatchEvent(
        new CustomEvent("hackathonIPFSUploadChange", {
          detail: { isUploadingToIPFS: false },
        }),
      );
      return;
    }

    console.log("Creating hackathon...");

    try {
      const result = await createHackathon(data);

      if (result.success) {
        handleCreateSuccess({
          hackathonId: result.hackathonId!,
          cid: result.cid!,
          transactionHash: result.transactionHash!,
        });
      } else {
        handleCreateError(new Error(result.error || "Unknown error"));
      }
    } catch (err) {
      handleCreateError(err as Error);
    } finally {
      // Dispatch loading state change
      window.dispatchEvent(
        new CustomEvent("hackathonLoadingChange", {
          detail: { isLoading: false },
        }),
      );

      // Dispatch IPFS upload state change
      window.dispatchEvent(
        new CustomEvent("hackathonIPFSUploadChange", {
          detail: { isUploadingToIPFS: false },
        }),
      );
    }
  };

  // Form reset handler
  const resetForm = () => {
    methods.reset(getDefaultHackathonFormValues());
  };

  // Form validation checker
  const isFormValid = () => {
    return Object.keys(methods.formState.errors).length === 0;
  };

  return {
    methods,
    onSubmit: handleSubmit(onSubmit),
    rawOnSubmit: onSubmit, // Expose the raw submission function
    isSubmitting: isCreating,
    isUploadingToIPFS,
    isFormValid,
    resetForm,
    formState: methods.formState,
  };
}
