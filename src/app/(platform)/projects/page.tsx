"use client";

import { Suspense } from "react";
import { ActiveProjects } from "@/components/projects/display/active-projects";
import { RegisteredHackathons } from "@/components/projects/display/registered-hackathons";
import { motion } from "framer-motion";

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
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_25%_10%,black,transparent_70%)] bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.15),transparent_60%)]" />
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fade}
        className="relative space-y-3"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
          Your Projects
        </h1>
        <p className="text-sm md:text-base text-white/50 max-w-2xl">
          Manage active submissions, track updates, and explore the hackathons
          you&apos;ve registered for.
        </p>
      </motion.div>

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
