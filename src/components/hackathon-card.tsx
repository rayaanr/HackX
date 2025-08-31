import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hackathon } from "@/data/hackathons";

interface HackathonCardProps {
  hackathon: Hackathon;
}

const getHackathonStatus = (hackathon: Hackathon) => {
  if (hackathon.registrationPeriod?.registrationEndDate && Date.now() < hackathon.registrationPeriod.registrationEndDate.getTime()) {
    return "Registration Open";
  }
  if (hackathon.hackathonPeriod?.hackathonStartDate && Date.now() < hackathon.hackathonPeriod.hackathonStartDate.getTime()) {
    return "Registration Closed";
  }
  if (hackathon.hackathonPeriod?.hackathonEndDate && Date.now() < hackathon.hackathonPeriod.hackathonEndDate.getTime()) {
    return "Live";
  }
  if (hackathon.votingPeriod?.votingEndDate && Date.now() < hackathon.votingPeriod.votingEndDate.getTime()) {
    return "Voting";
  }
  return "Ended";
};

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const status = getHackathonStatus(hackathon);
  const deadline = hackathon.registrationPeriod?.registrationEndDate;

  return (
    <Card className="p-6">
      <div className="flex">
        <div className="flex-1">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">{hackathon.name}</CardTitle>
              <Badge
                variant={status === "Live" || status === "Registration Open" ? "default" : "secondary"}
              >
                {status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-muted-foreground mb-4">
              {hackathon.shortDescription}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold">Deadline</p>
                <p>{deadline ? deadline.toLocaleDateString() : "TBD"}</p>
              </div>
              <div>
                <p className="font-semibold">Tech Stack</p>
                <p>{hackathon.techStack.slice(0, 2).join(", ")}...</p>
              </div>
              <div>
                <p className="font-semibold">Level</p>
                <p className="capitalize">{hackathon.experienceLevel}</p>
              </div>
              <div>
                <p className="font-semibold">Prize</p>
                <p>{hackathon.prizeCohorts[0]?.prizeAmount || "TBD"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary">{hackathon.location}</Badge>
              <Badge variant="secondary">{hackathon.prizeCohorts.length} Prize{hackathon.prizeCohorts.length !== 1 ? 's' : ''}</Badge>
            </div>
          </CardContent>
        </div>
        <div className="relative w-1/3">
          <Image
            height={200}
            width={300}
            src={hackathon.visual || "/placeholder.svg"}
            alt={hackathon.name}
            className="h-full w-full object-cover rounded-lg"
            unoptimized
          />
        </div>
      </div>
    </Card>
  );
}