import { IconBell, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { WalletConnect } from "./wallet-connect";
import { useActiveAccount } from "thirdweb/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const account = useActiveAccount();

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
      className={cn(
        // Sticky inside the content area (excludes the sidebar automatically)
        "sticky top-0 z-40 h-(--header-height) flex items-center gap-2 shrink-0 w-full",
        "transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        // Dark gradients to match card hover theme
        "border-b border-white/10 backdrop-blur-xl bg-[#0a0a0a]/90",
        "relative",
        "before:absolute before:inset-0 before:bg-[linear-gradient(to_right,rgba(0,0,0,0.4),transparent_40%,transparent_60%,rgba(0,0,0,0.3))] before:pointer-events-none",
        "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_15%_50%,rgba(59,130,246,0.08),transparent_65%)] after:pointer-events-none",
      )}
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
          <ThemeToggle />
          {account && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full relative",
                "hover:bg-white/10 text-white/70 hover:text-white",
                "after:absolute after:-inset-px after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.12),transparent_70%)] after:opacity-0 hover:after:opacity-100 after:transition-opacity",
              )}
            >
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
