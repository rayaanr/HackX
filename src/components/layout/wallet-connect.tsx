"use client";

import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { useWeb3 } from "@/providers/web3-provider";
import {
  useActiveAccount,
  useDisconnect,
  useActiveWallet,
} from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEns } from "@/hooks/use-ens";

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "farcaster",
        "email",
        "x",
        "passkey",
        "phone",
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

export function WalletConnect() {
  const { client } = useWeb3();
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  // Use the reusable ENS hook
  const { ensName, ensAvatar, displayName, initials } = useEns(
    account?.address,
  );

  const handleDisconnect = () => {
    if (wallet) {
      disconnect(wallet);
    }
  };

  if (account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 h-9 px-3 bg-background hover:bg-accent border-border"
          >
            <Avatar className="size-6 rounded-sm">
              {ensAvatar && (
                <AvatarImage src={ensAvatar} alt={ensName || "ENS Avatar"} />
              )}
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block font-medium">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                Connected Wallet
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {account.address}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10"
          >
            <LogOut className="mr-2 size-4 text-red-500" />
            <span className="text-red-500">Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="connect-button-wrapper">
      <ConnectButton
        client={client}
        connectModal={{ size: "compact" }}
        wallets={wallets}
        connectButton={{
          style: {
            borderRadius: "calc(var(--radius) - 2px)",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            height: "2.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease-in-out",
          },
        }}
      />
      <style jsx>{`
        .tw-connect-wallet :global(button:hover) {
          background-color: hsl(var(--accent)) !important;
          color: white !important;
        }
        .tw-connect-wallet :global(button:focus) {
          outline: 2px solid hsl(var(--ring)) !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  );
}
