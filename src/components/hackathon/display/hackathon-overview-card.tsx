import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarList } from "@/components/ui/avatar-list";
import type { UIHackathon } from "@/types/hackathon";
import { getHackathonStatusVariant } from "@/lib/helpers/status";
import {
  safeToDate,
  getDaysLeft,
  getUIHackathonStatus,
} from "@/lib/helpers/date";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import { Calendar, Code, Trophy, Award } from "lucide-react";
import type { HackathonStatus } from "@/types/hackathon";

interface HackathonCardProps {
  hackathon: UIHackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const hackathonStatus = getUIHackathonStatus({
    ...hackathon,
    votingPeriod: hackathon.votingPeriod || undefined,
  });
  const statusVariant = getHackathonStatusVariant(
    hackathonStatus as HackathonStatus
  );

  // Get the relevant deadline based on current status
  const deadline = (() => {
    switch (hackathonStatus) {
      case "Registration Open":
        return safeToDate(hackathon.registrationPeriod?.registrationEndDate);
      case "Registration Closed":
        return safeToDate(hackathon.hackathonPeriod?.hackathonStartDate);
      case "Live":
        return safeToDate(hackathon.hackathonPeriod?.hackathonEndDate);
      case "Voting":
        return safeToDate(hackathon.votingPeriod?.votingEndDate);
      case "Ended":
      default:
        return null;
    }
  })();

  const daysLeft = deadline ? getDaysLeft(deadline) : 0;

  const participantAvatars = [
    { src: "https://originui.com/avatar-80-03.jpg", alt: "Participant 1" },
    { src: "https://originui.com/avatar-80-04.jpg", alt: "Participant 2" },
    { src: "https://originui.com/avatar-80-05.jpg", alt: "Participant 3" },
    { src: "https://originui.com/avatar-80-06.jpg", alt: "Participant 4" },
  ];

  return (
    <Link href={`/hackathons/${hackathon.id}`} className="block group h-full">
      <Card className="project-card-hover h-full p-6 md:p-7 cursor-pointer">
        <div className="relative z-10 h-full">
          <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="flex-1 min-w-0 flex flex-col">
              <CardHeader className="p-0 mb-5">
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight group-hover:text-white">
                    {hackathon.name}
                  </CardTitle>
                  <Badge
                    variant={statusVariant}
                    className="text-[10px] uppercase tracking-wide py-1"
                  >
                    {hackathonStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <p className="text-sm md:text-base text-white/60 mb-5 line-clamp-3">
                  {hackathon.shortDescription}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs md:text-sm mb-5">
                  <div className="space-y-1">
                    <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                      <Calendar className="size-3.5 mr-1.5" />
                      {hackathonStatus === "Ended" ? "Status" : "Days Left"}
                    </h6>
                    <p className="font-semibold text-white/85 text-sm">
                      {hackathonStatus === "Ended"
                        ? "Completed"
                        : deadline
                        ? `${daysLeft} days`
                        : "TBD"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                      <Code className="size-3.5 mr-1.5" />
                      Tech Stack
                    </h6>
                    <p className="font-semibold text-white/85 text-sm truncate">
                      {hackathon.techStack?.slice(0, 3).join(", ")}
                      {hackathon.techStack &&
                        hackathon.techStack.length > 3 &&
                        "..."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                      <Trophy className="size-3.5 mr-1.5" />
                      Level
                    </h6>
                    <p className="font-semibold text-white/85 text-sm capitalize">
                      {hackathon.experienceLevel}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h6 className="flex items-center text-white/40 font-medium text-[11px] uppercase tracking-wide">
                      <Award className="size-3.5 mr-1.5" />
                      Location
                    </h6>
                    <p
                      className="font-semibold text-white/85 text-sm truncate"
                      title={hackathon.location}
                    >
                      {hackathon.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-5 mt-auto">
                  <AvatarList
                    images={participantAvatars}
                    totalCount={150}
                    additionalCount={0}
                    className="border-0 shadow-none"
                  />
                  <div className="flex items-center text-xs md:text-sm text-white/60">
                    <Trophy className="h-4 w-4 mr-1 text-white/50" />
                    <span>
                      {hackathon.prizeCohorts?.length || 0} Prize
                      {hackathon.prizeCohorts &&
                      hackathon.prizeCohorts.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
            <div className="relative md:w-1/3 overflow-hidden rounded-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                height={200}
                width={300}
                src={resolveIPFSToHttp(hackathon.visual)}
                alt={hackathon.name}
                className="h-40 md:h-full w-full object-cover rounded-lg transform group-hover:scale-[1.03] transition-transform duration-500"
                unoptimized
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
