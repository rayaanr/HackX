import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarListProps {
  images: { src: string; alt: string }[];
  totalCount?: number;
  additionalCount?: number;
  className?: string;
}

export function AvatarList({
  images,
  totalCount,
  additionalCount = 0,
  className,
}: AvatarListProps) {
  const actualTotal = totalCount !== undefined ? totalCount : images.length;
  const displayCount = Math.min(images.length, 4); // Always show up to 4 avatars
  const displayedImages = images.slice(0, displayCount);

  // Show the exact count if totalCount is provided, otherwise calculate remaining
  const remainingCount =
    totalCount !== undefined
      ? Math.max(0, actualTotal - displayCount + (additionalCount || 0))
      : Math.max(0, images.length - displayCount + (additionalCount || 0));

  return (
    <div
      className={cn(
        "bg-background flex items-center rounded-full border p-1 shadow-sm",
        className,
      )}
    >
      <div className="flex -space-x-3">
        {displayedImages.map((image, index) => (
          <Avatar key={index} className="ring-background rounded-full size-7">
            <AvatarImage src={image.src} alt={image.alt} />
            <AvatarFallback>{image.alt.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {totalCount !== undefined ? (
        <span
          className="text-muted-foreground flex items-center justify-center rounded-full px-2 py-1 text-xs"
          aria-label={`${actualTotal} participants`}
          title={`${actualTotal} participants`}
        >
          {actualTotal}
        </span>
      ) : (
        remainingCount > 0 && (
          <span
            className="text-muted-foreground flex items-center justify-center rounded-full px-2 py-1 text-xs"
            aria-label={`${remainingCount} more`}
            title={`${remainingCount} more`}
          >
            {remainingCount}
          </span>
        )
      )}
    </div>
  );
}
