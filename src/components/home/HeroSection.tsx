"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

export function HeroSection() {
  return (
    <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/5 via-[var(--color-background)] to-[var(--color-accent)]/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={item}
            className="font-semibold tracking-tight text-5xl sm:text-6xl lg:text-7xl text-[var(--color-text-primary)] mb-4"
          >
            Agooh <span className="text-[var(--color-accent-text)]">&amp;</span> Ruks
          </motion.h1>
          <motion.p
            variants={item}
            className="text-xl sm:text-2xl text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto leading-relaxed"
          >
            Delicious recipes crafted with love — from my kitchen to yours.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap justify-center gap-4">
            <Link href="/recipes">
              <Button size="lg">Explore Recipes</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">About Me</Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
