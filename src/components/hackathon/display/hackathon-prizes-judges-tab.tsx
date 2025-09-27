import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type UIHackathon } from "@/types/hackathon";

interface PrizeAndJudgeTabProps {
  hackathon: UIHackathon;
}

export function PrizeAndJudgeTab({ hackathon }: PrizeAndJudgeTabProps) {
  if (!hackathon.prizeCohorts || hackathon.prizeCohorts.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Prize & Judge Information</h2>
        <p className="text-muted-foreground">
          Prize and judge information will be announced soon.
        </p>
      </div>
    );
  }

  // Calculate total prize amount
  const totalPrizeAmount = hackathon.prizeCohorts.reduce((total, cohort) => {
    const amount = parseFloat(cohort.prizeAmount.replace(/[^\d.]/g, "")) || 0;
    return total + amount;
  }, 0);

  // Get the main prize cohort for judging criteria
  const mainCohort = hackathon.prizeCohorts[0];

  // Sort cohorts by prize amount for ranking display
  const sortedCohorts = [...hackathon.prizeCohorts].sort((a, b) => {
    const amountA = parseFloat(a.prizeAmount.replace(/[^\d.]/g, "")) || 0;
    const amountB = parseFloat(b.prizeAmount.replace(/[^\d.]/g, "")) || 0;
    return amountB - amountA;
  });

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    // Extract currency from original amount or use a default
    const currencyMatch = amount.match(/[A-Z]{3,4}/);
    const currency = currencyMatch ? currencyMatch[0] : "USD";
    return `${numericAmount.toLocaleString()} ${currency}`;
  };

  const getRankLabel = (index: number) => {
    switch (index) {
      case 0:
        return "First Place";
      case 1:
        return "Second Place";
      case 2:
        return "Third Place";
      default:
        return `${index + 1}th Place`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Render each cohort as a separate card */}
      {hackathon.prizeCohorts.map((cohort, cohortIndex) => (
        <Card key={cohort.name} className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Total Prize */}
              <div>
                <CardTitle className="text-4xl font-bold mb-2">
                  {formatCurrency(cohort.prizeAmount)}
                </CardTitle>
                <p className="text-lg text-muted-foreground">{cohort.name}</p>
              </div>

              {/* Prize Breakdown - show other cohorts for comparison */}
              <div className="space-y-3">
                {sortedCohorts.slice(0, 3).map((otherCohort, index) => (
                  <div
                    key={otherCohort.name}
                    className="flex justify-between items-center"
                  >
                    <span className="text-muted-foreground">
                      {getRankLabel(index)}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(otherCohort.prizeAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <h3 className="text-2xl font-bold">{cohort.name}</h3>

            {/* Judging Criteria */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Judging Criteria</h4>
              <div className="bg-muted/30 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohort?.evaluationCriteria &&
                    cohort.evaluationCriteria.length > 0 ? (
                      cohort.evaluationCriteria.map((criteria) => (
                        <TableRow key={criteria.name}>
                          <TableCell className="font-medium">
                            {criteria.name} {criteria.points}%
                          </TableCell>
                          <TableCell>{criteria.description}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground italic"
                        >
                          No evaluation criteria defined
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Judging Details */}
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-2">
                <h5 className="font-semibold text-muted-foreground">
                  Judging Mode
                </h5>
                <p className="font-semibold capitalize">
                  {cohort?.judgingMode?.replace("_", " ") || "TBD"}
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-muted-foreground">
                  Voting Mode
                </h5>
                <p className="font-semibold capitalize">
                  {cohort?.votingMode?.replace("_", " ") || "TBD"}
                </p>
              </div>
            </div>

            {/* Max Votes */}
            <div className="space-y-2">
              <h5 className="font-semibold text-muted-foreground">
                MAX Votes Per Project Per User/Judge
              </h5>
              <p className="text-2xl font-bold">
                {cohort?.maxVotesPerJudge || 0}
              </p>
            </div>

            {/* Judging Accounts - only show once, for the first cohort */}
            {cohortIndex === 0 && (
              <div className="space-y-2">
                <h5 className="font-semibold text-muted-foreground">
                  Judging Accounts
                </h5>
                <div className="flex items-center space-x-2">
                  {hackathon.judges && hackathon.judges.length > 0 ? (
                    hackathon.judges.slice(0, 4).map((judge) => (
                      <div
                        key={judge.address}
                        className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-semibold"
                        title={judge.address}
                      >
                        {judge.address.slice(2, 4).toUpperCase()}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No judges assigned</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
