"use client";

import { Trophy, Wallet } from "lucide-react";
import { WalletConnect } from "@/components/layout/wallet-connect";
import { Card, CardContent } from "@/components/ui/card";

interface WalletConnectionPromptProps {
  title?: string;
  description?: string;
}

export function WalletConnectionPrompt({
  title = "Connect your wallet",
  description = "Connect your wallet to view and manage your projects",
}: WalletConnectionPromptProps) {
  return (
    <div className="col-span-full text-center py-12 max-w-md mx-auto">
      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
        <Wallet className="w-12 h-12 text-white/50" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <WalletConnect />
    </div>
  );
}


