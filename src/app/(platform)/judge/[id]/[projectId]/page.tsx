"use client";

import { use, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  useHackathon,
  useHackathonProjectsWithDetails
} from "@/hooks/blockchain/useBlockchainHackathons";

interface ProjectReviewPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default function ProjectReviewPage({ params }: ProjectReviewPageProps) {
  const { id: hackathonId, projectId } = use(params);
  const account = useActiveAccount();

  // State for evaluation form
  const [evaluation, setEvaluation] = useState({
    technicalExecution: 0,
    innovation: 0,
    usability: 0,
    marketPotential: 0,
    presentation: 0,
    overallFeedback: "",
    strengths: "",
    improvements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch hackathon and project data
  const { data: hackathon, isLoading: hackathonLoading } = useHackathon(hackathonId);
  const { projects, isLoading: projectsLoading } = useHackathonProjectsWithDetails(hackathonId);

  if (hackathonLoading || projectsLoading) {
    return <div>Loading...</div>;
  }

  if (!hackathon || !projects) {
    notFound();
  }

  // Find the specific project
  const project = projects.find((p: any) => p.id.toString() === projectId);

  if (!project) {
    notFound();
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert>
          <AlertDescription>
            Please connect your wallet to review projects.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleScoreChange = (criteria: string, score: number) => {
    setEvaluation(prev => ({
      ...prev,
      [criteria]: score
    }));
  };

  const calculateTotalScore = () => {
    const scores = [
      evaluation.technicalExecution,
      evaluation.innovation,
      evaluation.usability,
      evaluation.marketPotential,
      evaluation.presentation
    ];
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round((total / scores.length) * 10) / 10; // Average out of 10
  };

  const handleSubmitEvaluation = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement blockchain transaction to submit evaluation
      // This would involve calling a smart contract function to submit the judge's score
      console.log("Submitting evaluation:", {
        hackathonId,
        projectId,
        judgeAddress: account.address,
        totalScore: calculateTotalScore(),
        evaluation
      });

      toast.success("Evaluation submitted successfully!");
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      toast.error("Failed to submit evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEvaluationComplete = () => {
    return (
      evaluation.technicalExecution > 0 &&
      evaluation.innovation > 0 &&
      evaluation.usability > 0 &&
      evaluation.marketPotential > 0 &&
      evaluation.presentation > 0 &&
      evaluation.overallFeedback.trim().length > 0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/hackathons/${hackathonId}/judge`}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            Evaluating project for {hackathon.name}
          </p>
        </div>
      </div>

      <div className="gap-6">
        {/* Evaluation Form - Right Column */}
        <div>
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-4" />
                Judge Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scoring Criteria */}
              <div className="space-y-4">
                {[
                  { key: 'technicalExecution', label: 'Technical Execution', description: 'Code quality, architecture, implementation' },
                  { key: 'innovation', label: 'Innovation', description: 'Originality and creativity of the solution' },
                  { key: 'usability', label: 'Usability', description: 'User experience and design quality' },
                  { key: 'marketPotential', label: 'Market Potential', description: 'Commercial viability and impact' },
                  { key: 'presentation', label: 'Presentation', description: 'Quality of demo and pitch' },
                ].map((criteria) => (
                  <div key={criteria.key} className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">{criteria.label}</Label>
                      <p className="text-xs text-muted-foreground">{criteria.description}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <Button
                          key={score}
                          variant={Number(evaluation[criteria.key as keyof typeof evaluation]) >= score ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handleScoreChange(criteria.key, score)}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-right text-muted-foreground">
                      Score: {evaluation[criteria.key as keyof typeof evaluation] || 0}/10
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total Score Display */}
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Total Score</p>
                <p className="text-2xl font-bold text-primary">{calculateTotalScore()}/10</p>
              </div>

              <Separator />

              {/* Feedback Sections */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="overallFeedback">Overall Feedback *</Label>
                  <Textarea
                    id="overallFeedback"
                    placeholder="Provide your overall assessment of this project..."
                    value={evaluation.overallFeedback}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, overallFeedback: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strengths">Strengths</Label>
                  <Textarea
                    id="strengths"
                    placeholder="What are the project's main strengths?"
                    value={evaluation.strengths}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, strengths: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvements">Areas for Improvement</Label>
                  <Textarea
                    id="improvements"
                    placeholder="What could be improved?"
                    value={evaluation.improvements}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, improvements: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                onClick={handleSubmitEvaluation}
                disabled={!isEvaluationComplete() || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="size-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Award className="size-4 mr-2" />
                    Submit Evaluation
                  </>
                )}
              </Button>

              {!isEvaluationComplete() && (
                <p className="text-xs text-muted-foreground text-center">
                  Please complete all scores and provide overall feedback to submit.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}