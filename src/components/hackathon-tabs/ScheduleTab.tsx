import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Hackathon } from "@/data/hackathons";

interface ScheduleTabProps {
  hackathon: Hackathon;
}

export function ScheduleTab({ hackathon }: ScheduleTabProps) {
  if (!hackathon.schedule || hackathon.schedule.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">Schedule</h2>
        <p className="text-muted-foreground">
          The schedule will be announced soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Schedule</h2>
      <div className="space-y-6">
        {hackathon.schedule.map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="bg-muted rounded-lg p-3 min-w-[120px] text-center">
              <p className="font-semibold text-sm">
                {item.startDateTime.toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.startDateTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {item.endDateTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                
                {item.hasSpeaker && 'speaker' in item && item.speaker && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={'picture' in item.speaker ? item.speaker.picture : undefined} alt={item.speaker.name} />
                      <AvatarFallback>
                        {item.speaker.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">{item.speaker.name}</p>
                      {'position' in item.speaker && item.speaker.position && (
                        <p className="text-muted-foreground">{item.speaker.position}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}