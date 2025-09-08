"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EvaluationCriterion {
  name: string;
  description: string;
  points: number;
}

interface PrizeCohort {
  id: string;
  name: string;
  evaluationCriteria: EvaluationCriterion[];
}

interface Hackathon {
  prizeCohorts: PrizeCohort[];
}

interface JudgingInterfaceProps {
  hackathon: Hackathon;
  selectedPrizeCohortId: string;
  setSelectedPrizeCohortId: (id: string) => void;
  selectedCohort: PrizeCohort | undefined;
  scores: Record<string, number>;
  setScores: (scores: Record<string, number>) => void;
  feedback: Record<string, string>;
  setFeedback: (feedback: Record<string, string>) => void;
  overallFeedback: string;
  setOverallFeedback: (feedback: string) => void;
}

export function JudgingInterface({
  hackathon,
  selectedPrizeCohortId,
  setSelectedPrizeCohortId,
  selectedCohort,
  scores,
  setScores,
  feedback,
  setFeedback,
  overallFeedback,
  setOverallFeedback,
}: JudgingInterfaceProps) {
  return (
    <div className="space-y-6">
      {/* Prize Cohort Selection */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Select A Prize Cohort</h2>
        <Select
          value={selectedPrizeCohortId}
          onValueChange={setSelectedPrizeCohortId}
        >
          <SelectTrigger className="w-full bg-muted">
            <SelectValue placeholder="Tech Fairness Exploration Awards" />
          </SelectTrigger>
          <SelectContent>
            {hackathon.prizeCohorts.map((cohort) => (
              <SelectItem key={cohort.id} value={cohort.id}>
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Evaluation Criteria Table */}
      {selectedCohort && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Evaluation Criteria</h2>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 py-3 border-b border-muted text-sm font-medium text-muted-foreground">
            <div>Name</div>
            <div>Description</div>
            <div>Max Score</div>
            <div>Your Score</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-1">
            {selectedCohort.evaluationCriteria.map((criterion) => (
              <div
                key={criterion.name}
                className="space-y-3 py-4 border-b border-muted/50"
              >
                <div className="grid grid-cols-4 gap-4 items-start">
                  <div className="font-medium text-sm">
                    {criterion.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {criterion.description}
                  </div>
                  <div className="font-medium text-sm">
                    {criterion.points}
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      max={criterion.points}
                      step="0.5"
                      value={scores[criterion.name] || 0}
                      onChange={(e) =>
                        setScores({
                          ...scores,
                          [criterion.name]: Math.min(
                            criterion.points,
                            Math.max(0, parseFloat(e.target.value) || 0),
                          ),
                        })
                      }
                      className="w-20 h-8 text-center bg-muted"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 items-start">
                  <Label className="text-xs text-muted-foreground">
                    Feedback
                  </Label>
                  <div className="col-span-3">
                    <Textarea
                      placeholder={`Provide specific feedback for ${criterion.name}...`}
                      value={feedback[criterion.name] || ""}
                      onChange={(e) =>
                        setFeedback({
                          ...feedback,
                          [criterion.name]: e.target.value,
                        })
                      }
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Feedback */}
          <div className="space-y-3 pt-6 border-t border-muted/50">
            <Label className="text-sm font-medium">
              Overall Feedback
            </Label>
            <Textarea
              placeholder="Provide overall feedback for this project submission..."
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}