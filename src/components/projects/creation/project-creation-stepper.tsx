"use client";

import { defineStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import { OverviewStep } from "./project-overview-step";
import { TechStackStep } from "./project-tech-stack-step";
import { HackathonSelectionStep } from "./project-hackathon-selection-step";

const { Stepper } = defineStepper(
  {
    id: "overview",
    title: "Overview",
  },
  {
    id: "tech-stack",
    title: "Tech Stack",
  },
  {
    id: "hackathon",
    title: "Select Hackathon",
  },
);

interface CreateProjectStepperProps {
  isSubmitting?: boolean;
  isUploadingToIPFS?: boolean;
}

export function CreateProjectStepper({
  isSubmitting = false,
  isUploadingToIPFS = false,
}: CreateProjectStepperProps) {
  return (
    <div className="flex w-full flex-col gap-8">
      <Stepper.Provider
        className="space-y-4"
        variant="horizontal"
        labelOrientation="horizontal"
      >
        {({ methods }) => (
          <Fragment>
            <Stepper.Navigation>
              {methods.all.map((step) => (
                <Stepper.Step
                  key={step.id}
                  of={step.id}
                  onClick={() => methods.goTo(step.id)}
                >
                  <Stepper.Title>{step.title}</Stepper.Title>
                </Stepper.Step>
              ))}
            </Stepper.Navigation>
            {methods.switch({
              overview: () => (
                <Stepper.Panel>
                  <OverviewStep />
                </Stepper.Panel>
              ),
              "tech-stack": () => (
                <Stepper.Panel>
                  <TechStackStep />
                </Stepper.Panel>
              ),
              hackathon: () => (
                <Stepper.Panel>
                  <HackathonSelectionStep />
                </Stepper.Panel>
              ),
            })}
            <Stepper.Controls>
              {methods.isLast && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={methods.reset}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              )}
              {!methods.isFirst && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={methods.prev}
                  disabled={methods.isFirst || isSubmitting}
                >
                  Previous
                </Button>
              )}
              {methods.isLast ? (
                <Button
                  type="button"
                  onClick={() => {
                    // Trigger the hidden form submit button
                    const submitButton = document.getElementById(
                      "stepper-create-project",
                    );
                    if (submitButton) {
                      submitButton.click();
                    }
                  }}
                  disabled={isSubmitting}
                  className="min-w-[180px]"
                >
                  {isSubmitting
                    ? isUploadingToIPFS
                      ? "Uploading to IPFS..."
                      : "Creating Project..."
                    : "Create Project"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={methods.next}
                  disabled={isSubmitting}
                >
                  Next
                </Button>
              )}
            </Stepper.Controls>
          </Fragment>
        )}
      </Stepper.Provider>
    </div>
  );
}
