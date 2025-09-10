"use client";

import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

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
  return (
    <ConnectButton
      client={client}
      connectModal={{ size: "compact" }}
      wallets={wallets}
    />
  );
}
