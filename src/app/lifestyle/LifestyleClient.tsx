"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { FilterPill } from "@/components/ui/FilterPill";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { LIFESTYLE_CATEGORIES, getLifestyleCategoryLabel, isLifestyleCategory } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
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
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="mb-8">
        <p className="eyebrow mb-2">Lifestyle</p>
        <h1 className="h-page text-[var(--color-text-primary)] mb-2">Beyond the kitchen</h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Days out, eating out, travel, parenting and the crafts in between.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <FilterPill label="All" selected={!selectedCategory} onClick={() => select("")} />
        {LIFESTYLE_CATEGORIES.map((cat) => (
          <FilterPill key={cat.value} label={cat.label} selected={selectedCategory === cat.value} onClick={() => select(cat.value)} />
        ))}
      </div>

      <div key={selectedCategory} className="fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {filteredPosts.map((post) => (
          <Link key={post.slug} href={`/lifestyle/${post.slug}`} className="group block rounded-[var(--radius-md)]">
            <FoodPlaceholder ratio="landscape" className="w-full group-hover:opacity-90 transition-opacity" />
            <div className="pt-3">
              <Badge variant="accent" className="mb-2">{getLifestyleCategoryLabel(post.category)}</Badge>
              <h2 className="h-card text-[var(--color-text-primary)] group-hover:underline underline-offset-[3px] decoration-1 mb-1.5 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-2">{post.excerpt}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {formatDate(post.publishedAt)} · {post.readingTime} min read
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <h3 className="h-card text-[var(--color-text-primary)] mb-2">Nothing here yet</h3>
          <p className="text-[var(--color-text-secondary)]">Try another category, or check back soon.</p>
        </div>
      )}
    </div>
  );
}
