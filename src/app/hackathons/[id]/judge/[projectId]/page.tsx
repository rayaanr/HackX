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

// At the top of src/app/hackathons/[id]/judge/[projectId]/page.tsx
import { use, useEffect, useState } from "react";

export default function JudgeProjectPage({ hackathon, project }) {
  const [selectedPrizeCohort, setSelectedPrizeCohort] = useState<string>(
    hackathon.prizeCohorts[0]?.name || ""
  );
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Get evaluation criteria from the selected prize cohort
  const selectedCohort = hackathon.prizeCohorts.find(
    (cohort) => cohort.name === selectedPrizeCohort
  );
  const evaluationCriteria = selectedCohort?.evaluationCriteria || [];

  // Reset form state when cohort changes
  useEffect(() => {
    setScores({});
    setOverallFeedback("");
  }, [selectedPrizeCohort]);

  // ...rest of component
}
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
            Back to {hackathon.name} Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
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
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Project Overview</TabsTrigger>
          <TabsTrigger value="hackathon">Hackathon</TabsTrigger>
          <TabsTrigger value="judging">Judging</TabsTrigger>
        </TabsList>

        {/* Project Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {project.fullDescription || project.description}
                  </p>
                </CardContent>
              </Card>

              {/* Demo and Pitch Videos */}
              <div className="grid gap-4 sm:grid-cols-2">
                {project.demoUrl && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Demo Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="size-4" />
                          Watch Demo
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {project.pitchVideoUrl && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Pitch Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <a href={project.pitchVideoUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="size-4" />
                          Watch Pitch
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Progress During Hackathon */}
              {project.progressDuringHackathon && (
                <Card>
                  <CardHeader>
                    <CardTitle>Progress During Hackathon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {project.progressDuringHackathon}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Fundraising Status */}
              {project.fundraisingStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fundraising Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {project.fundraisingStatus}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Team Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Team Leader</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="font-medium">{project.team.leader}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">GitHub link</Label>
                    <p className="text-sm text-blue-600 hover:underline">
                      <a href={`https://${project.githubLink || project.githubUrl}`} target="_blank" rel="noopener noreferrer">
                        {project.githubLink || project.githubUrl?.replace('https://', '')}
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Sector</Label>
                    <p className="font-medium">{project.sector}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">DeFi Protocol</Label>
                    <p className="font-medium">{project.defiProtocol}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tech Stack</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.techStack.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.team.members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Hackathon Tab */}
        <TabsContent value="hackathon" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-6">Submitted Hackathon</h2>
            
            {project.hackathonSubmissions && project.hackathonSubmissions.length > 0 ? (
              <div className="space-y-6">
                {project.hackathonSubmissions.map((submission) => (
                  <Card key={submission.hackathonId} className="overflow-hidden">
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Left side - Hackathon details */}
                      <div className="md:col-span-2 p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{submission.hackathonName}</h3>
                              <Badge 
                                variant={
                                  submission.status === "ended" ? "secondary" :
                                  submission.status === "live" ? "default" :
                                  submission.status === "voting" ? "outline" : "secondary"
                                }
                                className={
                                  submission.status === "ended" ? "bg-gray-100 text-gray-800" :
                                  submission.status === "live" ? "bg-green-100 text-green-800" :
                                  "bg-blue-100 text-blue-800"
                                }
                              >
                                {submission.status === "ended" ? "Ended" : 
                                 submission.status === "live" ? "Live" :
                                 submission.status === "voting" ? "Voting" : "Upcoming"}
                              </Badge>
                              {submission.isWinner && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                  {submission.placement}
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {submission.hackathonName}. Was born from a simple but radical belief: true innovation shouldn't be strangled by black-box algorithms
                            </p>
                          </div>
                        </div>

                        {/* Hackathon stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Winner</div>
                            <div className="font-medium text-sm">
                              {submission.isWinner ? submission.placement || "Yes" : "Announced"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Tech stack</div>
                            <div className="font-medium text-sm">{submission.techStack.join(", ")}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Level</div>
                            <div className="font-medium text-sm">{submission.level}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Total prize</div>
                            <div className="font-medium text-sm">{submission.prizePool}</div>
                          </div>
                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-3 pt-2">
                          <Badge variant="secondary" className="text-xs">
                            {submission.status === "live" ? "Online" : "Online"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {submission.participants} Participants
                          </Badge>
                          {submission.status === "live" && submission.votingEndDate && (
                            <div className="text-xs text-muted-foreground">
                              Voting {Math.ceil((submission.votingEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Hackathon branding */}
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col justify-center relative overflow-hidden">
                        {/* Circuit pattern background */}
                        <div className="absolute inset-0 opacity-10">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M10,0 L10,20 M0,10 L20,10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                                <circle cx="10" cy="10" r="1" fill="currentColor"/>
                              </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#circuit)"/>
                          </svg>
                        </div>

                        <div className="relative z-10 text-center text-white">
                          <div className="text-xs mb-2 opacity-80">
                            {submission.hackathonName.split(" ")[0].toUpperCase()}
                          </div>
                          <h4 className="font-bold text-lg mb-1 leading-tight">
                            {submission.hackathonName.includes("Ledgerforge") ? "LEDGERFORGE\nHACKATHON" :
                             submission.hackathonName.includes("Cryptovate") ? "CRYPTOVATE\nHACK" :
                             submission.hackathonName.toUpperCase().split(" ").join("\n")}
                          </h4>
                          <div className="text-xs mb-3 opacity-80">
                            {submission.hackathonName.includes("Ledgerforge") ? "CHAIN SECURITY LAB" :
                             submission.hackathonName.includes("Cryptovate") ? "DIGITAL IDENTITY\nSPRINT" :
                             "HACKATHON"}
                          </div>
                          <div className="text-xs mb-1 opacity-80">
                            Focus: {submission.hackathonName.includes("Ledgerforge") ? "Smart Contract Auditing & Risk Mitigation" :
                                   submission.hackathonName.includes("Cryptovate") ? "Secure Credentials & Reputation" :
                                   "Innovation & Development"}
                          </div>
                          <div className="text-lg font-bold text-cyan-400 mb-1">
                            {submission.prizePool.includes("50,000") ? "$41,000 PRIZE POOL" :
                             submission.prizePool.includes("40,000") ? "PRIZE: $37,500" :
                             submission.prizePool}
                          </div>
                          <div className="text-xs opacity-80">
                            {submission.hackathonName.includes("Ledgerforge") ? "January 12-16, 2024" :
                             submission.hackathonName.includes("Cryptovate") ? "DECEMBER 1-8, 2024" :
                             "Dates TBA"}
                          </div>
                        </div>

                        {/* Fingerprint icon */}
                        <div className="absolute bottom-4 right-4 opacity-20">
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
                            <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
                            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
                            <path d="M2 12a10 10 0 0 1 18-6"/>
                            <path d="M2 16h.01"/>
                            <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
                            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
                            <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
                            <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hackathon submissions found for this project.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Judging Tab */}
        <TabsContent value="judging" className="space-y-6">
          {/* Prize Cohort Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select A Prize Cohort</Label>
            </div>
            <Select value={selectedPrizeCohort} onValueChange={setSelectedPrizeCohort}>
              <SelectTrigger className="w-full max-w-md bg-muted/50 border-muted">
                <SelectValue placeholder="Select a prize cohort" />
              </SelectTrigger>
              <SelectContent>
                {hackathon.prizeCohorts.map((cohort) => (
                  <SelectItem key={cohort.name} value={cohort.name}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Evaluation Criteria Table */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Evaluation Criteria</Label>
            </div>
            
            <div className="rounded-lg border bg-card overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 border-b font-medium text-sm">
                <div className="col-span-3">Name</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Max Score</div>
                <div className="col-span-2 text-center">Your Score</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y">
                {evaluationCriteria.map((criteria, index) => (
                  <div key={criteria.name} className="grid grid-cols-12 gap-4 p-4 items-start">
                    <div className="col-span-3">
                      <div className="font-medium text-sm">{criteria.name}</div>
                    </div>
                    <div className="col-span-5">
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {criteria.description}
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="text-sm font-medium">{criteria.points}</div>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={0}
                        max={criteria.points}
                        step={1}
                        inputMode="numeric"
                        placeholder="0"
                        value={scores[criteria.name] ?? ""}
                        onChange={(e) => {
                          const v = e.currentTarget.valueAsNumber;
                          if (Number.isFinite(v)) {
                            const clamped = Math.min(Math.max(v, 0), criteria.points);
                            setScores((prev) => ({ ...prev, [criteria.name]: clamped }));
                          } else {
                            setScores((prev) => {
                              const next = { ...prev };
                              delete next[criteria.name];
                              return next;
                            });
                          }
                        }}
                        className="w-full text-center"
                      />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Feedback */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Additional Feedback (Optional)</Label>
            </div>
            <Textarea
              placeholder="Provide overall feedback for the team..."
              className="min-h-[120px]"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
            />
          </div>

          {/* Score Summary and Submit */}
          <div className="flex items-center justify-between p-6 bg-muted/20 rounded-lg">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Score</div>
              <div className="text-2xl font-bold">
                {calculateTotalScore()}/{getMaxTotalScore()}
              </div>
            </div>
            <Button 
              size="lg"
              onClick={handleSubmitReview}
              disabled={Object.keys(scores).length !== evaluationCriteria.length}
              className="px-8"
            >
              Submit Evaluation
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}