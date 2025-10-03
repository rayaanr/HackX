"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Users, Target, Vote, Scale } from "lucide-react";
import { motion } from "motion/react";
import { type UIHackathon } from "@/types/hackathon";

interface PrizeAndJudgeTabProps {
  hackathon: UIHackathon;
}

export function PrizeAndJudgeTab({ hackathon }: PrizeAndJudgeTabProps) {
  if (!hackathon.prizeCohorts || hackathon.prizeCohorts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Prizes & Judges
        </h2>
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-center">
              Prize and judge information will be announced soon.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Calculate total prize amount
  const totalPrizeAmount = hackathon.prizeCohorts.reduce((total, cohort) => {
    const amount = parseFloat(cohort.prizeAmount.replace(/[^\d.]/g, "")) || 0;
    return total + amount;
  }, 0);

  // Sort cohorts by prize amount for ranking display
  const sortedCohorts = [...hackathon.prizeCohorts].sort((a, b) => {
    const amountA = parseFloat(a.prizeAmount.replace(/[^\d.]/g, "")) || 0;
    const amountB = parseFloat(b.prizeAmount.replace(/[^\d.]/g, "")) || 0;
    return amountB - amountA;
  });

  const formatCurrency = (amount: string) => {
    const numericAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    const currencyMatch = amount.match(/[A-Z]{3,4}/);
    const currency = currencyMatch ? currencyMatch[0] : "USD";
    return `${numericAmount.toLocaleString()} ${currency}`;
  };

  const getRankLabel = (index: number) => {
    const ranks = ["🥇", "🥈", "🥉"];
    return ranks[index] || `#${index + 1}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Prizes & Judges
        </h2>
        <p className="text-sm text-muted-foreground">
          Prize structure and evaluation criteria
        </p>
      </div>

      {/* Prize Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCohorts.slice(0, 3).map((cohort, index) => (
          <motion.div
            key={cohort.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`relative overflow-hidden ${
                index === 0
                  ? "border-yellow-500/20 bg-yellow-500/5"
                  : index === 1
                    ? "border-gray-400/20 bg-gray-400/5"
                    : index === 2
                      ? "border-orange-500/20 bg-orange-500/5"
                      : "border-muted-foreground/20"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{getRankLabel(index)}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{cohort.name}</h3>
                    <p className="text-xs text-muted-foreground">Prize Pool</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(cohort.prizeAmount)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Information for Each Cohort */}
      <div className="grid gap-6">
        {hackathon.prizeCohorts.map((cohort, cohortIndex) => (
          <motion.div
            key={cohort.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: cohortIndex * 0.1 }}
          >
            <Card className="overflow-hidden bg-card/30">
              <CardContent className="p-6 space-y-6">
                {/* Cohort Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {cohort.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(cohort.prizeAmount)} Prize Pool
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {cohort?.judgingMode?.replace("_", " ") || "TBD"}
                  </Badge>
                </div>

                {/* Evaluation Criteria */}
                {cohort?.evaluationCriteria &&
                  cohort.evaluationCriteria.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">
                          Evaluation Criteria
                        </h4>
                      </div>
                      <div className="grid gap-2">
                        {cohort.evaluationCriteria.map((criteria) => (
                          <div
                            key={criteria.name}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-muted-foreground/20"
                          >
                            <div>
                              <span className="font-medium text-sm">
                                {criteria.name}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {criteria.description}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {criteria.points}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Judging Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
                    <Scale className="size-8 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Judging Mode
                      </p>
                      <p className="font-medium text-sm capitalize">
                        {cohort?.judgingMode?.replace("_", " ") || "TBD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted-foreground/20 ">
                    <Vote className="size-8 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Voting Mode
                      </p>
                      <p className="font-medium text-sm capitalize">
                        {cohort?.votingMode?.replace("_", " ") || "TBD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-muted-foreground/20">
                    <Trophy className="size-8 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Max Votes</p>
                      <p className="font-medium text-sm">
                        {cohort?.maxVotesPerJudge || 0} per judge
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Judges Section */}
      {hackathon.judges && hackathon.judges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 mt-20">
            <Users className="size-6 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Judges</h3>
            <Badge variant="outline" className="text-xs">
              {hackathon.judges.length}{" "}
              {hackathon.judges.length === 1 ? "Judge" : "Judges"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            {hackathon.judges.map((judge, index) => (
              <div
                key={judge.address}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-muted-foreground/20"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-medium">
                    {judge.address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium">Judge {index + 1}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {judge.address.slice(0, 6)}...{judge.address.slice(-4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
