"use client";

import { use } from "react";
import { useActiveAccount } from "thirdweb/react";
import { notFound } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { ProjectWithHackathon } from "@/types/hackathon";
import { useJudgeEvaluation } from "@/hooks/blockchain/use-judge";
import {
  judgeRatingSchema,
  defaultJudgeRatingValues,
  evaluationCriteria,
  type JudgeRatingFormData,
} from "@/lib/schemas/judge-schema";

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
  const project = projects.find((p: ProjectWithHackathon) => p.id.toString() === projectId);

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


  const handleSubmitEvaluation = async (data: JudgeRatingFormData) => {
    if (!account?.address) {
      toast.error("Please connect your wallet to submit evaluation.");
      return;
    }

    // Show initial loading toast
    toast.loading("Uploading feedback to IPFS...", { id: "evaluation-submission" });

    // Start the submission process
    const result = await submitEvaluation(projectId, data);

    if (result.success) {
      toast.success("Evaluation submitted successfully to blockchain!", { id: "evaluation-submission" });
      form.reset(); // Reset form after successful submission
    } else {
      toast.error(result.error || "Failed to submit evaluation. Please try again.", { id: "evaluation-submission" });
    }
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
        {/* Evaluation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-4" />
              Judge Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitEvaluation)} className="space-y-6">
                {/* Scoring Criteria */}
                <div className="space-y-6">
                  {evaluationCriteria.map((criteria) => (
                    <FormField
                      key={criteria.key}
                      control={form.control}
                      name={criteria.key}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            {criteria.label}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {criteria.description}
                          </FormDescription>
                          <FormControl>
                            <div className="space-y-2">
                              <Rating
                                value={field.value}
                                onValueChange={field.onChange}
                                className="justify-start"
                              >
                                {Array.from({ length: 10 }, (_, i) => (
                                  <RatingButton key={i + 1} />
                                ))}
                              </Rating>
                              <p className="text-xs text-right text-muted-foreground">
                                Score: {field.value || 0}/10
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <Separator />

                {/* Total Score Display */}
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Total Score</p>
                  <p className="text-2xl font-bold text-primary">{calculateTotalScore(form.getValues())}/10</p>
                </div>

                <Separator />

                {/* Feedback Sections */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="overallFeedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Feedback *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide your overall assessment of this project..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="strengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strengths</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What are the project's main strengths?"
                            {...field}
                            rows={3}
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
                        <FormLabel>Areas for Improvement</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What could be improved?"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      <Award className="size-4 mr-2" />
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