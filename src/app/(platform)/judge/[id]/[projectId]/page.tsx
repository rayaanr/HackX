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
import EmptyComponent from "@/components/empty";
import {
  ArrowLeft,
  Award,
  ExternalLink,
  Target,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { motion } from "motion/react";
import { CircularLoader } from "@/components/ui/loader";
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
    (p: ProjectWithHackathon) => p.id.toString() === projectId,
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
        <EmptyComponent
          title="Connect your wallet"
          description="Connect your wallet to review and evaluate project submissions"
          type="wallet-connect"
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
        { id: "evaluation-submission" },
      );
    }
  };

  return (
    <div className="-mx-4 -my-4 md:-mx-6 md:-my-6">
      <StickyPageHeader
        title={project.name || "Review Project"}
        subtitle={`Evaluating project for ${hackathon.name}`}
        backHref={`/judge/${hackathonId}`}
        actions={
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Score</p>
              <p className="text-xl font-semibold text-primary">
                {totalScore.toFixed(1)}/10
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
        }
      />
      <div className="px-4 py-6 md:px-6">
        <motion.div
          className="mx-auto max-w-4xl space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Evaluation Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Card className="border-none bg-transparent shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Award className="size-7" />
                  Judge Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 md:p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmitEvaluation)}
                    className="space-y-6"
                  >
                    {/* Scoring Criteria */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                          Evaluation Criteria
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rate each aspect of the project from 1-10
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {evaluationCriteria.map((criteria, index) => (
                        <FormField
                          key={criteria.key}
                          control={form.control}
                          name={criteria.key}
                          render={({ field }) => (
                            <FormItem>
                              <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.35,
                                  delay: index * 0.05,
                                }}
                              >
                                <Card className="space-y-3 rounded-xl border border-border/40 bg-background/30 p-3 transition-all hover:border-border/60 md:p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                      <FormLabel className="flex items-center gap-2 text-sm font-semibold md:text-base">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                          {index + 1}
                                        </div>
                                        {criteria.label}
                                      </FormLabel>
                                      <FormDescription className="pl-8 text-xs text-muted-foreground md:text-sm">
                                        {criteria.description}
                                      </FormDescription>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {field.value || 0}/10
                                    </Badge>
                                  </div>
                                  <div>
                                    <FormControl>
                                      <Rating
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="justify-start gap-1"
                                      >
                                        {Array.from({ length: 10 }, (_, i) => (
                                          <RatingButton
                                            key={i + 1}
                                            className="h-5 w-5 transition-transform hover:scale-110"
                                          />
                                        ))}
                                      </Rating>
                                    </FormControl>
                                    <FormMessage />
                                  </div>
                                </Card>
                              </motion.div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <Separator />
                    {/* Feedback Sections */}
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                    >
                      <div className="flex items-center gap-2">
                        <Lightbulb className="size-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">
                          Written Feedback
                        </h3>
                      </div>

                      <FormField
                        control={form.control}
                        name="overallFeedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required className="text-sm font-medium">
                              Overall Feedback
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Provide your overall assessment of this project..."
                                {...field}
                                rows={2}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                    </motion.div>
                    <Separator />
                    {/* Submit Button */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                      >
                        {submissionStage === "uploading" ? (
                          <>
                            <CircularLoader size="sm" className="mr-2" />
                            Uploading to IPFS...
                          </>
                        ) : submissionStage === "blockchain" ? (
                          <>
                            <CircularLoader size="sm" className="mr-2" />
                            Submitting to Blockchain...
                          </>
                        ) : submissionStage === "success" ? (
                          <>
                            <CheckCircle className="mr-2 size-4" />
                            Submitted Successfully!
                          </>
                        ) : (
                          <>
                            <Award className="mr-2 size-4" />
                            Submit Evaluation
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
