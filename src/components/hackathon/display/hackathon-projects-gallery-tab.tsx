import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type UIHackathon } from "@/types/hackathon";

interface SubmittedProjectsTabProps {
  hackathon: UIHackathon;
}

export function SubmittedProjectsTab({ hackathon }: SubmittedProjectsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitted Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          No submitted projects available for this hackathon yet.
        </p>
      </CardContent>
    </Card>
  );
}
