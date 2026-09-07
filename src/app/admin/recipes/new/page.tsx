"use client";

import { RecipeForm } from "@/components/admin/RecipeForm";

export default function NewRecipePage() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">New Recipe</h1>
      <RecipeForm />
    </div>
  );
}
