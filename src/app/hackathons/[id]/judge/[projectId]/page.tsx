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
import { useHackathonByIdPublic } from "@/hooks/queries/use-hackathons";
import {
  useProjectById,
  useProjectHackathons,
} from "@/hooks/queries/use-projects";
import { useCurrentUser } from "@/hooks/use-auth";
import { transformDatabaseToUI } from "@/lib/helpers/hackathon-transforms";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Play, Users } from "lucide-react";

interface ProjectReviewPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default function ProjectReviewPage({ params }: ProjectReviewPageProps) {
  const { id: hackathonId, projectId } = use(params);

  const {
    data: dbHackathon,
    isLoading: hackathonLoading,
    error: hackathonError,
  } = useHackathonByIdPublic(hackathonId);
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useProjectById(projectId);
  const { data: projectHackathons = [], isLoading: projectHackathonsLoading } =
    useProjectHackathons(projectId);
  const { data: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();

  // All hooks must be called before any conditional returns
  const [selectedPrizeCohortId, setSelectedPrizeCohortId] =
    useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");

  // Transform data safely
  const hackathon = dbHackathon ? transformDatabaseToUI(dbHackathon) : null;

  // Memoize selectedCohort to prevent infinite re-renders
  const selectedCohort = useMemo(() => {
    return hackathon?.prizeCohorts.find(
      (cohort) => cohort.id === selectedPrizeCohortId,
    );
  }, [hackathon?.prizeCohorts, selectedPrizeCohortId]);

  // Initialize selectedPrizeCohortId when hackathon data is available
  useEffect(() => {
    if (hackathon && !selectedPrizeCohortId && hackathon.prizeCohorts[0]?.id) {
      setSelectedPrizeCohortId(hackathon.prizeCohorts[0].id);
    }
  }, [hackathon, selectedPrizeCohortId]);

  // Initialize scores and feedback when selectedCohort changes
  useEffect(() => {
    if (selectedCohort && selectedCohort.evaluationCriteria.length > 0) {
      const initialScores: Record<string, number> = {};
      const initialFeedback: Record<string, string> = {};

      selectedCohort.evaluationCriteria.forEach((criterion) => {
        initialScores[criterion.name] = 0;
        initialFeedback[criterion.name] = "";
      });

      // Only update if the scores are actually different
      setScores((prevScores) => {
        const isDifferent =
          Object.keys(initialScores).some((key) => !(key in prevScores)) ||
          Object.keys(prevScores).length !== Object.keys(initialScores).length;

        return isDifferent ? initialScores : prevScores;
      });

      setFeedback((prevFeedback) => {
        const isDifferent =
          Object.keys(initialFeedback).some((key) => !(key in prevFeedback)) ||
          Object.keys(prevFeedback).length !==
            Object.keys(initialFeedback).length;

        return isDifferent ? initialFeedback : prevFeedback;
      });
    }
  }, [selectedCohort?.evaluationCriteria]);

  if (hackathonLoading || projectLoading || projectHackathonsLoading || userLoading) {
    return <div>Loading...</div>;
  }

  // Validate authentication and judge access
  if (userError || !currentUser?.email) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">You must be signed in as a judge to access this page.</p>
        </div>
      </div>
    );
  }

  // Validate judge email format
  const judgeEmail = currentUser.email;
  if (!judgeEmail.includes('@') || !judgeEmail.includes('.')) {
    throw new Error('Invalid email format for judge authentication');
  }

  // Check if current user is assigned as judge for this hackathon
  const isAuthorizedJudge = hackathon?.judges?.some(judge => judge.email === judgeEmail);
  if (!isAuthorizedJudge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You are not assigned as a judge for this hackathon.</p>
        </div>
      </div>
    );
  }

  if (
    hackathonError ||
    projectError ||
    !dbHackathon ||
    !project ||
    !hackathon
  ) {
    notFound();
  }

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0,
  );
  const maxScore =
    selectedCohort?.evaluationCriteria.reduce(
      (sum, criterion) => sum + criterion.points,
      0,
    ) || 0;

  const handleSubmitEvaluation = async () => {
    if (!selectedCohort) return;

    try {
      const supabase = createClient();

      // Use authenticated user's email for judge identification
      // Email validation already performed above

      const { error } = await supabase.from("evaluations").upsert(
        {
          project_id: projectId,
          hackathon_id: hackathonId,
          prize_cohort_id:
            selectedPrizeCohortId ||
            (() => {
              throw new Error("No prize cohort selected for evaluation");
            })(),
          judge_email: judgeEmail,
          scores: scores,
          feedback: feedback,
          overall_feedback: overallFeedback,
          total_score: totalScore,
          max_possible_score: maxScore,
        },
        {
          onConflict: "project_id,hackathon_id,prize_cohort_id,judge_email",
        },
      );

      if (error) {
        console.error("Error submitting evaluation:", error);
        const errorMessage = error.message || "Unknown error occurred";
        alert(
          `Failed to submit evaluation: ${errorMessage}. Please try again.`,
        );
        return;
      }

      alert("Evaluation submitted successfully!");
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("Failed to submit evaluation. Please try again.");
    }
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Project Overview</TabsTrigger>
          <TabsTrigger value="hackathon">Hackathon</TabsTrigger>
          <TabsTrigger value="judging">Judging</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Project Description */}
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Demo and Code Links */}
              <div className="flex gap-4">
                {project.demo_url && (
                  <Button asChild>
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo Video
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
                      Pitch Video
                    </a>
                  </Button>
                )}
              </div>

              {/* Video Placeholder */}
              <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <Play className="size-6 text-black ml-1" />
                </div>
              </div>

              {/* Progress During Hackathon */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Progress During Hackathon
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  During hackathon, we accomplished following: - Frontend
                  Development: Built a user-friendly interface for NFT auctions,
                  AI quizzes, and Social interaction. - Smart Contracts:
                  Deployed key smart contracts for the token and Betting Pool on
                  the Mantle Testnet. - AI Quiz Integration: Implemented AIGC
                  DALL-E3 GPT models that generate dynamic quizzes based on live
                  sports events. Developed a functional NFT auction system that
                  allows users to bid using our tokens. - Testing and
                  Deployment: Conducted rigorous testing to ensure seamless
                  operations and deployed the project with all features
                  integrated.
                </p>
              </div>

              {/* Fundraising Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Fundraising Status
                </h3>
                <p className="text-muted-foreground">
                  Not raised any funds, but actively looking to raise.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Team Leader */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Team Leader
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Amaan Sayyad</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Github link
                    </span>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs"
                    >
                      github.com ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Sector */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Sector
                </h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    SocialFi
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Infra
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    GameFi
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    NFT
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    AI
                  </Badge>
                </div>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-xs">
                    DeFi
                  </Badge>
                </div>
              </div>

              {project.team_members && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Team Members
                  </h4>
                  <div className="space-y-2">
                    {project.team_members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {member.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <span className="text-sm">
                          {typeof member === "string"
                            ? member
                            : JSON.stringify(member)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-1">
                  {project.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Status
                </h4>
                <Badge
                  variant={
                    project.status === "submitted" ? "default" : "secondary"
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hackathon" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Submitted Hackathon</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {projectHackathons.map((submission) => {
                const hackathonData = submission.hackathon;
                const startDate = new Date(hackathonData.hackathon_start_date);
                const endDate = new Date(hackathonData.hackathon_end_date);

                return (
                  <Card key={hackathonData.id} className="relative">
                    {submission.status === "submitted" && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="default" className="bg-red-500">
                          Ended
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        {hackathonData.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {hackathonData.short_description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Winner
                          </span>
                          <p>Announced</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Tech stack
                          </span>
                          <p>
                            {hackathonData.tech_stack?.join(", ") ||
                              "All tech stack"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Level
                          </span>
                          <p>
                            {hackathonData.experience_level?.toLowerCase() ||
                              "All levels accepted"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Total prize
                          </span>
                          <p>
                            {hackathonData.prize_cohorts?.[0]?.prize_amount ||
                              "50,000.00 USD"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          Online
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          {hackathon?.participantCount
                            ? `${hackathon.participantCount} Participants`
                            : "N/A Participants"}
                        </Button>
                      </div>
                    </CardContent>

                    {/* Hackathon branding/visual */}
                    <div className="absolute top-0 right-0 w-32 h-20 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-bl-3xl" />
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="judging" className="space-y-6">
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
                      className="grid grid-cols-4 gap-4 py-4 border-b border-muted/50 items-start"
                    >
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
                          value={scores[criterion.name] || 0}
                          onChange={(e) =>
                            setScores({
                              ...scores,
                              [criterion.name]: Math.min(
                                criterion.points,
                                Math.max(0, parseInt(e.target.value) || 0),
                              ),
                            })
                          }
                          className="w-20 h-8 text-center bg-muted"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleSubmitEvaluation}
                    className="w-full"
                    disabled={!selectedPrizeCohortId}
                  >
                    Submit Evaluation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
