"use client";

import { useEnsName, useEnsAvatar } from "thirdweb/react";
import { useWeb3 } from "@/providers/web3-provider";

export interface UseEnsReturn {
  ensName: string | null;
  ensAvatar: string | null;
  displayName: string;
  initials: string;
  isLoading: boolean;
}

/**
 * Reusable hook for ENS name and avatar resolution
 * @param address - Ethereum address to resolve ENS for
 * @returns ENS data and display utilities
 */
export function useEns(address?: string): UseEnsReturn {
  const { client } = useWeb3();

  // ENS hooks from thirdweb
  const { data: ensName, isLoading: isLoadingName } = useEnsName({
    client,
    address,
  });

  const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
    client,
    ensName: ensName || undefined,
  });

  // Generate display utilities
  const displayName =
    ensName ||
    (address ? `${address.slice(0, 5)}...${address.slice(-7)}` : "Unknown");

  const initials = address ? address.slice(2, 4).toUpperCase() : "??";

  return {
    ensName: ensName || null,
    ensAvatar: ensAvatar || null,
    displayName,
    initials,
    isLoading: isLoadingName || isLoadingAvatar,
  };
}
