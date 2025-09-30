"use client";

import { use, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { notFound } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Rating, RatingButton } from "@/components/ui/rating";
import { WalletConnectionPrompt } from "@/components/wallet/wallet-connection-prompt";
import {
  ArrowLeft,
  Clock,
  Award,
  ExternalLink,
  Star,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ProjectWithHackathon } from "@/types/hackathon";
import { useJudgeEvaluation } from "@/hooks/use-judge";
import {
  judgeRatingSchema,
  defaultJudgeRatingValues,
  evaluationCriteria,
  type JudgeRatingFormData,
} from "@/lib/schemas/judge-schema";
import {
  useHackathon,
  useHackathonProjectsWithDetails,
} from "@/hooks/use-hackathons";

interface ProjectReviewPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default function ProjectReviewPage({ params }: ProjectReviewPageProps) {
  const { id: hackathonId, projectId } = use(params);
  const account = useActiveAccount();

  // React Hook Form setup
  const form = useForm<JudgeRatingFormData>({
    resolver: zodResolver(judgeRatingSchema),
    defaultValues: defaultJudgeRatingValues,
  });

  // Use judge blockchain hook
  const {
    isSubmitting,
    submissionStage,
    submitEvaluation,
    calculateTotalScore,
  } = useJudgeEvaluation();

  // Reactive total score calculation
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values) {
        const score = calculateTotalScore(values as JudgeRatingFormData);
        setTotalScore(score);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, calculateTotalScore]);

  // Fetch hackathon and project data
  const { data: hackathon, isLoading: hackathonLoading } =
    useHackathon(hackathonId);
  const { projects, isLoading: projectsLoading } =
    useHackathonProjectsWithDetails(hackathonId);

  if (hackathonLoading || projectsLoading) {
    return <div>Loading...</div>;
  }

  if (!hackathon || !projects) {
    notFound();
  }

  // Find the specific project
  const project = projects.find(
    (p: ProjectWithHackathon) => p.id.toString() === projectId
  );

  if (!project) {
    notFound();
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/judge/${hackathonId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Review Project
            </h1>
            <p className="text-muted-foreground">
              Connect your wallet to review and evaluate project submissions
            </p>
          </div>
        </div>
        <WalletConnectionPrompt
          title="Connect your wallet"
          description="Connect your wallet to review and evaluate project submissions"
        />
      </div>
    );
  }

  const handleSubmitEvaluation = async (data: JudgeRatingFormData) => {
    if (!account?.address) {
      toast.error("Please connect your wallet to submit evaluation.");
      return;
    }

    // Show initial loading toast
    toast.loading("Uploading feedback to IPFS...", {
      id: "evaluation-submission",
    });

    // Start the submission process
    const result = await submitEvaluation(projectId, data);

    if (result.success) {
      toast.success("Evaluation submitted successfully to blockchain!", {
        id: "evaluation-submission",
      });
      form.reset(); // Reset form after successful submission
    } else {
      toast.error(
        result.error || "Failed to submit evaluation. Please try again.",
        { id: "evaluation-submission" }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/judge/${hackathon.id}`}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="text-muted-foreground">
              Evaluating project for {hackathon.name}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/projects/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4 mr-2" />
              View Project
            </Link>
          </Button>
        </div>

        {/* Project Quick Info */}
        <div className="flex flex-wrap gap-2">
          {project.techStack &&
            project.techStack.length > 0 &&
            project.techStack.slice(0, 3).map((tech: string) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          {project.techStack && project.techStack.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.techStack.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      <div className="gap-6">
        {/* Evaluation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="size-5" />
                Judge Evaluation
              </div>
              <Badge variant="outline" className="text-xs">
                <Star className="size-3 mr-1" />
                {totalScore.toFixed(1)}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmitEvaluation)}
                className="space-y-8"
              >
                {/* Total Score Display */}
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Current Average Score
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {totalScore.toFixed(1)}/10
                  </p>
                </div>{" "}
                {/* Scoring Criteria */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">
                      Evaluation Criteria
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rate each aspect of the project from 1-10
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {evaluationCriteria.map((criteria, index) => (
                    <FormField
                      key={criteria.key}
                      control={form.control}
                      name={criteria.key}
                      render={({ field }) => (
                        <FormItem>
                          <Card className="p-4 border-l-4 border-l-blue-500/30 hover:border-l-blue-500/60 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <FormLabel className="text-base font-semibold flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                    {index + 1}
                                  </div>
                                  {criteria.label}
                                </FormLabel>
                                <FormDescription className="text-sm text-muted-foreground mt-1 ml-8">
                                  {criteria.description}
                                </FormDescription>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                {field.value || 0}/10
                              </Badge>
                            </div>
                            <div className="ml-8">
                              <FormControl>
                                <Rating
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="justify-start gap-1"
                                >
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <RatingButton
                                      key={i + 1}
                                      className="w-6 h-6 hover:scale-110 transition-transform"
                                    />
                                  ))}
                                </Rating>
                              </FormControl>
                              <FormMessage />
                            </div>
                          </Card>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Separator />
                {/* Feedback Sections */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">Written Feedback</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="overallFeedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Overall Feedback *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide your overall assessment of this project..."
                            {...field}
                            rows={3}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="strengths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Strengths
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Project's main strengths..."
                              {...field}
                              rows={2}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="improvements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Areas for Improvement
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What could be enhanced..."
                              {...field}
                              rows={2}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Separator />
                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {submissionStage === "uploading" ? (
                    <>
                      <Clock className="size-4 mr-2 animate-spin" />
                      Uploading to IPFS...
                    </>
                  ) : submissionStage === "blockchain" ? (
                    <>
                      <Clock className="size-4 mr-2 animate-spin" />
                      Submitting to Blockchain...
                    </>
                  ) : submissionStage === "success" ? (
                    <>
                      <CheckCircle className="size-4 mr-2" />
                      Submitted Successfully!
                    </>
                  ) : (
                    <>
                      <Award className="size-4 mr-2" />
                      Submit Evaluation
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
