"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SITE_BYLINE, TAGLINE_PRIMARY } from "@/lib/site";
import { buildSearchHref } from "@/lib/search";

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
    <section
      className="relative min-h-[55vh] sm:min-h-[62vh] flex items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 15% 20%, color-mix(in srgb, var(--color-accent-soft) 70%, transparent), transparent 55%), radial-gradient(ellipse at 85% 80%, color-mix(in srgb, var(--color-secondary) 80%, transparent), transparent 55%), var(--color-background)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={item}
            className="font-heading italic text-base sm:text-lg text-[var(--color-accent-text)] mb-3"
          >
            {SITE_BYLINE}
          </motion.p>
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
            {TAGLINE_PRIMARY}
          </motion.p>

          <motion.div variants={item} className="max-w-md mx-auto mb-6">
            <HeroSearch />
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap justify-center gap-3">
            <Link href="/recipes">
              <Button size="lg">Browse Recipes</Button>
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

function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildSearchHref(query));
      }}
      className="flex items-center h-12 sm:h-14 rounded-full border border-[var(--color-border)] bg-[var(--color-elevated)] pl-4 pr-1.5 shadow-[var(--shadow-sm)] focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] transition-all"
    >
      <svg className="w-5 h-5 shrink-0 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What are you craving?"
        aria-label="Search recipes"
        className="flex-1 min-w-0 h-full px-3 bg-transparent text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
      />
      <button
        type="submit"
        className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shrink-0"
      >
        Search
      </button>
    </form>
  );
}
