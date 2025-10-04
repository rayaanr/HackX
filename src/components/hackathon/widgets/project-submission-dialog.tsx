"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Plus, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBlockchainProjects } from "@/hooks/use-projects";
import { resolveIPFSToHttp } from "@/lib/helpers/ipfs";
import { formatRelativeDate } from "@/lib/helpers/date";
import EmptyComponent from "@/components/empty";

interface ProjectSubmissionDialogProps {
  hackathonId: string;
  children: React.ReactNode;
}

export function ProjectSubmissionDialog({
  hackathonId,
  children,
}: ProjectSubmissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const {
    userProjects = [],
    isLoadingUserProjects,
    submitToHackathon,
    isSubmittingToHackathon,
  } = useBlockchainProjects();

  const handleSubmit = () => {
    if (!selectedProjectId) {
      toast.error("Please select a project to submit");
      return;
    }

    toast.loading("Submitting project to hackathon...", {
      id: "submit-to-hackathon",
    });

    submitToHackathon(
      {
        projectId: selectedProjectId,
        hackathonId: hackathonId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedProjectId(null);
        },
        onError: (error) => {
          console.error("Failed to submit project:", error);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Project to Hackathon</DialogTitle>
          <DialogDescription>
            Select one of your existing projects to submit to this hackathon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingUserProjects ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userProjects.length === 0 ? (
            <EmptyComponent
              title="No projects found"
              description="You haven't created any projects yet. Create a new project to submit to this hackathon."
              type="info"
              variant="card"
            />
          ) : (
            <div className="grid gap-3">
              {userProjects
                .filter((project) => project !== null)
                .map((project) => (
                  <Card
                    key={project.id}
                    className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                      selectedProjectId === project.id.toString()
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedProjectId(project.id.toString())}
                  >
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Avatar className="size-14 rounded-md ring-1 ring-white/10">
                          <AvatarImage
                            src={resolveIPFSToHttp(project.logo)}
                            alt={project.name || "Project logo"}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-md">
                            {(project.name || "P").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">
                              {project.name}
                            </h3>
                            {selectedProjectId === project.id.toString() && (
                              <CheckCircle className="size-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {project.intro}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {project.techStack &&
                              project.techStack.length > 0 && (
                                <div className="flex gap-1">
                                  {project.techStack
                                    .slice(0, 3)
                                    .map((tech: string) => (
                                      <Badge
                                        key={tech}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0"
                                      >
                                        {tech}
                                      </Badge>
                                    ))}
                                  {project.techStack.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      +{project.techStack.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            <span>
                              Created{" "}
                              {formatRelativeDate(project.createdAt || "")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmittingToHackathon}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedProjectId || isSubmittingToHackathon}
          >
            {isSubmittingToHackathon ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Project
                <ArrowRight className="size-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
