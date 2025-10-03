import { IconBell, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletConnect } from "./wallet-connect";
import { useActiveAccount } from "thirdweb/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const account = useActiveAccount();
  const { state, isMobile } = useSidebar();

  const easeHeader: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
  const fade = {
    hidden: { opacity: 0, y: -6 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 + i * 0.05, duration: 0.4, ease: easeHeader },
    }),
  } as const;

  return (
    <header
      style={
        {
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          zIndex: 99999,
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          marginLeft:
            !isMobile && state === "expanded"
              ? "16rem"
              : !isMobile && state === "collapsed"
                ? "3rem"
                : "0",
          transition: "margin-left 200ms ease-linear",
        } as React.CSSProperties
      }
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 relative z-10">
        <motion.div
          className="relative flex-1 max-w-md"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fade}
        >
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search..."
            className={cn(
              "pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40",
              "focus-visible:ring-1 focus-visible:ring-primary/60 focus-visible:border-primary/40",
              "hover:bg-white/[0.07] transition-colors",
            )}
          />
        </motion.div>

        <motion.div
          className="ml-auto flex items-center gap-3"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fade}
        >
          {account && (
            <Button variant="ghost" size="icon" disabled>
              <IconBell className="size-4" />
            </Button>
          )}
          <WalletConnect />
        </motion.div>
      </div>
      {/* Subtle bottom fade for content separation */}
      <div className="pointer-events-none absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </header>
  );
}
