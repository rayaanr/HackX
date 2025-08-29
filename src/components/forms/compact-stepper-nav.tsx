"use client";

import { cn } from "@/lib/utils";

interface CompactStepperNavProps {
  steps: Array<{
    id: string;
    title: string;
  }>;
  currentStep: string;
  onStepClick: (stepId: string) => void;
  className?: string;
}

export function CompactStepperNav({
  steps,
  currentStep,
  onStepClick,
  className
}: CompactStepperNavProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;
        const isClickable = index <= currentIndex || isCompleted;

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick(step.id)}
            disabled={!isClickable}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isActive && "bg-primary text-primary-foreground",
              isCompleted && !isActive && "bg-muted text-muted-foreground hover:bg-muted/80",
              !isActive && !isCompleted && "text-muted-foreground hover:text-foreground"
            )}
          >
            {step.title}
          </button>
        );
      })}
    </nav>
  );
}