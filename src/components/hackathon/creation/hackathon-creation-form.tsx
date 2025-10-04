"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CreateHackathonStepper } from "./hackathon-creation-stepper";
import { useHackathonForm } from "@/hooks/use-hackathon-form";
import { getRandomMockHackathon } from "@/data/hackathon";
import { Shuffle, Info } from "lucide-react";
import { toast } from "sonner";

export function CreateHackathonForm() {
  const { methods, onSubmit, rawOnSubmit, isSubmitting, isUploadingToIPFS } =
    useHackathonForm();

  /**
   * IMPORTANT: This form is designed to prevent accidental submission.
   *
   * - All submission must go through the final "Create Hackathon" button in the stepper
   * - Enter key presses are blocked to prevent implicit form submission
   * - The form onSubmit handler is a no-op that prevents default behavior
   * - Only explicit user activation of the Create button will trigger hackathon creation
   */

  // Explicit creation handler that prevents automatic submission
  const handleCreateHackathon = () => {
    console.log("🚀 Create Hackathon button clicked!");

    // Use React Hook Form's handleSubmit with the raw submission function
    // This will validate the form and call rawOnSubmit if validation passes
    methods.handleSubmit(rawOnSubmit, (errors) => {
      console.error("❌ Form validation failed:", errors);
      toast.error("Please fill in all required fields", {
        description: "Check the form for missing or invalid fields",
      });
    })();
  };

  // Prevent implicit form submission - this is a safety net
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Do nothing - submission must be explicit via handleCreateHackathon
  };

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
              Testing Mode: Use mock data to quickly test the hackathon creation
              flow
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
        onSubmit={handleFormSubmit}
        className="space-y-8"
        onKeyDown={(e) => {
          /**
           * Prevent accidental form submission via Enter key.
           *
           * This handler blocks Enter from triggering implicit form submission
           * while still allowing Enter to work in specific contexts where it's expected.
           *
           * Elements that still allow Enter:
           * - TEXTAREA elements (for line breaks)
           * - Elements with data-allow-enter="true" attribute
           * - Elements with appropriate ARIA roles (combobox, listbox, menu)
           *
           * To opt into Enter handling for custom components:
           * - Add data-allow-enter="true" to the interactive element
           * - Or use appropriate ARIA roles like "combobox"
           */
          if (e.key === "Enter") {
            const target = e.target as HTMLElement;

            // Allow Enter for textareas and elements with explicit permission
            if (
              target.tagName === "TEXTAREA" ||
              target.dataset.allowEnter === "true" ||
              target.getAttribute("role") === "combobox" ||
              target.getAttribute("role") === "listbox" ||
              target.getAttribute("role") === "menu"
            ) {
              return;
            }

            // Prevent implicit form submission on all other Enter presses
            e.preventDefault();
          }
        }}
      >
        <CreateHackathonStepper
          isSubmitting={isSubmitting}
          isUploadingToIPFS={isUploadingToIPFS}
          onCreateHackathon={handleCreateHackathon}
        />
      </form>
    </Form>
  );
}
