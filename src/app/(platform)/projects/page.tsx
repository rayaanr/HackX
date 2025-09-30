"use client";

import { Suspense } from "react";
import { ActiveProjects } from "@/components/projects/display/active-projects";
import { RegisteredHackathons } from "@/components/projects/display/registered-hackathons";
import { motion } from "motion/react";

export default function ProjectsPage() {
  const ease: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
  const fade = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.55, ease },
    }),
  } as const;

  return (
    <div className="relative space-y-14">
      <div className="absolute inset-0 pointer-events-none" />
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fade}
        className="relative"
      >
        <Suspense
          fallback={
            <div className="text-white/50">Loading active projects...</div>
          }
        >
          <ActiveProjects />
        </Suspense>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        custom={2}
        variants={fade}
        className="relative"
      >
        <Suspense
          fallback={
            <div className="text-white/50">
              Loading registered hackathons...
            </div>
          }
        >
          <RegisteredHackathons />
        </Suspense>
      </motion.div>
    </div>
  );
}
