"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildSearchHref } from "@/lib/search";

export function HeroSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(buildSearchHref(query));
      }}
      className={cn("field flex items-center h-12 rounded-full pl-4 pr-1.5", className)}
    >
      <svg className="w-5 h-5 shrink-0 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What are you craving?"
        aria-label="Search recipes"
        className="field-bare flex-1 min-w-0 h-full px-3 text-base"
      />
      <button
        type="submit"
        className="h-9 px-4 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shrink-0"
      >
        Search
      </button>
    </form>
  );
}
