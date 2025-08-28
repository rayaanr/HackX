import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hackathon } from "@/data/hackathons";

interface ScheduleTabProps {
  hackathon: Hackathon;
}

export function ScheduleTab({ hackathon }: ScheduleTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {hackathon.schedule && hackathon.schedule.length > 0 ? (
          <div className="space-y-4">
            {hackathon.schedule.map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-muted rounded-lg p-2 mr-4">
                  <p className="font-semibold">{item.date}</p>
                </div>
                <p className="pt-2">{item.event}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No schedule information available for this hackathon.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
