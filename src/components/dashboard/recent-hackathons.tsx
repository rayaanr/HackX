import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { HackathonWithRelations } from "@/types/hackathon";
import {
  getHackathonStatus,
  getStatusVariant,
  formatDateForDisplay,
  calculateTotalPrizeAmount,
} from "@/lib/helpers/hackathon-transforms";

interface RecentHackathonsProps {
  hackathons: HackathonWithRelations[];
  loading?: boolean;
}

export function RecentHackathons({
  hackathons,
  loading = false,
}: RecentHackathonsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show most recent hackathons (up to 5)
  const recentHackathons = [...hackathons]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Hackathons</CardTitle>
          <Link href="/hackathons/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentHackathons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You haven't created any hackathons yet
            </p>
            <Link href="/hackathons/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Hackathon
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentHackathons.map((hackathon) => {
              const status = getHackathonStatus(hackathon);
              const variant = getStatusVariant(status);
              const totalPrize = calculateTotalPrizeAmount(hackathon);

              return (
                <Link key={hackathon.id} href={`/hackathons/${hackathon.id}`}>
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {hackathon.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">
                          {hackathon.name}
                        </h3>
                        <Badge variant={variant} className="text-xs">
                          {status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{hackathon.location}</span>
                        <span>{totalPrize}</span>
                        <span>
                          {formatDateForDisplay(hackathon.hackathon_start_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
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
