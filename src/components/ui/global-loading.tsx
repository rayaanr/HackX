"use client";

import { cn } from "@/lib/utils";
import { ClassicLoader, TextShimmerLoader } from "./loader";

export interface GlobalLoadingProps {
  /**
   * Layout variant for different contexts
   * - "inline": Small inline loader for buttons, forms, etc.
   * - "component": Loader for component-level loading states
   * - "page": Full page center loading with text
   * - "card": Loading state for cards/containers
   */
  variant?: "inline" | "component" | "page" | "card";

  /**
   * Size of the loader
   */
  size?: "sm" | "md" | "lg";

  /**
   * Loading text to display (uses shimmer effect)
   */
  text?: string;

  /**
   * Custom className for styling
   */
  className?: string;

  /**
   * Height for card/component variants
   */
  height?: string;

  /**
   * Show only the loader without text
   */
  loaderOnly?: boolean;
}

export function GlobalLoading({
  variant = "component",
  size = "md",
  text,
  className,
  height,
  loaderOnly = false,
}: GlobalLoadingProps) {
  const getDefaultText = () => {
    switch (variant) {
      case "inline":
        return undefined;
      case "component":
        return "Loading";
      case "page":
        return "Loading";
      case "card":
        return "Loading";
      default:
        return "Loading";
    }
  };

  const displayText = text ?? getDefaultText();

  // Inline variant - small loader for buttons, forms, etc.
  if (variant === "inline") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <ClassicLoader size={size} />
        {displayText && !loaderOnly && (
          <TextShimmerLoader text={displayText} size={size} />
        )}
      </div>
    );
  }

  // Page variant - full page center loading
  if (variant === "page") {
    return (
      <div
        className={cn(
          "flex min-h-screen w-full flex-col items-center justify-center gap-4",
          className,
        )}
      >
        <ClassicLoader size="lg" />
        {displayText && !loaderOnly && (
          <TextShimmerLoader text={displayText} size="lg" />
        )}
      </div>
    );
  }

  // Card variant - loading state for cards/containers
  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-lg border bg-card p-8",
          height,
          className,
        )}
        style={{ minHeight: height }}
      >
        <ClassicLoader size={size} />
        {displayText && !loaderOnly && (
          <TextShimmerLoader text={displayText} size={size} />
        )}
      </div>
    );
  }

  // Component variant (default) - loader for component-level loading states
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 py-8",
        height,
        className,
      )}
      style={{ minHeight: height }}
    >
      <ClassicLoader size={size} />
      {displayText && !loaderOnly && (
        <TextShimmerLoader text={displayText} size={size} />
      )}
    </div>
  );
}

// Convenience components for common use cases
export function PageLoading({
  text = "Loading",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return <GlobalLoading variant="page" text={text} className={className} />;
}

export function ComponentLoading({
  text = "Loading",
  size = "md",
  height,
  className,
}: {
  text?: string;
  size?: "sm" | "md" | "lg";
  height?: string;
  className?: string;
}) {
  return (
    <GlobalLoading
      variant="component"
      text={text}
      size={size}
      height={height}
      className={className}
    />
  );
}

export function CardLoading({
  text = "Loading",
  size = "md",
  height = "200px",
  className,
}: {
  text?: string;
  size?: "sm" | "md" | "lg";
  height?: string;
  className?: string;
}) {
  return (
    <GlobalLoading
      variant="card"
      text={text}
      size={size}
      height={height}
      className={className}
    />
  );
}

export function InlineLoading({
  text,
  size = "sm",
  loaderOnly = false,
  className,
}: {
  text?: string;
  size?: "sm" | "md" | "lg";
  loaderOnly?: boolean;
  className?: string;
}) {
  return (
    <GlobalLoading
      variant="inline"
      text={text}
      size={size}
      loaderOnly={loaderOnly}
      className={className}
    />
  );
}
