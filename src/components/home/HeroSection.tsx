import { ButtonLink } from "@/components/ui/Button";
import { HeroSearch } from "./HeroSearch";
import { FeaturedRecipe } from "./FeaturedRecipe";
import { SITE_BYLINE, SITE_DESCRIPTION } from "@/lib/site";
import Link from "next/link";
import type { Recipe } from "@/types";

interface HeroSectionProps {
  recipe: Recipe | null;
}

export function HeroSection({ recipe }: HeroSectionProps) {
  return (
    <section className="border-b border-[var(--color-border)]">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="max-w-xl">
            <p className="accent-italic text-lg mb-4">{SITE_BYLINE}</p>
            <h1 className="h-display text-[var(--color-text-primary)] mb-5">
              Pure comfort, <em className="accent-italic">cooked simply</em>
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-[40ch] mb-7">
              {SITE_DESCRIPTION.replace("Pure comfort, cooked simply. ", "")}
            </p>

            <HeroSearch className="max-w-md mb-6" />

            <div className="flex flex-wrap items-center gap-5">
              <ButtonLink href="/recipes">Browse recipes</ButtonLink>
              <Link href="/about" className="link text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                About me
              </Link>
            </div>
          </div>

          {recipe && <FeaturedRecipe recipe={recipe} />}
        </div>
      </div>
    </section>
  );
}
