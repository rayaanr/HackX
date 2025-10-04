"use client";

import { defineStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import { OverviewStep } from "./hackathon-overview-step";
import { PrizesStep } from "./hackathon-prizes-step";
import { JudgesStep } from "./hackathon-judges-step";
import { ScheduleStep } from "./hackathon-schedule-step";

const { Stepper } = defineStepper(
  {
    id: "overview",
    title: "Overview",
  },
  {
    id: "prizes",
    title: "Prizes",
  },
  {
    id: "judges",
    title: "Judges",
  },
  {
    id: "schedule",
    title: "Schedule",
  },
);

interface CreateHackathonStepperProps {
  isSubmitting?: boolean;
  isUploadingToIPFS?: boolean;
  onCreateHackathon?: () => void;
}

export function CreateHackathonStepper({
  isSubmitting = false,
  isUploadingToIPFS = false,
  onCreateHackathon,
}: CreateHackathonStepperProps) {
  return (
    <div className="flex w-full flex-col gap-8">
      <Stepper.Provider
        className="space-y-8"
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
              prizes: () => (
                <Stepper.Panel>
                  <PrizesStep />
                </Stepper.Panel>
              ),
              judges: () => (
                <Stepper.Panel>
                  <JudgesStep />
                </Stepper.Panel>
              ),
              schedule: () => (
                <Stepper.Panel>
                  <ScheduleStep />
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
                  id="stepper-create-hackathon"
                  onClick={() => {
                    console.log(
                      "🔥 Stepper Create button clicked, onCreateHackathon:",
                      typeof onCreateHackathon,
                    );
                    onCreateHackathon?.();
                  }}
                  disabled={isSubmitting}
                  className="min-w-[180px]"
                >
                  {isSubmitting
                    ? isUploadingToIPFS
                      ? "Uploading to IPFS..."
                      : "Creating Hackathon..."
                    : "Create Hackathon"}
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
