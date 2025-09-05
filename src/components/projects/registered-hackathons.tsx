"use client";

import {
  Calendar,
  Code,
  Trophy,
  Link as LinkIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRegisteredHackathons } from "@/hooks/queries/use-projects";
import { getDaysLeft, formatDisplayDate } from "@/lib/utils/date";
import Link from "next/link";
import Image from "next/image";

export function RegisteredHackathons() {
  const {
    data: registrations = [],
    isLoading: loading,
    error,
  } = useRegisteredHackathons();

  const getStatusBadge = (hackathon: any) => {
    const now = new Date();
    const regEnd = hackathon.registration_end_date
      ? new Date(hackathon.registration_end_date)
      : null;
    const hackStart = hackathon.hackathon_start_date
      ? new Date(hackathon.hackathon_start_date)
      : null;
    const hackEnd = hackathon.hackathon_end_date
      ? new Date(hackathon.hackathon_end_date)
      : null;

    if (regEnd && now < regEnd) {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          Registration Open
        </Badge>
      );
    } else if (hackStart && hackEnd && now >= hackStart && now <= hackEnd) {
      return <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>;
    } else if (hackEnd && now > hackEnd) {
      return <Badge variant="secondary">Completed</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>
        <div className="text-center py-12">
          <p className="text-destructive">
            Failed to load registered hackathons
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="flex">
                <div className="flex-1 p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/3 p-6">
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registered Hackathons</h2>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No registered hackathons
            </h3>
            <p className="text-muted-foreground mb-4">
              Register for hackathons to track your participation and submit
              projects
            </p>
            <Button asChild>
              <Link href="/hackathons">Browse Hackathons</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {registrations.map((registration) => {
            const hackathon = registration.hackathon;
            return (
              <Card
                key={hackathon.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  <div className="flex-1 p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CardTitle className="text-xl">
                            {hackathon.name}
                          </CardTitle>
                          {getStatusBadge(hackathon)}
                        </div>
                        <CardAction className="p-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/hackathons/${hackathon.id}`}>
                                  <LinkIcon className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start p-0 h-auto font-normal"
                                  asChild
                                >
                                  <Link
                                    href={`/projects/create?hackathon=${hackathon.id}`}
                                  >
                                    Submit Project
                                  </Link>
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardAction>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <p className="text-muted-foreground mb-6">
                        {hackathon.short_description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <h6 className="flex items-center text-sm text-muted-foreground mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Registration closes
                          </h6>
                          <p className="text-sm font-medium">
                            {hackathon.registration_end_date
                              ? `Registration ${getDaysLeft(hackathon.registration_end_date)} days left`
                              : "Registration TBD"}
                          </p>
                        </div>
                        <div>
                          <h6 className="flex items-center text-sm text-muted-foreground mb-1">
                            <Code className="w-4 h-4 mr-1" />
                            Tech stack
                          </h6>
                          <p className="text-sm font-medium">
                            {hackathon.tech_stack &&
                            hackathon.tech_stack.length > 0
                              ? "All tech stack"
                              : "Any"}
                          </p>
                        </div>
                        <div>
                          <h6 className="flex items-center text-sm text-muted-foreground mb-1">
                            <Trophy className="w-4 h-4 mr-1" />
                            Level
                          </h6>
                          <p className="text-sm font-medium capitalize">
                            {hackathon.experience_level
                              ? hackathon.experience_level.toLowerCase() +
                                " levels accepted"
                              : "All levels accepted"}
                          </p>
                        </div>
                        <div>
                          <h6 className="flex items-center text-sm text-muted-foreground mb-1">
                            <Trophy className="w-4 h-4 mr-1" />
                            Total prize
                          </h6>
                          <p className="text-sm font-medium">TBD</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <Button asChild>
                          <Link
                            href={`/projects/create?hackathon=${hackathon.id}`}
                          >
                            Submit Project
                          </Link>
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">
                            {hackathon.hackathon_start_date
                              ? formatDisplayDate(
                                  hackathon.hackathon_start_date,
                                )
                              : "TBD"}
                          </span>{" "}
                          -{" "}
                          <span className="font-medium">
                            {hackathon.hackathon_end_date
                              ? formatDisplayDate(hackathon.hackathon_end_date)
                              : "TBD"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <div className="relative w-1/3 min-h-[200px]">
                    <Image
                      src={hackathon.visual || "/placeholder.svg"}
                      alt={hackathon.name}
                      fill
                      className="object-cover rounded-r-lg"
                      unoptimized
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
