"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_LIFESTYLE_POSTS } from "@/lib/sampleData";
import { formatDate } from "@/lib/utils";
import { getLifestyleCategoryLabel } from "@/lib/constants";

export function LifestyleTeaser() {
  const posts = SAMPLE_LIFESTYLE_POSTS.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer>
          <StaggerItem>
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                From the Kitchen Journal
              </h2>
              <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
                Stories, tips, and the joy of cooking
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post) => (
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
                    <h3 className="text-base font-bold tracking-tight text-[var(--color-text-primary)] mb-2 line-clamp-2">
                      {post.title}
                    </h3>
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

        <StaggerContainer>
          <StaggerItem>
            <div className="mt-8">
              <Link
                href="/lifestyle"
                className="group inline-flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
              >
                Read more articles
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  &rarr;
                </motion.span>
              </Link>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
