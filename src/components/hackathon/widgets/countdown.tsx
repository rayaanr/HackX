"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SlidingNumber } from "../../ui/anim/sliding-number";
import type { UIHackathon } from "@/types/hackathon";
import { safeToDate } from "@/lib/helpers/date";
import { useHackathonRegistration } from "@/hooks/use-hackathons";
import { useActiveAccount } from "thirdweb/react";

interface CountdownProps {
  hackathon: UIHackathon;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ hackathon }: CountdownProps) {
  const activeAccount = useActiveAccount();

  // Check if user is registered for this hackathon
  const { data: isRegistered = false } = useHackathonRegistration(hackathon.id);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      // Get all relevant dates
      const regStartDate = safeToDate(
        hackathon.registrationPeriod?.registrationStartDate,
      );
      const regEndDate = safeToDate(
        hackathon.registrationPeriod?.registrationEndDate,
      );
      const hackStartDate = safeToDate(
        hackathon.hackathonPeriod?.hackathonStartDate,
      );
      const hackEndDate = safeToDate(
        hackathon.hackathonPeriod?.hackathonEndDate,
      );
      const votingStartDate = safeToDate(
        hackathon.votingPeriod?.votingStartDate,
      );
      const votingEndDate = safeToDate(hackathon.votingPeriod?.votingEndDate);

      let targetDate: Date | null = null;

      // If user is registered, prioritize submission-related dates
      if (isRegistered && activeAccount) {
        // For registered users, focus on submission timeline
        if (hackStartDate && now < hackStartDate) {
          targetDate = hackStartDate;
        } else if (hackEndDate && now < hackEndDate) {
          targetDate = hackEndDate;
        } else if (votingStartDate && now < votingStartDate) {
          targetDate = votingStartDate;
        } else if (votingEndDate && now < votingEndDate) {
          targetDate = votingEndDate;
        }
      }

      // If no target date set yet (either not registered or no submission phase active)
      // Use general logic with priority for submission phase over registration
      if (!targetDate) {
        if (regStartDate && now < regStartDate) {
          // Before registration starts
          targetDate = regStartDate;
        } else if (
          hackStartDate &&
          hackEndDate &&
          now >= hackStartDate &&
          now < hackEndDate
        ) {
          // Submission phase is active - prioritize this over registration
          targetDate = hackEndDate;
        } else if (regEndDate && now < regEndDate) {
          // During registration period (only if submission not active)
          targetDate = regEndDate;
        } else if (hackStartDate && now < hackStartDate) {
          // Between registration end and submission start
          targetDate = hackStartDate;
        } else if (hackEndDate && now < hackEndDate) {
          // During submission period
          targetDate = hackEndDate;
        } else if (votingStartDate && now < votingStartDate) {
          // Between submission end and voting start
          targetDate = votingStartDate;
        } else if (votingEndDate && now < votingEndDate) {
          // During voting period
          targetDate = votingEndDate;
        }
      }

      if (!targetDate) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [hackathon]);

  const getCountdownTitle = () => {
    const now = new Date();

    // Get all relevant dates
    const regStartDate = safeToDate(
      hackathon.registrationPeriod?.registrationStartDate,
    );
    const regEndDate = safeToDate(
      hackathon.registrationPeriod?.registrationEndDate,
    );
    const hackStartDate = safeToDate(
      hackathon.hackathonPeriod?.hackathonStartDate,
    );
    const hackEndDate = safeToDate(hackathon.hackathonPeriod?.hackathonEndDate);
    const votingStartDate = safeToDate(hackathon.votingPeriod?.votingStartDate);
    const votingEndDate = safeToDate(hackathon.votingPeriod?.votingEndDate);

    // If user is registered, prioritize submission-related countdowns
    if (isRegistered && activeAccount) {
      // For registered users, focus on submission timeline
      if (hackStartDate && now < hackStartDate) {
        return "Submission starts in";
      } else if (hackEndDate && now < hackEndDate) {
        return "Submission ends in";
      } else if (votingStartDate && now < votingStartDate) {
        return "Voting starts in";
      } else if (votingEndDate && now < votingEndDate) {
        return "Voting ends in";
      }
      // Fall back to general logic if no submission-specific phase
    }

    // General logic for non-registered users or when no submission phase applies
    // Prioritize submission phase over registration when both are active
    if (regStartDate && now < regStartDate) {
      return "Registration starts in";
    } else if (
      hackStartDate &&
      hackEndDate &&
      now >= hackStartDate &&
      now < hackEndDate
    ) {
      // Submission phase is active - prioritize this over registration
      return "Submission ends in";
    } else if (regEndDate && now < regEndDate) {
      return "Registration ends in";
    } else if (hackStartDate && now < hackStartDate) {
      return "Submission starts in";
    } else if (hackEndDate && now < hackEndDate) {
      return "Submission ends in";
    } else if (votingStartDate && now < votingStartDate) {
      return "Voting starts in";
    } else if (votingEndDate && now < votingEndDate) {
      return "Voting ends in";
    }

    return "Event completed";
  };

  const isEventCompleted = () => {
    return getCountdownTitle() === "Event completed";
  };

  return (
    <div className="rounded-lg border bg-card/30 text-card-foreground shadow-sm p-6">
      <div className="flex items-center flex-col mb-4">
        <h2 className="text-lg font-semibold">{getCountdownTitle()}</h2>
        <Link
          href="#schedule"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          Schedule Detail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isEventCompleted() ? (
        <div className="text-center py-2">
          <div className="text-lg font-semibold text-green-500 mb-2">
            🎉 Complete!
          </div>
          <p className="text-sm text-muted-foreground">
            All phases of this hackathon have concluded
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="rounded-lg p-3 bg-background">
            <div className="text-2xl font-bold font-mono">
              <SlidingNumber value={timeLeft.days} padStart={true} />
            </div>
            <p className="text-xs text-muted-foreground">D</p>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-2xl font-bold font-mono">
              <SlidingNumber value={timeLeft.hours} padStart={true} />
            </div>
            <p className="text-xs text-muted-foreground">H</p>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-2xl font-bold font-mono">
              <SlidingNumber value={timeLeft.minutes} padStart={true} />
            </div>
            <p className="text-xs text-muted-foreground">M</p>
          </div>
          <div className="bg-background rounded-lg p-3">
            <div className="text-2xl font-bold font-mono">
              <SlidingNumber value={timeLeft.seconds} padStart={true} />
            </div>
            <p className="text-xs text-muted-foreground">S</p>
          </div>
        </div>
      )}
    </div>
  );
}
