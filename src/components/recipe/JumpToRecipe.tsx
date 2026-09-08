"use client";

import { Button } from "@/components/ui/Button";

export function JumpToRecipe() {
  const scrollToIngredients = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("ingredients")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="no-print">
      <Button onClick={scrollToIngredients} size="sm">
        Jump to recipe
      </Button>
    </div>
  );
}
