import { WHAT_TO_EAT, type WhatToEatItem } from "@/lib/constants";
import type { Recipe } from "@/types";

export interface CategoryCount {
  item: WhatToEatItem;
  count: number;
}

/** Number of published recipes behind each "What to eat?" box. */
export function getCategoryCounts(recipes: Recipe[]): CategoryCount[] {
  return WHAT_TO_EAT.map((item) => ({
    item,
    count: recipes.filter((r) =>
      item.param === "category"
        ? (r.category as string[]).includes(item.value)
        : (r.mealType as string[]).includes(item.value)
    ).length,
  }));
}
