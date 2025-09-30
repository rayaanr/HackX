import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Trophy, Users, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { CardLoading } from "@/components/ui/global-loading";
import { SlidingNumber } from "../ui/anim/sliding-number";
import type { DashboardStats } from "@/types/hackathon";

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardLoading
            key={i}
            text="Loading stats"
            size="sm"
            height="120px"
            className="project-card-hover"
          />
        ))}
      </div>
    );
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariants}
        transition={{
          delay: 0,
          duration: 0.5,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        <Card className="project-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-white transition-colors">
              Total Hackathons
            </CardTitle>
            <Calendar className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-white transition-colors font-mono">
              <SlidingNumber value={stats.totalHackathons} />
            </div>
            <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
              All your hackathons
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariants}
        transition={{
          delay: 0.1,
          duration: 0.5,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        <Card className="project-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-white transition-colors">
              Active Events
            </CardTitle>
            <Users className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-white transition-colors font-mono">
              <SlidingNumber value={stats.activeHackathons} />
            </div>
            <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
              Currently running
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariants}
        transition={{
          delay: 0.2,
          duration: 0.5,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        <Card className="project-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-white transition-colors">
              Completed Events
            </CardTitle>
            <Trophy className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-white transition-colors font-mono">
              <SlidingNumber value={stats.completedHackathons} />
            </div>
            <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
              Successfully finished
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUpVariants}
        transition={{
          delay: 0.3,
          duration: 0.5,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        <Card className="project-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-white transition-colors">
              Total Prize Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-white transition-colors">
              {stats.totalPrizeValue}
            </div>
            <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
              Across all events
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
