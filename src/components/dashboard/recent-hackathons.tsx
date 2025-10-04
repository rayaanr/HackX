import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarList } from "@/components/ui/avatar-list";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { GlobalLoading } from "@/components/ui/global-loading";
import type { UIHackathon } from "@/types/hackathon";
import { getHackathonStatusVariant } from "@/lib/helpers/status";
import { getUIHackathonStatus } from "@/lib/helpers/date";
import { calculateTotalPrizeAmount } from "@/lib/helpers/blockchain-transforms";
import { format } from "date-fns";
import EmptyComponent from "@/components/empty";
import { useHackathonParticipants } from "@/hooks/use-hackathons";

interface RecentHackathonsProps {
  hackathons: UIHackathon[];
  loading?: boolean;
}

// Component to fetch and display participant count for a single hackathon
function HackathonParticipantCount({
  hackathonId,
}: {
  hackathonId: string | number;
}) {
  const { data: participants = [] } = useHackathonParticipants(hackathonId);

  // Always show placeholder avatars
  const placeholderImages = [
    { src: "/placeholder-user.jpg", alt: "Participant 1" },
    { src: "/placeholder-user.jpg", alt: "Participant 2" },
    { src: "/placeholder-user.jpg", alt: "Participant 3" },
  ];

  return (
    <AvatarList
      images={placeholderImages}
      totalCount={participants.length}
      additionalCount={0}
      className="border-0 shadow-none"
    />
  );
}

export function RecentHackathons({
  hackathons,
  loading = false,
}: RecentHackathonsProps) {
  if (loading) {
    return (
      <Card className="project-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="group-hover:text-white transition-colors">
              Recent Hackathons
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <GlobalLoading
            variant="component"
            text="Loading recent hackathons"
            height="250px"
            size="md"
          />
        </CardContent>
      </Card>
    );
  }

  // Show most recent hackathons (up to 5)
  const recentHackathons = [...hackathons]
    .sort(
      (a, b) =>
        new Date(b.hackathonPeriod?.hackathonStartDate || 0).getTime() -
        new Date(a.hackathonPeriod?.hackathonStartDate || 0).getTime(),
    )
    .slice(0, 5);

  return (
    <Card className="project-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="group-hover:text-white transition-colors">
            Recent Hackathons
          </CardTitle>
          <Link href="/hackathons/create">
            <Button
              size="sm"
              className="hover:bg-white/10 hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Hackathon
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentHackathons.length === 0 ? (
          <EmptyComponent
            title="No hackathons yet"
            description="You haven't created any hackathons yet"
            type="info"
            variant="ghost"
            action={
              <Link href="/hackathons/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Hackathon
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {recentHackathons.map((hackathon, index) => {
              const status = getUIHackathonStatus({
                ...hackathon,
                votingPeriod: hackathon.votingPeriod || undefined,
              });
              const variant = getHackathonStatusVariant(status);
              const totalPrize = calculateTotalPrizeAmount(
                hackathon.prizeCohorts || [],
              );

              return (
                <motion.div
                  key={hackathon.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 * index,
                    duration: 0.5,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  <Link href={`/hackathons/${hackathon.id}`}>
                    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/20">
                      <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <span className="text-lg font-semibold text-white/80 group-hover:text-white transition-colors">
                          {hackathon.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate text-white/90 group-hover:text-white transition-colors">
                            {hackathon.name}
                          </h3>
                          <Badge variant={variant} className="text-xs">
                            {status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60 group-hover:text-white/80 transition-colors">
                          <span>{hackathon.location}</span>
                          <span>{totalPrize}</span>
                          <span>
                            {hackathon.hackathonPeriod?.hackathonStartDate
                              ? format(
                                  hackathon.hackathonPeriod.hackathonStartDate,
                                  "dd MMM yyyy",
                                )
                              : "TBD"}
                          </span>
                        </div>
                      </div>
                      <HackathonParticipantCount hackathonId={hackathon.id} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {hackathons.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/hackathons">
                  <Button variant="outline" size="sm">
                    View All Hackathons
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
