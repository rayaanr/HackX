"use client";

import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
} from "lucide-react";
import { type UIHackathon } from "@/types/hackathon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { motion } from "motion/react";
import { safeToDate, formatDateRange } from "@/lib/helpers/date";
import Link from "next/link";

interface ScheduleTabProps {
  hackathon: UIHackathon;
}

function getEventStatus(
  startDate: Date,
  endDate: Date,
): "live" | "upcoming" | "completed" {
  const now = new Date();
  if (now >= startDate && now <= endDate) return "live";
  if (now < startDate) return "upcoming";
  return "completed";
}

interface SchedulePhase {
  name: string;
  status: "live" | "upcoming" | "completed";
  startDate: Date;
  endDate: Date;
  isPhase: boolean;
  description?: string;
  speaker?: {
    name: string;
    position?: string;
    xName?: string;
    xHandle?: string;
    picture?: string;
  };
}

export function ScheduleTab({ hackathon }: ScheduleTabProps) {
  const now = new Date();

  // Create main schedule phases from hackathon data
  const schedulePhases: SchedulePhase[] = [];

  // Registration Phase
  const regStartDate = safeToDate(
    hackathon.registrationPeriod?.registrationStartDate,
  );
  const regEndDate = safeToDate(
    hackathon.registrationPeriod?.registrationEndDate,
  );
  if (regStartDate && regEndDate) {
    const status = getEventStatus(regStartDate, regEndDate);
    schedulePhases.push({
      name: "Registration",
      status,
      startDate: regStartDate,
      endDate: regEndDate,
      isPhase: true,
    });
  }

  // Individual schedule events
  if (hackathon.schedule && hackathon.schedule.length > 0) {
    hackathon.schedule.forEach((event) => {
      const eventStartDate = safeToDate(event.startDateTime);
      const eventEndDate = safeToDate(event.endDateTime);
      if (eventStartDate && eventEndDate) {
        const status = getEventStatus(eventStartDate, eventEndDate);
        schedulePhases.push({
          name: event.name,
          status,
          startDate: eventStartDate,
          endDate: eventEndDate,
          isPhase: false,
          description: event.description,
          speaker: event.speaker,
        });
      }
    });
  }

  // Submission Phase
  const hackStartDate = safeToDate(
    hackathon.hackathonPeriod?.hackathonStartDate,
  );
  const hackEndDate = safeToDate(hackathon.hackathonPeriod?.hackathonEndDate);
  if (hackStartDate && hackEndDate) {
    const status = getEventStatus(hackStartDate, hackEndDate);
    schedulePhases.push({
      name: "Submission",
      status,
      startDate: hackStartDate,
      endDate: hackEndDate,
      isPhase: true,
    });
  }

  // Voting/Reward Phase
  const votingStartDate = safeToDate(hackathon.votingPeriod?.votingStartDate);
  const votingEndDate = safeToDate(hackathon.votingPeriod?.votingEndDate);
  if (votingStartDate && votingEndDate) {
    const status = getEventStatus(votingStartDate, votingEndDate);
    schedulePhases.push({
      name: "Reward Announcement",
      status,
      startDate: votingStartDate,
      endDate: votingEndDate,
      isPhase: true,
    });
  }

  // Sort by start date
  schedulePhases.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (schedulePhases.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Schedule
        </h2>
        <div className="border-dashed border-2 border-muted-foreground/20 rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-center">
              The schedule will be announced soon.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Find current active step
  const currentActiveStep = schedulePhases.findIndex((phase) => {
    return phase.status === "live";
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-1 text-center mx-auto">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-blue-600 bg-clip-text text-transparent">
          Schedule
        </h2>
        <p className="text-sm text-muted-foreground">
          Track the hackathon progress and important events
        </p>
      </div>

      <div className="flex justify-center w-full">
        <Timeline
          defaultValue={currentActiveStep >= 0 ? currentActiveStep + 1 : 1}
          orientation="vertical"
          className="w-full max-w-2xl mx-auto"
        >
          {schedulePhases.map((phase, index) => (
            <TimelineItem
              key={index}
              step={index + 1}
              className="group-data-[orientation=vertical]/timeline:sm:ms-32"
            >
              <TimelineHeader>
                <TimelineSeparator />
                <TimelineTitle className="sm:-mt-0.5 text-base font-semibold text-foreground">
                  {phase.name}
                  {phase.status === "live" && (
                    <span className="ml-2 text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full animate-pulse">
                      Live
                    </span>
                  )}
                </TimelineTitle>

                <TimelineIndicator className="bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none">
                  {phase.status === "completed" ? (
                    <CheckCircle2 className="size-7 fill-green-500 text-white" />
                  ) : phase.status === "live" ? (
                    <Play className="size-4 fill-blue-500 text-white animate-pulse" />
                  ) : (
                    <Circle className="size-7 text-muted-foreground" />
                  )}

                  {/* Glow effect for live events */}
                  {phase.status === "live" && (
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse -m-1" />
                  )}
                </TimelineIndicator>
              </TimelineHeader>
              <TimelineContent className="text-foreground mt-2 rounded-lg border px-4 py-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  {phase.description && (
                    <h4 className="leading-relaxed text-md font-semibold">
                      {phase.description}
                    </h4>
                  )}

                  {/* Duration info for events */}
                  {!phase.isPhase && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {phase.endDate.getTime() - phase.startDate.getTime() >
                        3600000
                          ? `${Math.round(
                              (phase.endDate.getTime() -
                                phase.startDate.getTime()) /
                                3600000,
                            )}h duration`
                          : `${Math.round(
                              (phase.endDate.getTime() -
                                phase.startDate.getTime()) /
                                60000,
                            )}min duration`}
                      </span>
                    </div>
                  )}

                  {/* Speaker info */}
                  {phase.speaker && (
                    <div className="flex items-center gap-2 pb-2">
                      <Avatar className="size-7 rounded-md">
                        <AvatarImage
                          src={phase.speaker.picture}
                          alt={phase.speaker.name}
                        />
                        <AvatarFallback className="text-xs">
                          {phase.speaker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <span className="font-medium text-foreground">
                          {phase.speaker.name}
                        </span>
                        {phase.speaker.position && (
                          <span className="text-muted-foreground ml-1">
                            • {phase.speaker.position}
                          </span>
                        )}
                      </div>
                      {phase.speaker.xHandle && (
                        <Link
                          href={`https://x.com/${phase.speaker.xHandle.replace(
                            "@",
                            "",
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          @{phase.speaker.xHandle.replace("@", "")}
                        </Link>
                      )}
                    </div>
                  )}
                </motion.div>

                <div className="flex items-center gap-2">
                  <TimelineDate className="text-foreground font-medium text-md">
                    {phase.startDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TimelineDate>

                  {phase.isPhase && phase.endDate && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}

                  {/* End date for phases */}
                  {phase.isPhase && phase.endDate && (
                    <TimelineDate className="text-foreground font-medium text-md">
                      {phase.endDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TimelineDate>
                  )}
                </div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </motion.div>
  );
}
