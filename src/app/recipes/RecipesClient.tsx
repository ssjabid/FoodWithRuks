"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { Input } from "@/components/ui/Input";
import { FilterPill } from "@/components/ui/FilterPill";
import { AnimatedDropdown } from "@/components/ui/AnimatedDropdown";
import { useDebounce } from "@/hooks/useDebounce";
import { RECIPE_CATEGORIES, MEAL_TYPES, DIETARY_TAGS, SPECIAL_OCCASIONS, SORT_OPTIONS } from "@/lib/constants";
import { getFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/shared/PageTransition";
import type { Recipe } from "@/types";

interface RecipesClientProps {
  initialRecipes: Recipe[];
}

export function RecipesClient({ initialRecipes }: RecipesClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFavorites, setShowFavorites] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const activeFilterCount =
    selectedCategories.length +
    selectedMealTypes.length +
    selectedDietaryTags.length +
    selectedOccasions.length +
    (showFavorites ? 1 : 0);

  const filteredRecipes = useMemo(() => {
    let result = [...initialRecipes];

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((r) =>
        selectedCategories.some((cat) => (r.category as string[]).includes(cat))
      );
    }

    if (selectedMealTypes.length > 0) {
      result = result.filter((r) =>
        selectedMealTypes.some((mt) => (r.mealType as string[]).includes(mt))
      );
    }

    if (selectedDietaryTags.length > 0) {
      result = result.filter((r) =>
        selectedDietaryTags.every((tag) => r.dietaryTags.includes(tag))
      );
    }

    if (selectedOccasions.length > 0) {
      result = result.filter((r) =>
        selectedOccasions.some((occ) => r.specialOccasion.includes(occ))
      );
    }

    if (showFavorites) {
      const favorites = getFavorites();
      result = result.filter((r) => favorites.includes(r.slug));
    }

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "quickest":
        result.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
        break;
      default:
        result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    }

    return result;
  }, [initialRecipes, debouncedSearch, selectedCategories, selectedMealTypes, selectedDietaryTags, selectedOccasions, sortBy, showFavorites]);

  const toggleFilter = (value: string, selected: string[], setter: (v: string[]) => void) => {
    setter(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedMealTypes([]);
    setSelectedDietaryTags([]);
    setSelectedOccasions([]);
    setSortBy("newest");
    setShowFavorites(false);
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Recipes
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
            Discover delicious recipes for every occasion
          </p>
        </div>

        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <motion.button
            onClick={() => setFiltersOpen(!filtersOpen)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "h-9 px-4 rounded-full text-sm font-medium border inline-flex items-center gap-2 transition-colors duration-200",
              filtersOpen || activeFilterCount > 0
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--color-on-primary)] text-[var(--color-primary)] text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          <AnimatedDropdown
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
          />

          <FilterPill
            label={showFavorites ? "\u2665 Favorites" : "\u2661 Favorites"}
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
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""}
          </span>
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mb-6 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
                <div className="space-y-4">
                  <FilterGroup
                    label="Category"
                    items={RECIPE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                    selected={selectedCategories}
                    onToggle={(v) => toggleFilter(v, selectedCategories, setSelectedCategories)}
                  />
                  <div className="border-t border-[var(--color-border)]" />
                  <FilterGroup
                    label="Meal Type"
                    items={MEAL_TYPES.map(m => ({ value: m.value, label: m.label }))}
                    selected={selectedMealTypes}
                    onToggle={(v) => toggleFilter(v, selectedMealTypes, setSelectedMealTypes)}
                  />
                  <div className="border-t border-[var(--color-border)]" />
                  <FilterGroup
                    label="Diet"
                    items={DIETARY_TAGS.map(tag => ({ value: tag, label: tag }))}
                    selected={selectedDietaryTags}
                    onToggle={(v) => toggleFilter(v, selectedDietaryTags, setSelectedDietaryTags)}
                  />
                  <div className="border-t border-[var(--color-border)]" />
                  <FilterGroup
                    label="Occasion"
                    items={SPECIAL_OCCASIONS.map(o => ({ value: o.value, label: o.label }))}
                    selected={selectedOccasions}
                    onToggle={(v) => toggleFilter(v, selectedOccasions, setSelectedOccasions)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <RecipeGrid recipes={filteredRecipes} />
      </div>
    </PageTransition>
  );
}

function FilterGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider shrink-0 pt-2 w-20">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <FilterPill
            key={item.value}
            label={item.label}
            selected={selected.includes(item.value)}
            onClick={() => onToggle(item.value)}
          />
        ))}
      </div>
    </div>
  );
}
