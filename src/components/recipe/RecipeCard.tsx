import Link from "next/link";
import { cn } from "@/lib/utils";
import { Photo } from "@/components/shared/Photo";
import { Charm } from "@/components/brand/Charm";
import { factsLine } from "@/lib/facts";
import { COPY } from "@/lib/copy";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  /** large = the newest bake on home / first on an index; default = grid card; small = a compact row */
  size?: "large" | "default" | "small";
  priority?: boolean;
}

/** Photo, name, one plain fact, at most two charms. No stars, no dots. */
export function RecipeCard({ recipe, size = "default", priority = false }: RecipeCardProps) {
  const charms = recipe.badges.slice(0, 2);

  if (size === "small") {
    return (
      <article className="group">
        <Link href={`/recipes/${recipe.slug}`} className="grid grid-cols-[96px_1fr] sm:grid-cols-[120px_1fr] gap-4 items-start">
          <Photo
            src={recipe.heroImage}
            alt={recipe.heroImageAlt || recipe.title}
            ratio="square"
            sizes="120px"
            caption={false}
            className="w-full group-hover:opacity-90 transition-opacity"
          />
          <div className="min-w-0 pt-0.5">
            {recipe.sample && <p className="text-xs font-medium text-[var(--color-cheek)] mb-1">{COPY.exampleLabel}</p>}
            <h3 className="h-card text-[var(--color-text)] group-hover:underline underline-offset-[3px] decoration-1">{recipe.title}</h3>
            <p className="text-sm text-[var(--color-text-2)] mt-1">{factsLine(recipe)}</p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group h-full">
      <Link href={`/recipes/${recipe.slug}`} className="block h-full">
        <Photo
          src={recipe.heroImage}
          alt={recipe.heroImageAlt || recipe.title}
          label={recipe.title}
          ratio={size === "large" ? "landscape" : "portrait"}
          priority={priority}
          sizes={size === "large" ? "(min-width: 1024px) 800px, 100vw" : "(min-width: 1024px) 400px, 50vw"}
          className="w-full group-hover:opacity-90 transition-opacity"
        />
        <div className="pt-3">
          {recipe.sample && <p className="text-xs font-medium text-[var(--color-cheek)] mb-1">{COPY.exampleLabel}</p>}
          <h3 className={cn("text-[var(--color-text)] group-hover:underline underline-offset-[3px] decoration-1", size === "large" ? "h-section" : "h-card")}>
            {recipe.title}
          </h3>
          <p className="text-[var(--color-text-2)] mt-1 text-[15px]">{factsLine(recipe)}</p>
          {charms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {charms.map((b) => (
                <Charm key={b} badge={b} as="chip" />
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
