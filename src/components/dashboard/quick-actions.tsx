"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Users, Settings } from "lucide-react";
import { motion } from "motion/react";

const quickActions = [
  {
    href: "/hackathons/create",
    icon: Plus,
    label: "Create New Hackathon",
    description: "Start a new hackathon event",
    disabled: false,
  },
  {
    href: "/hackathons",
    icon: Calendar,
    label: "View All Events",
    description: "Browse all hackathons",
    disabled: false,
  },
  {
    href: "/projects",
    icon: Users,
    label: "Manage Projects",
    description: "View and manage submissions",
    disabled: false,
  },
  {
    href: "#",
    icon: Settings,
    label: "Event Settings",
    description: "Configure hackathon settings",
    disabled: true,
  },
];

export function QuickActions() {
  return (
    <Card className="project-card-hover">
      <CardHeader>
        <CardTitle className="group-hover:text-white transition-colors">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;

            if (action.disabled) {
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 * index,
                    duration: 0.5,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  <div className="flex items-center space-x-4 p-3 rounded-lg border border-white/10 bg-white/[0.015] opacity-50 cursor-not-allowed">
                    <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white/40">
                        {action.label}
                      </h3>
                      <p className="text-sm text-white/30">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 * index,
                  duration: 0.5,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
              >
                <Link href={action.href}>
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer group border border-transparent hover:border-white/20">
                    <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Icon className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white/90 group-hover:text-white transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
