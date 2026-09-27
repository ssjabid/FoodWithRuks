import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Photo } from "@/components/shared/Photo";
import { factsLine } from "@/lib/facts";
import type { Recipe } from "@/types";

/** "The ones people come back for": only rendered with real data (the page decides). */
export function ComeBackFor({ recipes }: { recipes: Recipe[] }) {
  return (
    <section className="py-10 sm:py-14">
      <SectionHeader title="The ones people come back for" />
      <ul className="grid md:grid-cols-2 gap-x-12">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="border-b border-[var(--color-line)]">
            <Link href={`/recipes/${recipe.slug}`} className="group grid grid-cols-[88px_1fr] gap-4 py-4">
              <Photo src={recipe.heroImage} alt="" label={recipe.title} ratio="square" sizes="88px" caption={false} className="w-[88px] group-hover:opacity-90 transition-opacity" />
              <div className="min-w-0">
                <h3 className="h-card text-[var(--color-text)] group-hover:underline underline-offset-[3px] decoration-1">{recipe.title}</h3>
                <p className="text-sm text-[var(--color-text-2)] mt-1">{factsLine(recipe)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
