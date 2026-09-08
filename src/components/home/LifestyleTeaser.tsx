import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { getLifestyleCategoryLabel } from "@/lib/constants";
import type { LifestylePost } from "@/types";

interface LifestyleTeaserProps {
  posts: LifestylePost[];
}

export function LifestyleTeaser({ posts }: LifestyleTeaserProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[var(--color-surface)]">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Beyond the kitchen"
          title="Days out, eating out and little-life stories"
          href="/lifestyle"
          linkLabel="All stories"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-10">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.slug} href={`/lifestyle/${post.slug}`} className="group block rounded-[var(--radius-md)]">
              <FoodPlaceholder ratio="landscape" className="w-full group-hover:opacity-90 transition-opacity" />
              <div className="pt-3">
                <Badge variant="accent" className="mb-2">{getLifestyleCategoryLabel(post.category)}</Badge>
                <h3 className="h-card text-[var(--color-text-primary)] group-hover:underline underline-offset-[3px] decoration-1 mb-1.5 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-2">{post.excerpt}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {formatDate(post.publishedAt)} · {post.readingTime} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
