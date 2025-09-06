"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (
    text: string,
    options?: {
      successMessage?: string | false;
      errorMessage?: string | false;
    },
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (options?.successMessage !== false) {
        toast.success(options?.successMessage || "Copied to clipboard");
      }

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);

      return true;
    } catch (err) {
      console.error("Failed to copy text: ", err);

      if (options?.errorMessage !== false) {
        toast.error(options?.errorMessage || "Failed to copy to clipboard");
      }

      return false;
    }
  };

  return {
    copied,
    copy,
  };
}
