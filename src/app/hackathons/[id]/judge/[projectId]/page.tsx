"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { hackathons } from "@/data/hackathons";
import { getProjectById } from "@/data/projects";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Play, Users } from "lucide-react";

interface ProjectReviewPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default function ProjectReviewPage({ params }: ProjectReviewPageProps) {
  const { id: hackathonId, projectId } = use(params);
  
  const hackathon = hackathons.find(h => h.id === hackathonId);
  const project = getProjectById(projectId);
  
  if (!hackathon || !project) {
    notFound();
  }

  // Get evaluation criteria from the hackathon's prize cohorts
  const evaluationCriteria = hackathon.prizeCohorts[0]?.evaluationCriteria || [];
  
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");

  const handleScoreChange = (criteriaName: string, score: number) => {
    setScores(prev => ({ ...prev, [criteriaName]: score }));
  };

  const handleFeedbackChange = (criteriaName: string, feedbackText: string) => {
    setFeedback(prev => ({ ...prev, [criteriaName]: feedbackText }));
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const getMaxTotalScore = () => {
    return evaluationCriteria.reduce((sum, criteria) => sum + criteria.points, 0);
  };

  const handleSubmitReview = () => {
    // Here you would typically send the review data to your backend
    console.log({
      projectId,
      scores,
      feedback,
      overallFeedback,
      totalScore: calculateTotalScore(),
      maxTotalScore: getMaxTotalScore()
    });
    
    // Show success message and redirect back to judging page
    alert("Review submitted successfully!");
    window.location.href = `/hackathons/${hackathonId}/judge`;
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
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Project</h1>
        <p className="text-muted-foreground">
          Evaluate and provide feedback for this hackathon submission
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                {project.logo ? (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <Image 
                      src={project.logo} 
                      alt={project.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-2xl font-semibold text-muted-foreground">
                      {project.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{project.status}</Badge>
                    <span className="text-sm text-muted-foreground">by {project.builder}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{project.description}</p>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Team</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="font-medium">{project.team.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.team.members.join(", ")}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Tech Stack</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Links */}
              <div className="flex flex-wrap gap-3">
                {project.demoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                      Demo
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="size-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {project.videoUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="size-4" />
                      Video
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scoring Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scoring Criteria */}
              {evaluationCriteria.map((criteria) => (
                <div key={criteria.name} className="space-y-3">
                  <div>
                    <Label className="font-medium">{criteria.name}</Label>
                    <p className="text-sm text-muted-foreground">{criteria.description}</p>
                    <p className="text-xs text-muted-foreground">Max: {criteria.points} points</p>
                  </div>
                  
                  <div>
                    <Input
                      type="number"
                      min={0}
                      max={criteria.points}
                      placeholder={`0-${criteria.points}`}
                      value={scores[criteria.name] || ""}
                      onChange={(e) => handleScoreChange(criteria.name, Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder="Feedback for this criteria..."
                      className="min-h-[60px]"
                      value={feedback[criteria.name] || ""}
                      onChange={(e) => handleFeedbackChange(criteria.name, e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Separator />

              {/* Overall Feedback */}
              <div className="space-y-3">
                <Label className="font-medium">Overall Feedback</Label>
                <Textarea
                  placeholder="Provide overall feedback for the team..."
                  className="min-h-[100px]"
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                />
              </div>

              {/* Score Summary */}
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between font-medium">
                  <span>Total Score</span>
                  <span>{calculateTotalScore()}/{getMaxTotalScore()}</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(calculateTotalScore() / getMaxTotalScore()) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full"
                onClick={handleSubmitReview}
                disabled={Object.keys(scores).length !== evaluationCriteria.length}
              >
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}