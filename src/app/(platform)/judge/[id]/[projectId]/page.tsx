"use client";

import { use, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { notFound, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ClassicLoader } from "@/components/ui/loader";
import { PageLoading } from "@/components/ui/global-loading";
import {
  useJudgeEvaluationSubmission,
  useHasJudgeScored,
  useJudgeEvaluationData,
} from "@/hooks/use-judge";
import { hasJudgingPeriodEnded } from "@/lib/helpers/date";
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
import { IPFSHashDisplay } from "@/components/ui/ipfs-hash-display";

interface ProjectReviewPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default function ProjectReviewPage({ params }: ProjectReviewPageProps) {
  const { id: hackathonId, projectId } = use(params);
  const account = useActiveAccount();
  const router = useRouter();

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
  } = useJudgeEvaluationSubmission();

  // Reactive total score calculation
  const [totalScore, setTotalScore] = useState(0);

  // Fetch hackathon and project data
  const { data: hackathon, isLoading: hackathonLoading } =
    useHackathon(hackathonId);
  const { projects, isLoading: projectsLoading } =
    useHackathonProjectsWithDetails(hackathonId);

  // Check evaluation status
  const { data: hasScored, isLoading: scoringStatusLoading } =
    useHasJudgeScored(hackathonId, projectId);
  const { data: existingEvaluation, isLoading: evaluationDataLoading } =
    useJudgeEvaluationData(hackathonId, projectId);

  // Debug logging for hook states
  useEffect(() => {
    console.log("Hook states:", {
      hasScored,
      scoringStatusLoading,
      existingEvaluation,
      evaluationDataLoading,
      account: account?.address,
    });
  }, [
    hasScored,
    scoringStatusLoading,
    existingEvaluation,
    evaluationDataLoading,
    account,
  ]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values) {
        const score = calculateTotalScore(values as JudgeRatingFormData);
        setTotalScore(score);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, calculateTotalScore]);

  // Load existing evaluation data when viewing a review
  useEffect(() => {
    console.log("Form reset effect triggered:", {
      existingEvaluation,
      hasScored,
      evaluationDataLoading,
      scoringStatusLoading,
    });

    if (existingEvaluation && hasScored) {
      console.log("Loading existing evaluation data:", existingEvaluation);
      console.log(
        "Existing evaluation structure:",
        JSON.stringify(existingEvaluation, null, 2),
      );

      const resetData = {
        // Access scores from nested scores object
        technicalExecution: existingEvaluation.scores?.technicalExecution || 0,
        innovation: existingEvaluation.scores?.innovation || 0,
        usability: existingEvaluation.scores?.usability || 0,
        marketPotential: existingEvaluation.scores?.marketPotential || 0,
        presentation: existingEvaluation.scores?.presentation || 0,
        // Access feedback from nested feedback object
        overallFeedback: existingEvaluation.feedback?.overallFeedback || "",
        strengths: existingEvaluation.feedback?.strengths || "",
        improvements: existingEvaluation.feedback?.improvements || "",
      };

      console.log("Resetting form with data:", resetData);
      form.reset(resetData);

      // Verify form values after reset
      setTimeout(() => {
        const currentValues = form.getValues();
        console.log("Form values after reset:", currentValues);
      }, 100);
    }
  }, [
    existingEvaluation,
    hasScored,
    form,
    evaluationDataLoading,
    scoringStatusLoading,
  ]);

  if (hackathonLoading || projectsLoading) {
    return <PageLoading text="Loading project details for review" />;
  }

  if (!hackathon || !projects) {
    notFound();
  }

  // Find the specific project
  const project = projects.find((p) => p && p.id.toString() === projectId);

  if (!project) {
    notFound();
  }

  // Determine evaluation state
  const judgingEnded = hasJudgingPeriodEnded(hackathon);
  const isViewMode = hasScored || judgingEnded;
  const canSubmit = !hasScored && !judgingEnded;

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
    const result = await submitEvaluation(hackathonId, projectId, data);

    if (result.success) {
      toast.success("Evaluation submitted successfully to blockchain!", {
        id: "evaluation-submission",
        action: {
          label: "View on Explorer",
          onClick: () => {
            const explorerUrl = `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${result.transactionHash}`;
            window.open(explorerUrl, "_blank");
          },
        },
      });
      form.reset(); // Reset form after successful submission

      // Navigate back to the judge page after a short delay
      setTimeout(() => {
        router.push(`/judge/${hackathonId}`);
      }, 2000);
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
                  {project.name || "Untitled Project"}
                </CardTitle>
                <CardDescription className="text-center mx-auto max-w-lg">
                  {project.intro || "No description provided"}
                </CardDescription>
                {isViewMode && (
                  <div className="mt-4 flex flex-col justify-center items-center gap-4">
                    <Badge
                      variant={hasScored ? "default" : "secondary"}
                      className="text-sm px-3 py-1"
                    >
                      {hasScored
                        ? "✓ Review Submitted"
                        : "⏰ Judging Period Ended"}
                      {existingEvaluation?.submittedAt && (
                        <span className="ml-2 opacity-75">
                          •{" "}
                          {new Date(
                            existingEvaluation.submittedAt,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </Badge>

                    {existingEvaluation?.ipfsHash && (
                      <IPFSHashDisplay ipfsHash={existingEvaluation.ipfsHash} />
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
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
                        {isViewMode
                          ? "Review the evaluation scores and feedback"
                          : "Rate each aspect of the project from 1-10"}
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
                                      <div
                                        className={
                                          isViewMode
                                            ? "pointer-events-none opacity-70"
                                            : ""
                                        }
                                      >
                                        <Rating
                                          value={field.value}
                                          onValueChange={
                                            isViewMode
                                              ? () => {}
                                              : field.onChange
                                          }
                                          className="justify-start gap-1"
                                        >
                                          {Array.from(
                                            { length: 10 },
                                            (_, i) => (
                                              <RatingButton
                                                key={i + 1}
                                                className="h-5 w-5 transition-transform hover:scale-110"
                                              />
                                            ),
                                          )}
                                        </Rating>
                                      </div>
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
                          {isViewMode ? "Judge Feedback" : "Written Feedback"}
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
                                disabled={isViewMode}
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
                                  disabled={isViewMode}
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
                                  disabled={isViewMode}
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
                        type={isViewMode ? "button" : "submit"}
                        disabled={isSubmitting || isViewMode}
                        className="w-full"
                        size="lg"
                        variant={isViewMode ? "secondary" : "default"}
                      >
                        {isViewMode ? (
                          hasScored ? (
                            <>
                              <CheckCircle className="size-4" />
                              Review Already Submitted
                            </>
                          ) : (
                            <>
                              <Award className="size-4" />
                              Judging Period Ended
                            </>
                          )
                        ) : submissionStage === "uploading" ? (
                          <>
                            <ClassicLoader size="sm" className="mr-2" />
                            Uploading to IPFS...
                          </>
                        ) : submissionStage === "blockchain" ? (
                          <>
                            <ClassicLoader size="sm" className="mr-2" />
                            Submitting to Blockchain...
                          </>
                        ) : submissionStage === "success" ? (
                          <>
                            <CheckCircle className="size-4" />
                            Submitted Successfully!
                          </>
                        ) : (
                          <>
                            <Award className="size-4" />
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
