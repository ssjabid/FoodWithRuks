"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { getCategoryLabel } from "@/lib/constants";
import { formatCookTime } from "@/lib/utils";
import type { Recipe } from "@/types";

interface RecipeOfTheWeekProps {
  recipe: Recipe;
}

export function RecipeOfTheWeek({ recipe }: RecipeOfTheWeekProps) {
  const total = recipe.prepTime + recipe.cookTime;

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <Link href={`/recipes/${recipe.slug}`} className="group block">
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="grid lg:grid-cols-[1.1fr_1fr] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-border)] bg-[var(--color-elevated)] shadow-[var(--shadow-sm)] group-hover:shadow-[var(--shadow-md)] transition-shadow"
            >
              <div className="overflow-hidden">
                <motion.div
                  className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[240px]"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <FoodPlaceholder className="w-full h-full" />
                </motion.div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent-text)] mb-3">
                  New Recipe of the Week
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-3">
                  {recipe.title}
                </h2>
                <p className="text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed mb-5 line-clamp-3">
                  {recipe.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {recipe.category.slice(0, 2).map((cat) => (
                    <Badge key={cat}>{getCategoryLabel(cat)}</Badge>
                  ))}
                  <span className="text-sm text-[var(--color-text-tertiary)]">
                    {formatCookTime(total)} · {recipe.servings} servings · <span className="capitalize">{recipe.difficulty}</span>
                  </span>
                </div>

                <div>
                  <Button>Cook this week&apos;s recipe</Button>
                </div>
              </div>
            </motion.article>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
