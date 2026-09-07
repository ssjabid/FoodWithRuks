"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={item}
          className="font-semibold tracking-tight text-6xl sm:text-8xl text-[var(--color-primary)] mb-4"
        >
          404
        </motion.h1>
        <motion.h2
          variants={item}
          className="font-bold tracking-tight text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-4"
        >
          Oops! This page doesn&apos;t exist
        </motion.h2>
        <motion.p variants={item} className="text-[var(--color-text-secondary)] mb-8">
          Looks like this recipe got lost in the kitchen. Let&apos;s get you back on track.
        </motion.p>
        <motion.div variants={item} className="flex gap-4 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline">Browse Recipes</Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
