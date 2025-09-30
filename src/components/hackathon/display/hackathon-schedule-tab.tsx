"use client";

import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Play,
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
import { motion } from "framer-motion";
import { safeToDate } from "@/lib/helpers/date";

interface ScheduleTabProps {
  hackathon: UIHackathon;
}

function getEventStatus(
  startDate: Date,
  endDate: Date
): "live" | "upcoming" | "completed" {
  const now = new Date();
  if (now >= startDate && now <= endDate) return "live";
  if (now < startDate) return "upcoming";
  return "completed";
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const start = startDate.toLocaleDateString("en-US", formatOptions);
  const end = endDate.toLocaleDateString("en-US", formatOptions);

  return `${start} - ${end}`;
}

function formatSingleDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    hackathon.registrationPeriod?.registrationStartDate
  );
  const regEndDate = safeToDate(
    hackathon.registrationPeriod?.registrationEndDate
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
    hackathon.hackathonPeriod?.hackathonStartDate
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
      <div className="space-y-1">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Schedule
        </h2>
        <p className="text-sm text-muted-foreground">
          Track the hackathon progress and important events
        </p>
      </div>

      <Timeline
        defaultValue={currentActiveStep >= 0 ? currentActiveStep + 1 : 1}
        orientation="vertical"
        className="w-full max-w-2xl"
      >
        {schedulePhases.map((phase, index) => (
          <TimelineItem key={index} step={index + 1} className="pb-4">
            <TimelineIndicator className="relative bg-background border-2">
              {phase.status === "completed" ? (
                <CheckCircle2 className="h-2.5 w-2.5 fill-green-500 text-white" />
              ) : phase.status === "live" ? (
                <Play className="h-2.5 w-2.5 fill-blue-500 text-white animate-pulse" />
              ) : (
                <Circle className="h-2.5 w-2.5 text-muted-foreground" />
              )}

              {/* Glow effect for live events */}
              {phase.status === "live" && (
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse -m-1" />
              )}
            </TimelineIndicator>

            <TimelineSeparator />

            <TimelineHeader className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <TimelineDate className="text-xs text-muted-foreground">
                  {phase.startDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TimelineDate>

                <TimelineTitle className="text-base font-semibold text-foreground">
                  {phase.name}
                </TimelineTitle>

                <TimelineContent className="space-y-2">
                  {phase.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {phase.description}
                    </p>
                  )}

                  {/* Time and duration info for events */}
                  {!phase.isPhase && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {phase.endDate.getTime() - phase.startDate.getTime() >
                          3600000
                            ? `${Math.round(
                                (phase.endDate.getTime() -
                                  phase.startDate.getTime()) /
                                  3600000
                              )}h`
                            : `${Math.round(
                                (phase.endDate.getTime() -
                                  phase.startDate.getTime()) /
                                  60000
                              )}min`}
                        </span>
                      </div>
                      <span>
                        {phase.startDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {phase.endDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  {/* End date for phases */}
                  {phase.isPhase && phase.endDate && (
                    <div className="text-xs text-muted-foreground">
                      Ends{" "}
                      {phase.endDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  )}

                  {/* Speaker info */}
                  {phase.speaker && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
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
                    </div>
                  )}
                </TimelineContent>
              </motion.div>
            </TimelineHeader>
          </TimelineItem>
        ))}
      </Timeline>
    </motion.div>
  );
}
