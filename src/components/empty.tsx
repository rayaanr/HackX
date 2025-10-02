import { Trophy, Wallet, FolderIcon } from "lucide-react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { WalletConnect } from "./layout/wallet-connect";
import { ReactNode } from "react";

export default function EmptyComponent({
  title = "Nothing here",
  description = "This section is empty at the moment.",
  type = "info",
  variant = "card",
  icon,
  action,
  className,
}: {
  title: string;
  description: string;
  type: "info" | "wallet-connect" | "error";
  variant?: "card" | "ghost";
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const getIconComponent = () => {
    if (icon) return icon;

    const DefaultIcon =
      type === "info"
        ? Trophy
        : type === "wallet-connect"
          ? Wallet
          : FolderIcon;
    return <DefaultIcon className="size-12 text-white/50" />;
  };

  return (
    <Card
      className={`${
        variant === "ghost"
          ? "bg-transparent border-none"
          : "bg-card/20 border-border/50"
      } backdrop-blur-sm ${className || ""}`}
    >
      <CardContent className="text-center py-12">
        <div className="size-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
          {getIconComponent()}
        </div>
        <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
        {type === "wallet-connect" && <WalletConnect />}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}
