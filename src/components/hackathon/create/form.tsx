"use client";

import { Form } from "@/components/ui/form";
import { CreateHackathonStepper } from "./stepper";
import { useHackathonForm } from "@/hooks/useHackathonForm";
export function CreateHackathonForm() {
  const { methods, onSubmit, isSubmitting } = useHackathonForm();

  return (
    <Form {...methods}>
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
        <CreateHackathonStepper
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
}
