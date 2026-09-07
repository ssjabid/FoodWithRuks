"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FilterPill } from "@/components/ui/FilterPill";
import { LIFESTYLE_CATEGORIES, getLifestyleCategoryLabel, isLifestyleCategory } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageTransition } from "@/components/shared/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import type { LifestylePost } from "@/types";

interface LifestyleClientProps {
  initialPosts: LifestylePost[];
}

export function LifestyleClient({ initialPosts }: LifestyleClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const raw = params.get("category") ?? "";
  const selectedCategory = isLifestyleCategory(raw) ? raw : "";

  const select = useCallback(
    (value: string) => {
      router.replace(value ? `${pathname}?category=${value}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return initialPosts;
    return initialPosts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, initialPosts]);

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Lifestyle</h1>
          <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
            Days out, eating out, travel, parenting and the crafts in between.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
          <FilterPill label="All" selected={!selectedCategory} onClick={() => select("")} />
          {LIFESTYLE_CATEGORIES.map((cat) => (
            <FilterPill
              key={cat.value}
              label={cat.label}
              selected={selectedCategory === cat.value}
              onClick={() => select(cat.value)}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredPosts.map((post) => (
                <StaggerItem key={post.slug}>
                  <Link href={`/lifestyle/${post.slug}`} className="group block h-full">
                    <Card className="h-full">
                      <div className="overflow-hidden">
                        <motion.div
                          className="placeholder-icon w-full aspect-[4/3]"
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <svg className="w-8 h-8 text-[var(--color-text-tertiary)] opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </motion.div>
                      </div>
                      <div className="p-4">
                        <Badge variant="accent" className="mb-2">{getLifestyleCategoryLabel(post.category)}</Badge>
                        <h2 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)] mb-2 line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>{post.readingTime} min read</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="font-semibold tracking-tight text-xl text-[var(--color-text-primary)] mb-2">Nothing here yet</h3>
            <p className="text-[var(--color-text-secondary)]">Try another category, or check back soon.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
