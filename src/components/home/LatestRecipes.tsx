"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import type { Recipe } from "@/types";

interface LatestRecipesProps {
  recipes: Recipe[];
}

export function LatestRecipes({ recipes }: LatestRecipesProps) {
  if (recipes.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer>
          <StaggerItem>
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Fresh from the kitchen</h2>
              <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
                The latest recipes, straight off the stove
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {recipes.map((recipe) => (
            <StaggerItem key={recipe.slug}>
              <RecipeCard recipe={recipe} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <StaggerContainer>
          <StaggerItem>
            <div className="mt-8">
              <Link
                href="/recipes"
                className="group inline-flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
              >
                View all recipes
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
