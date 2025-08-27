import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hackathon } from "@/data/hackathons";

interface PrizeAndJudgeTabProps {
  hackathon: Hackathon;
}

export function PrizeAndJudgeTab({ hackathon }: PrizeAndJudgeTabProps) {
  if (!hackathon.prizeTracks || hackathon.prizeTracks.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">Prize & Judge Information</h2>
        <p className="text-muted-foreground">No prize track information available for this hackathon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hackathon.prizeTracks.map((track) => (
        <Card key={track.id} className="overflow-hidden">
          <CardHeader className="bg-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{track.title}</CardTitle>
                <p className="text-lg font-semibold text-yellow-500">{track.prize}</p>
              </div>
              <Button variant="default">Submit to Track</Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-6">{track.description}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Suggested Directions</h3>
              <ul className="list-disc list-inside space-y-1">
                {track.suggestedDirections.map((direction, index) => (
                  <li key={index} className="text-muted-foreground">{direction}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Evaluation Criteria</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Name</TableHead>
                    <TableHead className="w-1/2">Description</TableHead>
                    <TableHead className="text-right">Max Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {track.evaluationCriteria.map((criteria, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{criteria.name}</TableCell>
                      <TableCell>{criteria.description}</TableCell>
                      <TableCell className="text-right">{criteria.maxScore}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {hackathon.judges && hackathon.judges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Judges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              {hackathon.judges.map((judge) => (
                <div key={judge.id} className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={judge.avatar} alt={judge.name} />
                    <AvatarFallback>{judge.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{judge.name}</p>
                    <p className="text-sm text-muted-foreground">{judge.handle}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {hackathon.votingRules && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Voting Rules</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Judges Only</li>
                  <li>Project Scoring</li>
                  <li>Max Votes per Judge: {hackathon.votingRules.maxVotesPerJudge}</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}