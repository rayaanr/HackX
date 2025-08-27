import { Hackathon } from "@/data/hackathons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface HackathonCardProps {
  hackathon: Hackathon;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  return (
    <Card className="p-6">
      <div className="flex">
        <div className="flex-1">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">{hackathon.name}</CardTitle>
              <Badge
                variant={hackathon.status === "Live" ? "default" : "secondary"}
              >
                {hackathon.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-muted-foreground mb-4">
              {hackathon.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold">Deadline</p>
                <p>{hackathon.deadline.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-semibold">Tech Stack</p>
                <p>{hackathon.techStack.join(", ")}</p>
              </div>
              <div>
                <p className="font-semibold">Level</p>
                <p>{hackathon.level}</p>
              </div>
              <div>
                <p className="font-semibold">Prize</p>
                <p>{hackathon.prize}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary">{hackathon.participants}</Badge>
              <Badge variant="secondary">{`${hackathon.participantCount} Participants`}</Badge>
            </div>
            {hackathon.winnerAnnounced && (
              <div className="mt-4">
                <p className="font-semibold">Winner</p>
                <p>{hackathon.winnerAnnounced}</p>
              </div>
            )}
          </CardContent>
        </div>
        <div className="relative w-1/3">
          <Image
            height={200}
            width={300}
            src={hackathon.imageUrl}
            alt={hackathon.name}
            className="h-full w-full object-cover rounded-lg"
            unoptimized
          />
        </div>
      </div>
    </Card>
  );
}
