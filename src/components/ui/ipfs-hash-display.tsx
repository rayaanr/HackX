import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getPinataGatewayUrl } from "@/lib/helpers/pinata";

interface IPFSHashDisplayProps {
  ipfsHash: string;
  label?: string;
  className?: string;
}

/**
 * Component to display IPFS hash with click functionality to open in new window
 * Uses Pinata custom gateway for reliable access
 */
export function IPFSHashDisplay({
  ipfsHash,
  label = "IPFS Metadata",
  className = "",
}: IPFSHashDisplayProps) {
  return (
    <Link
      className={`flex justify-between items-center ${className}`}
      href={getPinataGatewayUrl(ipfsHash)}
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
