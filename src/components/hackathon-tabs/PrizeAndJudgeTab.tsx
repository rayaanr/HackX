import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Hackathon } from "@/data/hackathons";

interface PrizeAndJudgeTabProps {
  hackathon: Hackathon;
}

export function PrizeAndJudgeTab({ hackathon }: PrizeAndJudgeTabProps) {
  if (!hackathon.prizeCohorts || hackathon.prizeCohorts.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">Prize & Judge Information</h2>
        <p className="text-muted-foreground">
          Prize and judge information will be announced soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hackathon.prizeCohorts.map((cohort) => (
        <Card key={cohort.name} className="overflow-hidden">
          <CardHeader className="bg-muted">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{cohort.name}</CardTitle>
                <p className="text-lg font-semibold text-yellow-500">
                  {cohort.prizeAmount}
                </p>
              </div>
              <Button variant="default">Submit to Track</Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{cohort.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Prize Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Winners:</span> {cohort.numberOfWinners}</p>
                    <p><span className="font-medium">Judging Mode:</span> {cohort.judgingMode}</p>
                    <p><span className="font-medium">Voting Mode:</span> {cohort.votingMode}</p>
                    <p><span className="font-medium">Max Votes per Judge:</span> {cohort.maxVotesPerJudge}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Evaluation Criteria</h4>
                  <div className="space-y-2">
                    {cohort.evaluationCriteria.map((criteria) => (
                      <div key={criteria.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">{criteria.name}</p>
                          <p className="text-xs text-muted-foreground">{criteria.description}</p>
                        </div>
                        <span className="font-bold text-primary">{criteria.points}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Judges Section */}
      {hackathon.judges && hackathon.judges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Judges</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hackathon.judges.map((judge) => (
                  <TableRow key={judge.email}>
                    <TableCell>{judge.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        judge.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        judge.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {judge.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}