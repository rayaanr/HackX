"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHackathonById } from "@/hooks/queries/use-hackathons";
import { useProjectById } from "@/hooks/queries/use-projects";
import { transformDatabaseToUI } from "@/lib/helpers/hackathon-transforms";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Play, Users } from "lucide-react";

interface ProjectReviewPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default function ProjectReviewPage({ params }: ProjectReviewPageProps) {
  const { id: hackathonId, projectId } = use(params);

  const { data: dbHackathon, isLoading: hackathonLoading, error: hackathonError } = useHackathonById(hackathonId);
  const { data: project, isLoading: projectLoading, error: projectError } = useProjectById(projectId);

  // All hooks must be called before any conditional returns
  const [selectedPrizeCohort, setSelectedPrizeCohort] = useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");

  // Transform data safely
  const hackathon = dbHackathon ? transformDatabaseToUI(dbHackathon) : null;
  const selectedCohort = hackathon?.prizeCohorts.find(
    (cohort) => cohort.name === selectedPrizeCohort
  );

  // Initialize selectedPrizeCohort when hackathon data is available
  useEffect(() => {
    if (hackathon && !selectedPrizeCohort && hackathon.prizeCohorts[0]?.name) {
      setSelectedPrizeCohort(hackathon.prizeCohorts[0].name);
    }
  }, [hackathon, selectedPrizeCohort]);

  // Initialize scores and feedback when selectedCohort changes
  useEffect(() => {
    if (selectedCohort) {
      const initialScores: Record<string, number> = {};
      const initialFeedback: Record<string, string> = {};
      
      selectedCohort.evaluationCriteria.forEach((criterion) => {
        initialScores[criterion.name] = 0;
        initialFeedback[criterion.name] = "";
      });
      
      setScores(initialScores);
      setFeedback(initialFeedback);
    }
  }, [selectedCohort]);

  if (hackathonLoading || projectLoading) {
    return <div>Loading...</div>;
  }

  if (hackathonError || projectError || !dbHackathon || !project || !hackathon) {
    notFound();
  }

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxScore = selectedCohort?.evaluationCriteria.reduce(
    (sum, criterion) => sum + criterion.points,
    0
  ) || 0;

  const handleSubmitEvaluation = () => {
    // Here you would typically save the evaluation to your backend
    console.log("Evaluation submitted:", {
      projectId,
      hackathonId,
      selectedPrizeCohort,
      scores,
      feedback,
      overallFeedback,
      totalScore,
      maxScore,
    });
    
    // Show success message or redirect
    alert("Evaluation submitted successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/hackathons/${hackathonId}/judge`}>
            <ArrowLeft className="size-4" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Project</h1>
          <p className="text-muted-foreground">
            Evaluate this project for {hackathon.name}
          </p>
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl font-semibold text-muted-foreground">
                {project.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Links */}
              {(project.demo_url || project.repository_url) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.demo_url && (
                    <Button asChild>
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-4" />
                        View Demo
                      </a>
                    </Button>
                  )}
                  {project.repository_url && (
                    <Button variant="outline" asChild>
                      <a
                        href={project.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="size-4" />
                        View Code
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evaluation Form */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prize Cohort Selection */}
              <div className="space-y-2">
                <Label>Prize Cohort</Label>
                <Select value={selectedPrizeCohort} onValueChange={setSelectedPrizeCohort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a prize cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {hackathon.prizeCohorts.map((cohort) => (
                      <SelectItem key={cohort.name} value={cohort.name}>
                        {cohort.name} - {cohort.prizeAmount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Evaluation Criteria */}
              {selectedCohort && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Evaluation Criteria</h4>
                  {selectedCohort.evaluationCriteria.map((criterion) => (
                    <Card key={criterion.name}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {criterion.name} ({criterion.points} points)
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {criterion.description}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Score (0-{criterion.points})</Label>
                          <Input
                            type="number"
                            min="0"
                            max={criterion.points}
                            value={scores[criterion.name] || 0}
                            onChange={(e) =>
                              setScores({
                                ...scores,
                                [criterion.name]: Math.min(
                                  criterion.points,
                                  Math.max(0, parseInt(e.target.value) || 0)
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Feedback</Label>
                          <Textarea
                            placeholder="Provide specific feedback for this criterion..."
                            value={feedback[criterion.name] || ""}
                            onChange={(e) =>
                              setFeedback({
                                ...feedback,
                                [criterion.name]: e.target.value,
                              })
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Overall Feedback */}
                  <div className="space-y-2">
                    <Label>Overall Feedback</Label>
                    <Textarea
                      placeholder="Provide overall feedback for this project..."
                      value={overallFeedback}
                      onChange={(e) => setOverallFeedback(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Score Summary */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Score:</span>
                        <span className="text-2xl font-bold">
                          {totalScore} / {maxScore}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${maxScore > 0 ? (totalScore / maxScore) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <Button onClick={handleSubmitEvaluation} className="w-full">
                    Submit Evaluation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  STATUS
                </h4>
                <Badge variant={project.status === 'submitted' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  TECH STACK
                </h4>
                <div className="flex flex-wrap gap-1">
                  {project.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {project.team_members && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    TEAM MEMBERS
                  </h4>
                  <div className="space-y-2">
                    {project.team_members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {typeof member === 'string' ? member.charAt(0) : '?'}
                          </span>
                        </div>
                        <span className="text-sm">
                          {typeof member === 'string' ? member : JSON.stringify(member)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}