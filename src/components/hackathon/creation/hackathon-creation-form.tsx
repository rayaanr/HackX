"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CreateHackathonStepper } from "./hackathon-creation-stepper";
import { useHackathonForm } from "@/hooks/useHackathonForm";
import { getRandomMockHackathon } from "@/data/hackathon";
import { Shuffle, Info } from "lucide-react";
import { toast } from "sonner";

export function CreateHackathonForm() {
  const { methods, onSubmit, isSubmitting } = useHackathonForm();

  const handleFillMockData = () => {
    const mockData = getRandomMockHackathon();
    methods.reset(mockData);
    toast.success(`Form filled with "${mockData.name}" mock data!`);
  };

  return (
    <Form {...methods}>
      {/* Mock Data Controls */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Testing Mode: Use mock data to quickly test the hackathon creation flow
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFillMockData}
            className="gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Fill with Mock Data
          </Button>
        </div>
      </div>

      <form
        id="create-hackathon-form"
        onSubmit={onSubmit}
        className="space-y-8"
        onKeyDown={(e) => {
          // Prevent form submission on Enter key press (except in textareas)
          if (
            e.key === "Enter" &&
            e.target instanceof HTMLElement &&
            e.target.tagName !== "TEXTAREA"
          ) {
            e.preventDefault();
          }
        }}
      >
        <CreateHackathonStepper isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}
