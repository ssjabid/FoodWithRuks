import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/shared/Photo";
import { Note } from "@/components/brand/Note";
import { factsLine } from "@/lib/facts";
import { COPY } from "@/lib/copy";
import type { Recipe } from "@/types";

interface OfferingProps {
  recipe: Recipe;
  /** Her handwritten line (site setting, else the recipe's own note) */
  note: string;
  /** Optional line under the facts, from /admin/pages */
  intro?: string;
}

/** "Here, I made you something." The home page hands you a bake: photo, its name, her line, one plain fact, one button. */
export function Offering({ recipe, note, intro }: OfferingProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 lg:items-center">
      <Photo
        src={recipe.heroImage}
        alt={recipe.heroImageAlt || recipe.title}
        label={recipe.title}
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="w-full aspect-[4/5] lg:aspect-[16/11]"
      />
      <div>
        {recipe.sample && <p className="text-sm text-[var(--color-cheek)] font-medium mb-3">{COPY.exampleLabel}</p>}
        <h1 className="h-display text-[var(--color-text)]">{recipe.title}</h1>
        {note && (
          <Note size="lg" className="mt-3" tilt>
            {note}
          </Note>
        )}
        <p className="mt-4 text-[var(--color-text-2)]">{factsLine(recipe)}</p>
        {intro && <p className="mt-3 text-[var(--color-text-2)] max-w-[46ch]">{intro}</p>}
        <ButtonLink href={`/recipes/${recipe.slug}`} className="mt-6">
          Get the recipe
        </ButtonLink>
      </div>
    </section>
  );
}
