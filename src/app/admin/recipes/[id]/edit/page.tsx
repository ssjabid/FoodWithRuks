"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch } from "@/lib/adminFetch";
import { RecipeForm } from "@/components/admin/RecipeForm";
import type { Recipe } from "@/types";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch(`/api/admin/recipes/${id}`);
        if (res.ok) setRecipe(await res.json());
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!recipe) {
    return <div className="text-center py-20 text-[var(--color-text-secondary)]">Recipe not found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">Edit Recipe</h1>
      <RecipeForm recipe={recipe} />
    </div>
  );
}
