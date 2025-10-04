import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProjectHackathonCardProps {
  id: string;
  name: string;
  date: string;
  theme: string;
  prize: string;
  participants: number;
  status: "live" | "upcoming" | "completed";
}

export function ProjectHackathonCard({
  name,
  date,
  theme,
  prize,
  participants,
  status,
}: ProjectHackathonCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow bg-card/20">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge
            variant={
              status === "live"
                ? "default"
                : status === "upcoming"
                  ? "secondary"
                  : "outline"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="font-medium">Date:</span>
            <span className="ml-2">{date}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="font-medium">Theme:</span>
            <span className="ml-2">{theme}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="font-medium">Prize:</span>
            <span className="ml-2">{prize}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="font-medium">Participants:</span>
            <span className="ml-2">{participants}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
