"use client";

import { useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterPill } from "@/components/ui/FilterPill";
import { StoryCard } from "@/components/lifestyle/StoryCard";
import { LIFESTYLE_CATEGORIES, isLifestyleCategory } from "@/lib/constants";
import type { LifestylePost } from "@/types";

interface LifestyleClientProps {
  initialPosts: LifestylePost[];
}

/** The stories index: category chips (only ones with something in them) and the cards. `?category=` is the state. */
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

  const categories = useMemo(() => LIFESTYLE_CATEGORIES.filter((c) => initialPosts.some((p) => p.category === c.value)), [initialPosts]);

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return initialPosts;
    return initialPosts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, initialPosts]);

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="h-page text-[var(--color-text)] mb-8">Stories</h1>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <FilterPill label="All" selected={!selectedCategory} onClick={() => select("")} />
          {categories.map((cat) => (
            <FilterPill key={cat.value} label={cat.label} selected={selectedCategory === cat.value} onClick={() => select(cat.value)} />
          ))}
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div key={selectedCategory} className="fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {filteredPosts.map((post, i) => (
            <StoryCard key={post.slug} post={post} priority={i < 3} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <div className="py-16 max-w-md">
          <h2 className="h-card text-[var(--color-text)] mb-2">Nothing here yet</h2>
          <p className="text-[var(--color-text-2)]">Stories arrive between bakes.</p>
        </div>
      )}
    </div>
  );
}
