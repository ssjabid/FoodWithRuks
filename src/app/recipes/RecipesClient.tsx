"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { Charm } from "@/components/brand/Charm";
import { FilterPill } from "@/components/ui/FilterPill";
import { Select } from "@/components/ui/Select";
import { ButtonLink } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import {
  BADGES,
  CATEGORY_GROUPS,
  RECIPE_CATEGORIES,
  SORT_OPTIONS,
  getCategoryGroup,
  isBadgeId,
  isCategoryGroup,
  isRecipeCategory,
  type CategoryGroup,
} from "@/lib/constants";
import { getFavorites, onFavoritesChange } from "@/lib/favorites";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types";

type Group = CategoryGroup | "all";

const TITLES: Record<Group, string> = { all: "Recipes", bakes: "Bakes", cooking: "Cooking", "little-ones": "Little ones" };

function inGroup(recipe: Recipe, group: Group): boolean {
  if (group === "all") return true;
  return recipe.category.some((c) => getCategoryGroup(c) === group);
}

const byNewest = (a: Recipe, b: Recipe) =>
  new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
/** Quickest = prep + cook (extra time such as chilling is shown, not sorted on). */
const byQuickest = (a: Recipe, b: Recipe) => a.prepTime + a.cookTime - (b.prepTime + b.cookTime) || byNewest(a, b);

const subscribeFavorites = (cb: () => void) => onFavoritesChange(cb);
const favoritesSnapshot = () => getFavorites().join(",");
const favoritesServer = () => "";

const tabClass = (selected: boolean) =>
  cn(
    "h-11 px-4 rounded-full text-sm font-medium border-[1.5px] inline-flex items-center transition-colors",
    selected
      ? "bg-[var(--color-cheek)] text-[var(--color-on-cheek)] border-[var(--color-cheek)]"
      : "text-[var(--color-text-2)] border-[var(--color-line-strong)] hover:border-[var(--color-cheek)] hover:text-[var(--color-cheek)]"
  );

/** Mirrors the real page header so nothing jumps when the client component mounts. */
export function RecipesFallback({ title = "Recipes" }: { title?: string }) {
  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <h1 className="h-page text-[var(--color-text)] mb-8">{title}</h1>
      <RecipeGrid recipes={[]} loading />
    </div>
  );
}

interface RecipesClientProps {
  recipes: Recipe[];
  /** /bakes and /cooking fix the group; /recipes reads it from the URL */
  fixedGroup?: CategoryGroup;
}

/**
 * The recipes index. The URL is the source of truth (group, category, badge, sort, q);
 * "Saved" is a local toggle because saved recipes live in this browser only.
 */
export function RecipesClient({ recipes, fixedGroup }: RecipesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawGroup = params.get("group") ?? "";
  const group: Group = fixedGroup ?? (isCategoryGroup(rawGroup) ? rawGroup : "all");
  const q = (params.get("q") ?? "").trim();
  const rawCategory = params.get("category") ?? "";
  const category = isRecipeCategory(rawCategory) ? rawCategory : "";
  const rawBadge = params.get("badge") ?? "";
  const badge = isBadgeId(rawBadge) ? rawBadge : "";
  const sort = params.get("sort") === "quickest" ? "quickest" : "newest";

  // The search box: typed text is local until the debounce pushes it into the URL.
  // When the URL changes from elsewhere (search overlay, back button) the box follows it.
  const [draft, setDraft] = useState(q);
  const [seenQ, setSeenQ] = useState(q);
  if (q !== seenQ) {
    setSeenQ(q);
    setDraft(q);
  }
  const debounced = useDebounce(draft);
  const [showSaved, setShowSaved] = useState(false);
  const favorites = useSyncExternalStore(subscribeFavorites, favoritesSnapshot, favoritesServer);
  const savedSlugs = useMemo(() => favorites.split(",").filter(Boolean), [favorites]);

  const setParams = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  useEffect(() => {
    if (debounced !== draft) return; // still typing
    if (debounced.trim() === q) return;
    setParams({ q: debounced.trim() });
  }, [debounced, draft, q, setParams]);

  const pool = useMemo(() => recipes.filter((r) => inGroup(r, group)), [recipes, group]);

  const tabs = useMemo(
    () =>
      [
        { value: "all" as Group, label: "All", href: "/recipes" },
        ...CATEGORY_GROUPS.map((g) => ({ value: g.value as Group, label: g.label, href: g.href })),
      ].filter((t) => t.value === "all" || t.value === "bakes" || recipes.some((r) => inGroup(r, t.value))),
    [recipes]
  );
  const categories = useMemo(
    () => RECIPE_CATEGORIES.filter((c) => (group === "all" || c.group === group) && pool.some((r) => (r.category as string[]).includes(c.value))),
    [pool, group]
  );
  const badges = useMemo(() => BADGES.filter((b) => pool.some((r) => (r.badges as string[]).includes(b.id))), [pool]);

  const results = useMemo(() => {
    let list = pool;
    if (category) list = list.filter((r) => (r.category as string[]).includes(category));
    if (badge) list = list.filter((r) => (r.badges as string[]).includes(badge));
    if (showSaved) list = list.filter((r) => savedSlugs.includes(r.slug));
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(needle) ||
          r.description.toLowerCase().includes(needle) ||
          r.tags.some((t) => t.toLowerCase().includes(needle)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(needle))
      );
    }
    return [...list].sort(sort === "quickest" ? byQuickest : byNewest);
  }, [pool, category, badge, showSaved, savedSlugs, q, sort]);

  const hasFilters = Boolean(category || badge || q || showSaved);

  const clearAll = () => {
    setShowSaved(false);
    setDraft("");
    const keepGroup = !fixedGroup && group !== "all" ? `?group=${group}` : "";
    router.replace(`${pathname}${keepGroup}`, { scroll: false });
  };

  const emptyBody = q ? (
    <div className="flex flex-wrap items-center gap-4 mt-4">
      <ButtonLink href={`/contact?subject=${encodeURIComponent(`Recipe request: ${q}`)}`}>{COPY.searchEmptyAction}</ButtonLink>
      <Link href="/bakes" className="link text-[var(--color-text-2)] hover:text-[var(--color-cheek)]">
        All the bakes
      </Link>
    </div>
  ) : hasFilters ? (
    <button type="button" onClick={clearAll} className="link link-cheek mt-2">
      Clear the filters
    </button>
  ) : null;

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <h1 className="h-page text-[var(--color-text)]">{TITLES[group]}</h1>
        <div role="search" className="w-full sm:w-auto sm:min-w-[320px]">
          <label htmlFor="recipe-search" className="sr-only">
            Search recipes
          </label>
          <input
            id="recipe-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search by name or ingredient"
            autoComplete="off"
            className="field h-12 w-full rounded-full px-5 text-base"
          />
        </div>
      </div>

      {tabs.length > 2 && (
        <nav aria-label="Recipe groups" className="flex flex-wrap gap-2 mb-4">
          {tabs.map((t) => (
            <Link key={t.value} href={t.href} className={tabClass(t.value === group)} aria-current={t.value === group ? "page" : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
      )}

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((c) => (
            <FilterPill key={c.value} label={c.label} selected={category === c.value} onClick={() => setParams({ category: category === c.value ? "" : c.value })} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {badges.map((b) => (
          <Charm key={b.id} badge={b.id} as="button" selected={badge === b.id} onClick={() => setParams({ badge: badge === b.id ? "" : b.id })} className="charm-filter" />
        ))}
        {savedSlugs.length > 0 && <FilterPill label="Saved" selected={showSaved} onClick={() => setShowSaved((v) => !v)} />}
        <Select options={SORT_OPTIONS} value={sort} onChange={(v) => setParams({ sort: v === "newest" ? "" : v })} aria-label="Sort recipes" className="ml-auto" />
        {hasFilters && (
          <button type="button" onClick={clearAll} className="link h-11 px-2 text-sm text-[var(--color-text-2)] hover:text-[var(--color-cheek)]">
            Clear
          </button>
        )}
      </div>

      <RecipeGrid recipes={results} variant="index" emptyTitle={q ? COPY.searchEmpty : COPY.nothingInTin} emptyBody={emptyBody} />
    </div>
  );
}
