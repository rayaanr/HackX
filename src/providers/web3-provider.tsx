"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { ReactNode } from "react";

export function Web3Provider({ children }: { children: ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
