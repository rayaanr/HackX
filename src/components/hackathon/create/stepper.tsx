"use client";

import { defineStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import { OverviewStep } from "./steps/overview";
import { PrizesStep } from "./steps/prizes";
import { JudgesStep } from "./steps/judges";
import { ScheduleStep } from "./steps/schedule";

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
  }
);

export function CreateHackathonStepper() {
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
              {!methods.isFirst && (
                <Button
                  variant="secondary"
                  onClick={methods.prev}
                  disabled={methods.isFirst}
                >
                  Previous
                </Button>
              )}
              <Button onClick={methods.isLast ? methods.reset : methods.next}>
                {methods.isLast ? "Reset" : "Next"}
              </Button>
            </Stepper.Controls>
          </Fragment>
        )}
      </Stepper.Provider>
    </div>
  );
}