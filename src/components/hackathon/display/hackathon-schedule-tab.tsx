import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { type UIHackathon } from "@/types/hackathon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  if (
    hackathon.registrationPeriod?.registrationStartDate &&
    hackathon.registrationPeriod?.registrationEndDate
  ) {
    const status = getEventStatus(
      hackathon.registrationPeriod.registrationStartDate,
      hackathon.registrationPeriod.registrationEndDate,
    );
    schedulePhases.push({
      name: "Registration",
      status,
      startDate: hackathon.registrationPeriod.registrationStartDate,
      endDate: hackathon.registrationPeriod.registrationEndDate,
      isPhase: true,
    });
  }

  // Individual schedule events
  if (hackathon.schedule && hackathon.schedule.length > 0) {
    hackathon.schedule.forEach((event) => {
      const status = getEventStatus(event.startDateTime, event.endDateTime);
      schedulePhases.push({
        name: event.name,
        status,
        startDate: event.startDateTime,
        endDate: event.endDateTime,
        isPhase: false,
        description: event.description,
        speaker: event.speaker,
      });
    });
  }

  // Submission Phase
  if (
    hackathon.hackathonPeriod?.hackathonStartDate &&
    hackathon.hackathonPeriod?.hackathonEndDate
  ) {
    const status = getEventStatus(
      hackathon.hackathonPeriod.hackathonStartDate,
      hackathon.hackathonPeriod.hackathonEndDate,
    );
    schedulePhases.push({
      name: "Submission",
      status,
      startDate: hackathon.hackathonPeriod.hackathonStartDate,
      endDate: hackathon.hackathonPeriod.hackathonEndDate,
      isPhase: true,
    });
  }

  // Voting/Reward Phase
  if (
    hackathon.votingPeriod?.votingStartDate &&
    hackathon.votingPeriod?.votingEndDate
  ) {
    const status = getEventStatus(
      hackathon.votingPeriod.votingStartDate,
      hackathon.votingPeriod.votingEndDate,
    );
    schedulePhases.push({
      name: "Reward Announcement",
      status,
      startDate: hackathon.votingPeriod.votingStartDate,
      endDate: hackathon.votingPeriod.votingEndDate,
      isPhase: true,
    });
  }

  // Sort by start date
  schedulePhases.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (schedulePhases.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <p className="text-muted-foreground">
          The schedule will be announced soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Schedule</h2>
      <Accordion type="multiple" className="space-y-2">
        {schedulePhases.map((phase, index) => (
          <AccordionItem
            key={index}
            value={`phase-${index}`}
            className="border-0 border-b last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 flex-1">
                {/* Status Badge */}
                <Badge
                  variant={
                    phase.status === "live"
                      ? "default"
                      : phase.status === "upcoming"
                        ? "secondary"
                        : "outline"
                  }
                  className={
                    phase.status === "live"
                      ? "bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1"
                      : phase.status === "upcoming"
                        ? "bg-blue-100 text-blue-700 text-xs px-2 py-1"
                        : "text-gray-500 text-xs px-2 py-1"
                  }
                >
                  {phase.status}
                </Badge>

                {/* Event Info */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-foreground">
                    {phase.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {phase.isPhase ? (
                        <span>
                          {formatDateRange(phase.startDate, phase.endDate)}
                        </span>
                      ) : (
                        <span>{formatSingleDate(phase.startDate)}</span>
                      )}
                    </div>
                    {!phase.isPhase && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {phase.endDate.getTime() - phase.startDate.getTime() >
                          3600000
                            ? `${Math.round((phase.endDate.getTime() - phase.startDate.getTime()) / 3600000)}h`
                            : `${Math.round((phase.endDate.getTime() - phase.startDate.getTime()) / 60000)}min`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="pt-2 pb-3 space-y-3 text-sm">
                {phase.description && (
                  <div>
                    <h4 className="font-medium mb-1 text-sm">Description</h4>
                    <p className="text-muted-foreground text-sm">
                      {phase.description}
                    </p>
                  </div>
                )}

                {phase.speaker && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Speaker</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
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
                      <div>
                        <p className="font-medium text-sm">
                          {phase.speaker.name}
                        </p>
                        {phase.speaker.position && (
                          <p className="text-xs text-muted-foreground">
                            {phase.speaker.position}
                          </p>
                        )}
                        {phase.speaker.xHandle && (
                          <p className="text-xs text-blue-600">
                            @{phase.speaker.xHandle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {phase.isPhase && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <h6 className="flex items-center text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Start Date
                      </h6>
                      <p className="font-medium text-xs">
                        {phase.startDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h6 className="flex items-center text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        End Date
                      </h6>
                      <p className="font-medium text-xs">
                        {phase.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {hackathon.location && phase.isPhase && (
                  <div>
                    <h6 className="flex items-center text-muted-foreground mb-1 text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      Location
                    </h6>
                    <p className="font-medium text-xs">{hackathon.location}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
