import { IconBell, IconSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { WalletConnect } from "./wallet-connect";
import { useActiveAccount } from "thirdweb/react";

export function SiteHeader() {
  const account = useActiveAccount();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" />
        </div>

        {/* Right side icons and user */}
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          {account && (
            <Button variant="ghost" size="icon" className="rounded-full">
              <IconBell className="size-4" />
            </Button>
          )}
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
