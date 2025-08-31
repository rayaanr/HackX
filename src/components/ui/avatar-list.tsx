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
  const displayCount = Math.min(images.length, 4);
  const displayedImages = images.slice(0, displayCount);
  const remainingCount =
    (totalCount || images.length) - displayCount + (additionalCount || 0);

  return (
    <div
      className={cn(
        "bg-background flex items-center rounded-full border p-1 shadow-sm",
        className
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
      {remainingCount > 0 && (
        <button className="text-muted-foreground hover:text-foreground flex items-center justify-center rounded-full bg-transparent px-2 py-1 text-xs shadow-none hover:bg-transparent">
          +{remainingCount}
        </button>
      )}
    </div>
  );
}
