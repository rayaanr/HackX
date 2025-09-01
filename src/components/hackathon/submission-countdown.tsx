"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { UIHackathon } from "@/types/hackathon";

interface SubmissionCountdownProps {
  hackathon: UIHackathon;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function SubmissionCountdown({ hackathon }: SubmissionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      let targetDate: Date;

      // Determine which date to countdown to based on hackathon status
      if (
        hackathon.registrationPeriod?.registrationEndDate &&
        new Date() < hackathon.registrationPeriod.registrationEndDate
      ) {
        targetDate = hackathon.registrationPeriod.registrationEndDate;
      } else if (hackathon.hackathonPeriod?.hackathonEndDate) {
        targetDate = hackathon.hackathonPeriod.hackathonEndDate;
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const difference = targetDate.getTime() - now;

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
    if (
      hackathon.registrationPeriod?.registrationEndDate &&
      new Date() < hackathon.registrationPeriod.registrationEndDate
    ) {
      return "Registration ends in";
    }
    return "Submission ends in";
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{getCountdownTitle()}</h2>
        <Link
          href="#schedule"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          Schedule Detail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-2xl font-bold">
            {timeLeft.days.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">D</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-2xl font-bold">
            {timeLeft.hours.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">H</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-2xl font-bold">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">M</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-2xl font-bold">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </p>
          <p className="text-xs text-muted-foreground">S</p>
        </div>
      </div>
    </div>
  );
}
