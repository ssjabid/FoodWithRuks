"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { WhatToEatGrid } from "@/components/recipe/WhatToEatGrid";
import { Input } from "@/components/ui/Input";
import { FilterPill } from "@/components/ui/FilterPill";
import { AnimatedDropdown } from "@/components/ui/AnimatedDropdown";
import { useDebounce } from "@/hooks/useDebounce";
import {
  MEAL_TYPES,
  SORT_OPTIONS,
  WHAT_TO_EAT,
  isRecipeCategory,
  isMealType,
  getCategoryLabel,
  getMealTypeLabel,
} from "@/lib/constants";
import { getFavorites, onFavoritesChange } from "@/lib/favorites";
import { PageTransition } from "@/components/shared/PageTransition";
import type { Recipe } from "@/types";

interface RecipesClientProps {
  initialRecipes: Recipe[];
}

export function RecipesClient({ initialRecipes }: RecipesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // URL is the source of truth for q / category / mealType
  const q = params.get("q") ?? "";
  const rawCategory = params.get("category") ?? "";
  const category = isRecipeCategory(rawCategory) ? rawCategory : "";
  const mealTypes = useMemo(
    () => (params.get("mealType") ?? "").split(",").filter(isMealType),
    [params]
  );

  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput);
  const [sortBy, setSortBy] = useState("newest");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Keep the input in sync when the URL changes from elsewhere (search overlay, back button)
  useEffect(() => {
    setSearchInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const sync = () => setFavorites(getFavorites());
    sync();
    return onFavoritesChange(sync);
  }, []);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  // Push debounced search text into the URL
  useEffect(() => {
    if (debouncedSearch !== q) setParam("q", debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const toggleMealType = (value: string) => {
    const current: string[] = mealTypes;
    const next = current.includes(value) ? current.filter((m) => m !== value) : [...current, value];
    setParam("mealType", next.join(","));
  };

  const activeBox = useMemo(() => {
    if (category) return { param: "category" as const, value: category };
    if (mealTypes.length === 1) {
      const box = WHAT_TO_EAT.find((b) => b.param === "mealType" && b.value === mealTypes[0]);
      if (box) return { param: "mealType" as const, value: mealTypes[0] };
    }
    return null;
  }, [category, mealTypes]);

  const filteredRecipes = useMemo(() => {
    let result = [...initialRecipes];

    if (q) {
      const query = q.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(query))
      );
    }

    if (category) {
      result = result.filter((r) => (r.category as string[]).includes(category));
    }

    if (mealTypes.length > 0) {
      result = result.filter((r) => mealTypes.some((mt) => (r.mealType as string[]).includes(mt)));
    }

    if (showFavorites) {
      result = result.filter((r) => favorites.includes(r.slug));
    }

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "quickest":
        result.sort((a, b) => a.prepTime + a.cookTime - (b.prepTime + b.cookTime));
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
        );
    }

    return result;
  }, [initialRecipes, q, category, mealTypes, showFavorites, favorites, sortBy]);

  const activeFilterCount = (category ? 1 : 0) + mealTypes.length + (showFavorites ? 1 : 0) + (q ? 1 : 0);

  const clearFilters = () => {
    setSearchInput("");
    setSortBy("newest");
    setShowFavorites(false);
    router.replace(pathname, { scroll: false });
  };

  const heading = category
    ? getCategoryLabel(category)
    : mealTypes.length === 1
      ? getMealTypeLabel(mealTypes[0])
      : "Recipes";

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">What to eat?</h1>
          <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
            Pick a craving, or search for something specific.
          </p>
        </div>

        <WhatToEatGrid active={activeBox} size="compact" className="mb-8" />

        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search recipes, ingredients…"
            aria-label="Search recipes"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mr-1">
            Meal
          </span>
          {MEAL_TYPES.map((m) => (
            <FilterPill
              key={m.value}
              label={m.label}
              selected={mealTypes.includes(m.value)}
              onClick={() => toggleMealType(m.value)}
            />
          ))}

          <span className="hidden sm:block w-px h-6 bg-[var(--color-border)] mx-1" aria-hidden="true" />

          <AnimatedDropdown options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />

          <FilterPill
            label={showFavorites ? "♥ Favourites" : "♡ Favourites"}
            selected={showFavorites}
            onClick={() => setShowFavorites(!showFavorites)}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="h-9 px-4 rounded-full text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
            >
              Clear all
            </button>
          )}

          <span className="ml-auto text-sm text-[var(--color-text-tertiary)]">
            {heading !== "Recipes" && (
              <span className="font-medium text-[var(--color-text-secondary)]">{heading} · </span>
            )}
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <RecipeGrid recipes={filteredRecipes} />
      </div>
    </PageTransition>
  );
}
