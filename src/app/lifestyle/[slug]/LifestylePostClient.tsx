"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ShareButtons } from "@/components/recipe/ShareButtons";
import { Card } from "@/components/ui/Card";
import { PageTransition } from "@/components/shared/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { formatDate } from "@/lib/utils";
import { getLifestyleCategoryLabel } from "@/lib/constants";
import type { LifestylePost } from "@/types";

interface LifestylePostClientProps {
  post: LifestylePost;
  relatedPosts: LifestylePost[];
}

export function LifestylePostClient({ post, relatedPosts }: LifestylePostClientProps) {
  return (
    <PageTransition>
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl">
          {/* Header */}
          <header className="mb-8 sm:mb-10">
            <Badge variant="accent" className="mb-3">{getLifestyleCategoryLabel(post.category)}</Badge>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readingTime} min read</span>
            </div>
          </header>

          {/* Article content */}
          <div
            className="prose mb-10"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share */}
          <div className="py-6 border-t border-[var(--color-border)]">
            <ShareButtons title={post.title} slug={`lifestyle/${post.slug}`} />
          </div>
        </div>

        {/* More articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-8">
              More Articles
            </h2>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedPosts.map((p) => (
                <StaggerItem key={p.slug}>
                  <Link href={`/lifestyle/${p.slug}`} className="group block">
                    <Card>
                      <div className="p-4">
                        <Badge variant="accent" className="mb-2">{getLifestyleCategoryLabel(p.category)}</Badge>
                        <h3 className="text-base font-bold tracking-tight text-[var(--color-text-primary)] mb-1 line-clamp-2">
                          {p.title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {p.readingTime} min read
                        </p>
                      </div>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        )}
      </article>
    </PageTransition>
  );
}
