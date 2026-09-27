"use client";

import { useState } from "react";
import { Photo } from "@/components/shared/Photo";
import { Note } from "@/components/brand/Note";
import { Charm } from "@/components/brand/Charm";
import { Necklace } from "@/components/brand/Necklace";
import { SaveButton } from "@/components/recipe/SaveButton";
import { JumpToRecipe } from "@/components/recipe/JumpToRecipe";
import { PrintButton } from "@/components/recipe/PrintButton";
import { ShareButtons } from "@/components/recipe/ShareButtons";
import { IngredientList } from "@/components/recipe/IngredientList";
import { ServingsAdjuster } from "@/components/recipe/ServingsAdjuster";
import { OvenLine } from "@/components/recipe/OvenLine";
import { MethodSteps } from "@/components/recipe/MethodSteps";
import { CookModeToggle } from "@/components/recipe/CookModeToggle";
import { InstagramCard } from "@/components/recipe/InstagramCard";
import { CommentsSection } from "@/components/recipe/CommentsSection";
import { ExampleBanner } from "@/components/recipe/ExampleBanner";
import { ViewPing } from "@/components/recipe/ViewPing";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { isInstagramUrl } from "@/components/recipe/InstagramEmbed";
import { factsLine, yieldText } from "@/lib/facts";
import { BATCH_OPTIONS } from "@/lib/scale";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import type { PublicComment, Recipe } from "@/types";

interface RecipePageClientProps {
  recipe: Recipe;
  relatedRecipes: Recipe[];
  comments: PublicComment[];
  /** Draft previews skip the view counter and the comment form */
  preview?: boolean;
}

const STORY_WORDS = 150;

export function RecipePageClient({ recipe, relatedRecipes, comments, preview = false }: RecipePageClientProps) {
  const isMakes = recipe.yieldKind === "makes";
  const [servings, setServings] = useState(recipe.servings);
  const [batch, setBatch] = useState(1);
  const factor = isMakes ? batch : recipe.servings > 0 ? servings / recipe.servings : 1;
  const [storyOpen, setStoryOpen] = useState(false);
  const example = recipe.sample === true;
  const hasEmbed = isInstagramUrl(recipe.instagramUrl);

  const storyWords = recipe.personalStory.trim().split(/\s+/).filter(Boolean);
  const storyLong = storyWords.length > STORY_WORDS;
  const storyParagraphs = recipe.personalStory.split(/\n\s*\n/).filter((p) => p.trim());
  const shownParagraphs = storyLong && !storyOpen ? storyParagraphs.slice(0, 1) : storyParagraphs;

  return (
    <article className="max-w-[64rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {!preview && !example && <ViewPing slug={recipe.slug} />}
      {example && <ExampleBanner />}

      {/* Photo, name, her note, charms, facts, actions */}
      <header className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:items-center">
        <Photo
          src={recipe.heroImage}
          alt={recipe.heroImageAlt || recipe.title}
          label={recipe.title}
          ratio="portrait"
          priority
          sizes="(min-width: 1024px) 520px, 100vw"
          className="w-full print-photo"
        />
        <div>
          <h1 className="h-display text-[var(--color-text)]">{recipe.title}</h1>
          {recipe.ruksNote && (
            <Note size="lg" className="mt-3" tilt>
              {recipe.ruksNote}
            </Note>
          )}
          {recipe.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 print-hide">
              {recipe.badges.map((b) => (
                <Charm key={b} badge={b} />
              ))}
            </div>
          )}
          <p className="mt-4 text-[var(--color-text-2)]">{factsLine(recipe)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 print-hide">
            <JumpToRecipe />
            {!preview && <SaveButton slug={recipe.slug} />}
          </div>
        </div>
      </header>

      <div className="max-w-prose">
        {/* A short story in her words. Nothing long stands between a reader and the ingredients. */}
        {recipe.personalStory && (
          <div className="mt-10 text-body text-[var(--color-text)] space-y-4">
            {shownParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {storyLong && !storyOpen && (
              <button type="button" onClick={() => setStoryOpen(true)} className="link link-cheek text-sm print-hide">
                {COPY.readTheRest}
              </button>
            )}
          </div>
        )}

        {/* Ingredients + scaler */}
        <section id="ingredients" className="mt-12 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
            <h2 className="h-section text-[var(--color-text)]">Ingredients</h2>
            <div className="print-hide">
              {isMakes ? (
                <div role="radiogroup" aria-label="Batch size" className="inline-flex rounded-full border-[1.5px] border-[var(--color-line-strong)] p-1">
                  {BATCH_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={batch === o.value}
                      onClick={() => setBatch(o.value)}
                      className={cn(
                        "h-9 min-w-11 px-3 rounded-full text-sm font-medium transition-colors",
                        batch === o.value ? "bg-[var(--color-cheek)] text-[var(--color-on-cheek)]" : "text-[var(--color-text-2)] hover:bg-[var(--color-surface)]"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <ServingsAdjuster servings={servings} onChange={setServings} />
              )}
            </div>
          </div>
          <p className="text-[var(--color-text-2)] mb-4">{yieldText(recipe, factor)}</p>
          {isMakes && batch !== 1 && (
            /* DRAFT: needs Ruks */
            <p className="text-sm text-[var(--color-text-3)] mb-4 print-hide">{COPY.batchChanged}</p>
          )}
          <IngredientList ingredients={recipe.ingredients} factor={factor} />
          {recipe.oven && <OvenLine oven={recipe.oven} />}
        </section>

        {/* Method */}
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
            <h2 className="h-section text-[var(--color-text)]">Method</h2>
            <CookModeToggle />
          </div>
          <MethodSteps steps={recipe.instructions} />
        </section>

        {/* Keeps, tips, verdicts, inspired by */}
        {(recipe.keeps || recipe.tips || recipe.verdicts || recipe.inspiredBy) && (
          <section className="mt-10 space-y-5">
            {recipe.keeps && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-body">
                <dt className="text-[var(--color-text-2)]">Keeps</dt>
                <dd className="text-[var(--color-text)]">{recipe.keeps}</dd>
              </dl>
            )}
            {recipe.tips && (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-blush)] text-[var(--color-on-blush)] px-5 py-4">
                <h3 className="h-card mb-1">Tips</h3>
                <p className="text-body whitespace-pre-line">{recipe.tips}</p>
              </div>
            )}
            {recipe.verdicts && (recipe.verdicts.tasteTester || recipe.verdicts.agooh) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {recipe.verdicts.tasteTester && (
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] px-4 py-3.5">
                    <p className="text-sm text-[var(--color-text-2)] mb-1">{COPY.tasteTester}</p>
                    <p className="text-[var(--color-text)]">{recipe.verdicts.tasteTester}</p>
                  </div>
                )}
                {recipe.verdicts.agooh && (
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] px-4 py-3.5">
                    <p className="text-sm text-[var(--color-text-2)] mb-1">{COPY.agooh}</p>
                    <p className="text-[var(--color-text)]">{recipe.verdicts.agooh}</p>
                  </div>
                )}
              </div>
            )}
            {recipe.inspiredBy && <p className="text-sm text-[var(--color-text-2)]">Inspired by {recipe.inspiredBy.replace(/^inspired by\s*/i, "")}</p>}
          </section>
        )}

        {hasEmbed && (
          <div className="mt-10 print-hide">
            <InstagramCard url={recipe.instagramUrl!} />
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 print-hide">
          <PrintButton />
          <ShareButtons title={recipe.title} slug={`recipes/${recipe.slug}`} />
        </div>

        {!preview && !example && <CommentsSection recipeSlug={recipe.slug} comments={comments} rating={recipe.rating} />}

        <p className="print-only text-xs mt-6">agoohandruks: /recipes/{recipe.slug}</p>
      </div>

      {relatedRecipes.length > 0 && (
        <section className="mt-16 related-recipes">
          <Necklace className="mb-12" />
          <SectionHeader title="More like this" href="/bakes" linkLabel="All the bakes" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9">
            {relatedRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
