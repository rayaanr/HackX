"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { ReactNode, createContext, useContext } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import type { ThirdwebContract } from "thirdweb";
import ABI from "@/constants/abi.json";

// Create Thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

// Define your chain (Base Sepolia testnet)
export const chain = defineChain(84532);

// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

// Get contract instance
export const contract = getContract({
  client,
  chain,
  address: CONTRACT_ADDRESS,
  abi: ABI as any,
});

// Web3 Context type
interface Web3ContextType {
  client: ReturnType<typeof createThirdwebClient>;
  chain: ReturnType<typeof defineChain>;
  contract: ThirdwebContract;
  contractAddress: string;
}

// Create Web3 context
const Web3Context = createContext<Web3ContextType | null>(null);

// Web3 context hook
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const web3ContextValue: Web3ContextType = {
    client,
    chain,
    contract,
    contractAddress: CONTRACT_ADDRESS,
  };

  return (
    <ThirdwebProvider>
      <Web3Context.Provider value={web3ContextValue}>
        {children}
      </Web3Context.Provider>
    </ThirdwebProvider>
  );
}
