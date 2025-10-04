import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Hash } from "lucide-react";
import Link from "next/link";

interface IPFSHashDisplayProps {
  ipfsHash: string;
  label?: string;
  className?: string;
}

/**
 * Component to display IPFS hash with click functionality to open in new window
 */
export function IPFSHashDisplay({
  ipfsHash,
  label = "IPFS Metadata",
  className = "",
}: IPFSHashDisplayProps) {
  return (
    <Link
      className={`flex justify-between items-center ${className}`}
      href={`https://ipfs.io/ipfs/${ipfsHash}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge
        variant="outline"
        className="text-xs font-mono cursor-pointer border-primary hover:bg-primary/10 text-primary transition-colors"
      >
        {label}: {`${ipfsHash.slice(0, 3)}...${ipfsHash.slice(-4)}`}{" "}
        <ExternalLink className="size-3" />
      </Badge>
    </Link>
  );
}
