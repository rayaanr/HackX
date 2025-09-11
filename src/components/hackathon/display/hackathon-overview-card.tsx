import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarList } from "@/components/ui/avatar-list";
import type { UIHackathon } from "@/types/hackathon";
import {
  getHackathonStatus,
  getStatusVariant,
} from "@/lib/helpers/hackathon-transforms";
import { safeToDate } from "@/lib/helpers/date";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import { format } from "date-fns";
import { Calendar, Code, Trophy, Award } from "lucide-react";

interface HackathonCardProps {
  hackathon: UIHackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const status = getHackathonStatus(hackathon);
  const statusVariant = getStatusVariant(status);
  const deadline = hackathon.registrationPeriod?.registrationEndDate;

  // Calculate days left until deadline
  const daysLeft = (() => {
    const deadlineDate = safeToDate(deadline);
    return deadlineDate ? Math.max(
      0,
      Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    ) : 0;
  })();

  // Create sample avatar images for participants
  const participantAvatars = [
    { src: "https://originui.com/avatar-80-03.jpg", alt: "Participant 1" },
    { src: "https://originui.com/avatar-80-04.jpg", alt: "Participant 2" },
    { src: "https://originui.com/avatar-80-05.jpg", alt: "Participant 3" },
    { src: "https://originui.com/avatar-80-06.jpg", alt: "Participant 4" },
  ];

  return (
    <Link href={`/hackathons/${hackathon.id}`}>
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex">
          <div className="flex-1">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-2xl">{hackathon.name}</CardTitle>
                <Badge variant={statusVariant}>{status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground mb-4">
                {hackathon.shortDescription}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm [&>div>h6]:text-muted-foreground [&>div>p]:font-semibold [&>div>p]:text-xs">
                <div>
                  <h6 className="flex items-center">
                    <Calendar className="size-4 mr-1" />
                    Days Left
                  </h6>
                  <p>{deadline ? `${daysLeft} days` : "TBD"}</p>
                </div>
                <div>
                  <h6 className="flex items-center">
                    <Code className="size-4 mr-1" />
                    Tech Stack
                  </h6>
                  <p>{hackathon.techStack.slice(0, 2).join(", ")}...</p>
                </div>
                <div>
                  <h6 className="flex items-center">
                    <Trophy className="size-4 mr-1" />
                    Level
                  </h6>
                  <p className="capitalize">{hackathon.experienceLevel}</p>
                </div>
                <div>
                  <h6 className="flex items-center">
                    <Award className="size-4 mr-1" />
                    Location
                  </h6>
                  <p className="truncate" title={hackathon.location}>
                    {hackathon.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <AvatarList
                  images={participantAvatars}
                  totalCount={150}
                  additionalCount={0}
                  className="border-0 shadow-none"
                />
                <div className="flex items-center text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span>
                    {hackathon.prizeCohorts.length} Prize
                    {hackathon.prizeCohorts.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
          <div className="relative w-1/3">
            <Image
              height={200}
              width={300}
              src={resolveIPFSToHttp(hackathon.visual)}
              alt={hackathon.name}
              className="h-full w-full object-cover rounded-lg"
              unoptimized
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
