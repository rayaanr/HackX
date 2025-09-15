"use client";

import { WalletConnect } from "@/components/layout/wallet-connect";

export default function Home() {
  // const account = useActiveAccount();
  // const router = useRouter();

  // useEffect(() => {
  //   if (account) {
  //     router.replace("/dashboard");
  //   }
  // }, [account, router]);

  // if (account) {
  //   return null; // Will redirect to dashboard
  // }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="max-w-md text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            HackX
          </h1>
          <p className="text-xl text-muted-foreground">
            The next generation hackathon platform
          </p>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to get started
          </p>
        </div>

        <div className="space-y-4">
          <WalletConnect />
        </div>
      </div>
    </div>
  );
}
