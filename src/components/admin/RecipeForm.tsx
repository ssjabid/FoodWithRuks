"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminFetch } from "@/lib/adminFetch";
import { slugify } from "@/lib/utils";
import {
  BADGES,
  CATEGORY_GROUPS,
  MEAL_TYPES,
  DIETARY_TAGS,
  SPECIAL_OCCASIONS,
  DIFFICULTY_OPTIONS,
  UNIT_OPTIONS,
  YIELD_KINDS,
  categoriesInGroup,
  type YieldKind,
} from "@/lib/constants";
import type { Recipe, Ingredient, Instruction } from "@/types";

interface RecipeFormProps {
  recipe?: Recipe;
}

/* Field limits mirror src/lib/validation.ts (the API is the real boundary). */
const MAX = { ruksNote: 120, verdict: 140, inspiredBy: 80, keeps: 140, alt: 160, yieldNoun: 24, extraLabel: 24 } as const;
const EXTRA_LABELS = ["chilling", "proving", "setting", "resting", "cooling", "soaking", "marinating"];

const selectClass =
  "h-11 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-base sm:text-sm text-[var(--color-text-primary)]";
const labelClass = "block text-sm font-medium text-[var(--color-text-primary)]";
const hintClass = "text-xs text-[var(--color-text-tertiary)]";

function newIngredient(): Ingredient {
  return { id: crypto.randomUUID(), amount: "", unit: "", name: "", group: "" };
}

function newInstruction(step: number): Instruction {
  return { step, text: "", image: "", imageAlt: "" };
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const isEdit = !!recipe;

  const [title, setTitle] = useState(recipe?.title || "");
  const [slug, setSlug] = useState(recipe?.slug || "");
  const [description, setDescription] = useState(recipe?.description || "");
  const [personalStory, setPersonalStory] = useState(recipe?.personalStory || "");
  const [heroImage, setHeroImage] = useState(recipe?.heroImage || "");
  const [heroImageAlt, setHeroImageAlt] = useState(recipe?.heroImageAlt || "");
  const [instagramUrl, setInstagramUrl] = useState(recipe?.instagramUrl || "");
  const [category, setCategory] = useState<string[]>(recipe?.category || []);
  const [mealType, setMealType] = useState<string[]>(recipe?.mealType || []);
  const [dietaryTags, setDietaryTags] = useState<string[]>(recipe?.dietaryTags || []);
  const [specialOccasion, setSpecialOccasion] = useState<string[]>(recipe?.specialOccasion || []);
  const [tags, setTags] = useState(recipe?.tags?.join(", ") || "");
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || "medium");
  const [prepTime, setPrepTime] = useState(recipe?.prepTime || 0);
  const [cookTime, setCookTime] = useState(recipe?.cookTime || 0);
  const [extraMinutes, setExtraMinutes] = useState(recipe?.extraTime?.minutes || 0);
  const [extraLabel, setExtraLabel] = useState(recipe?.extraTime?.label || "chilling");
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [yieldKind, setYieldKind] = useState<YieldKind>(recipe?.yieldKind || "serves");
  const [yieldOne, setYieldOne] = useState(recipe?.yieldNoun?.one || "");
  const [yieldOther, setYieldOther] = useState(recipe?.yieldNoun?.other || "");
  const [ovenTemp, setOvenTemp] = useState(recipe?.oven ? String(recipe.oven.tempC) : "");
  const [ovenFan, setOvenFan] = useState(recipe?.oven?.fan ?? true);
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe?.ingredients?.length ? recipe.ingredients : [newIngredient()]);
  const [instructions, setInstructions] = useState<Instruction[]>(recipe?.instructions?.length ? recipe.instructions : [newInstruction(1)]);
  const [ruksNote, setRuksNote] = useState(recipe?.ruksNote || "");
  const [badges, setBadges] = useState<string[]>(recipe?.badges || []);
  const [tasteTester, setTasteTester] = useState(recipe?.verdicts?.tasteTester || "");
  const [agooh, setAgooh] = useState(recipe?.verdicts?.agooh || "");
  const [inspiredBy, setInspiredBy] = useState(recipe?.inspiredBy || "");
  const [keeps, setKeeps] = useState(recipe?.keeps || "");
  const [tips, setTips] = useState(recipe?.tips || "");
  const [calories, setCalories] = useState(recipe?.nutrition?.calories || 0);
  const [protein, setProtein] = useState(recipe?.nutrition?.protein || 0);
  const [carbs, setCarbs] = useState(recipe?.nutrition?.carbs || 0);
  const [fat, setFat] = useState(recipe?.nutrition?.fat || 0);
  const [metaTitle, setMetaTitle] = useState(recipe?.seo?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(recipe?.seo?.metaDescription || "");
  const [status, setStatus] = useState<"draft" | "published">(recipe?.status || "draft");
  const [featured, setFeatured] = useState(recipe?.featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPersonal, setShowPersonal] = useState(Boolean(recipe?.ruksNote || recipe?.badges?.length || recipe?.verdicts || recipe?.inspiredBy || recipe?.keeps));
  const [showTips, setShowTips] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) setSlug(slugify(value));
  };

  const toggleMulti = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, field: keyof Instruction, value: string | number) => {
    setInstructions((prev) => prev.map((inst, i) => (i === index ? { ...inst, [field]: value } : inst)));
  };

  const removeInstruction = (index: number) => {
    if (instructions.length <= 1) return;
    setInstructions((prev) => prev.filter((_, i) => i !== index).map((inst, i) => ({ ...inst, step: i + 1 })));
  };

  const validate = (): string | null => {
    if (!title.trim()) return "The recipe needs a name.";
    if (category.length === 0) return "Choose at least one category.";
    if (!ingredients.some((i) => i.name.trim())) return "Add at least one ingredient.";
    if (!instructions.some((i) => i.text.trim())) return "Add at least one step.";
    if (yieldKind === "makes" && !yieldOne.trim() && !yieldOther.trim()) return "Say what it makes (cookies, slices, buns).";
    if (ovenTemp && (Number(ovenTemp) < 50 || Number(ovenTemp) > 300)) return "Oven temperature should be between 50 and 300 C.";
    return null;
  };

  const showError = (message: string) => {
    setError(message);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const openPreview = async () => {
    try {
      const res = await adminFetch(`/api/admin/preview?type=recipe&slug=${encodeURIComponent(slug)}`);
      const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
      if (!res.ok || !data.path) throw new Error(data.error || "Could not create a preview link");
      window.open(data.path, "_blank", "noopener");
    } catch (e) {
      showError(e instanceof Error ? e.message : "Could not create a preview link");
    }
  };

  const handleSave = async (publishOverride?: "draft" | "published") => {
    const finalStatus = publishOverride || status;
    const validationError = validate();
    if (validationError) {
      showError(validationError);
      return;
    }

    setError("");
    setSaving(true);

    const body = {
      title,
      slug,
      description,
      personalStory,
      heroImage,
      heroImageAlt,
      instagramUrl,
      category,
      mealType,
      dietaryTags,
      specialOccasion,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      difficulty,
      prepTime,
      cookTime,
      extraTime: extraMinutes > 0 ? { minutes: extraMinutes, label: extraLabel.trim() || "resting" } : null,
      servings,
      yieldKind,
      yieldNoun: yieldKind === "makes" ? { one: yieldOne.trim(), other: yieldOther.trim() } : undefined,
      oven: ovenTemp ? { tempC: Number(ovenTemp), fan: ovenFan } : null,
      ruksNote,
      badges,
      verdicts: { tasteTester, agooh },
      inspiredBy,
      keeps,
      ingredients: ingredients.filter((i) => i.name.trim()),
      instructions: instructions.filter((i) => i.text.trim()),
      tips,
      nutrition: calories || protein || carbs || fat ? { calories, protein, carbs, fat } : undefined,
      seo: metaTitle || metaDescription ? { metaTitle, metaDescription } : undefined,
      status: finalStatus,
      featured,
    };

    try {
      const url = isEdit ? `/api/admin/recipes/${recipe.id}` : "/api/admin/recipes";
      const method = isEdit ? "PUT" : "POST";
      const res = await adminFetch(url, { method, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to save");
      }
      router.push("/admin/recipes");
    } catch (e) {
      showError(e instanceof Error && e.message !== "Failed to save" ? e.message : "Could not save the recipe. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24">
      {error && (
        <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--color-warning-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)]" role="alert">
          {error}
        </div>
      )}

      <Section title="The bake">
        <Input label="Name" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Brown butter chocolate chip cookies" />
        <Input label="Web address (slug)" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="made-from-the-name" />
        <Textarea label="A line for the card" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One or two sentences. Shows under the name on lists and in search results." />
        <div className="space-y-1.5">
          <Textarea
            label="The story (optional)"
            value={personalStory}
            onChange={(e) => setPersonalStory(e.target.value)}
            placeholder="Where it came from, who it was for, what went wrong the first time."
            className="min-h-[120px]"
          />
          <p className={hintClass}>In your words. Readers see the first paragraph, then a &ldquo;Read the rest&rdquo; link, so the ingredients are never far away.</p>
        </div>
      </Section>

      <Section title="Photos">
        <ImageUpload label="The photo" value={heroImage} onChange={setHeroImage} folder="recipes" hint="Portrait or square works best on phones. Phone photos are shrunk automatically before upload." />
        {heroImage && (
          <div className="space-y-1.5">
            <Input
              label="Describe the photo"
              value={heroImageAlt}
              onChange={(e) => setHeroImageAlt(e.target.value.slice(0, MAX.alt))}
              maxLength={MAX.alt}
              placeholder="A stack of cookies on a wire rack, the top one broken in half"
            />
            <p className={hintClass}>
              For people who use a screen reader, and for search. One plain sentence. {heroImageAlt.length}/{MAX.alt}
            </p>
          </div>
        )}
        <Input label="Instagram reel (optional)" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://www.instagram.com/reel/..." />
      </Section>

      <Section title="Where it lives">
        {CATEGORY_GROUPS.map((group) => (
          <PillGroup
            key={group.value}
            label={group.label}
            options={categoriesInGroup(group.value).map((c) => c.value)}
            selected={category}
            onToggle={(v) => toggleMulti(category, v, setCategory)}
            display={Object.fromEntries(categoriesInGroup(group.value).map((c) => [c.value, c.label]))}
          />
        ))}
        <PillGroup label="Meal (optional)" options={MEAL_TYPES.map((m) => m.value)} selected={mealType} onToggle={(v) => toggleMulti(mealType, v, setMealType)} display={Object.fromEntries(MEAL_TYPES.map((m) => [m.value, m.label]))} />
        <PillGroup label="Dietary notes (optional)" options={[...DIETARY_TAGS]} selected={dietaryTags} onToggle={(v) => toggleMulti(dietaryTags, v, setDietaryTags)} />
        <PillGroup label="Occasion (optional)" options={SPECIAL_OCCASIONS.map((s) => s.value)} selected={specialOccasion} onToggle={(v) => toggleMulti(specialOccasion, v, setSpecialOccasion)} display={Object.fromEntries(SPECIAL_OCCASIONS.map((s) => [s.value, s.label]))} />
        <Input label="Search words (comma separated, optional)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cookies, brown butter, chocolate" />
        <div className="space-y-1.5">
          <label className={labelClass}>How hard is it</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")} className={`${selectClass} w-full`}>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Times, how much it makes, the oven">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input label="Prep (minutes)" type="number" min={0} value={prepTime || ""} onChange={(e) => setPrepTime(Number(e.target.value))} />
          <Input label="Cook or bake (minutes)" type="number" min={0} value={cookTime || ""} onChange={(e) => setCookTime(Number(e.target.value))} />
          <Input label="Extra time (minutes)" type="number" min={0} value={extraMinutes || ""} onChange={(e) => setExtraMinutes(Number(e.target.value))} />
          <div className="space-y-1.5">
            <label htmlFor="extraLabel" className={labelClass}>
              Extra time is for
            </label>
            <input
              id="extraLabel"
              list="extra-labels"
              value={extraLabel}
              onChange={(e) => setExtraLabel(e.target.value.slice(0, MAX.extraLabel))}
              maxLength={MAX.extraLabel}
              className={`${selectClass} w-full`}
              disabled={!extraMinutes}
            />
            <datalist id="extra-labels">
              {EXTRA_LABELS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
        </div>
        <p className={hintClass}>Extra time is chilling, proving, setting or resting. It shows as &ldquo;plus overnight chilling&rdquo; and is not counted as hands-on time.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label htmlFor="yieldKind" className={labelClass}>
              Serves or makes
            </label>
            <select id="yieldKind" value={yieldKind} onChange={(e) => setYieldKind(e.target.value as YieldKind)} className={`${selectClass} w-full`}>
              {YIELD_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <Input label="How many" type="number" min={1} value={servings || ""} onChange={(e) => setServings(Number(e.target.value))} />
          {yieldKind === "makes" && (
            <>
              <Input label="One of them is a" value={yieldOne} onChange={(e) => setYieldOne(e.target.value.slice(0, MAX.yieldNoun))} maxLength={MAX.yieldNoun} placeholder="cookie" />
              <Input label="Lots of them are" value={yieldOther} onChange={(e) => setYieldOther(e.target.value.slice(0, MAX.yieldNoun))} maxLength={MAX.yieldNoun} placeholder="cookies" />
            </>
          )}
        </div>
        <p className={hintClass}>
          {yieldKind === "makes"
            ? "Shows as “Makes 12 cookies” and readers can halve, double or triple the batch."
            : "Shows as “Serves 4” and readers can change the number of people."}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
          <Input label="Oven (C)" type="number" min={50} max={300} value={ovenTemp} onChange={(e) => setOvenTemp(e.target.value)} placeholder="180" />
          <label className="flex items-center gap-2 h-11 cursor-pointer col-span-2">
            <input type="checkbox" checked={ovenFan} onChange={(e) => setOvenFan(e.target.checked)} disabled={!ovenTemp} className="size-5 accent-[var(--color-primary)]" />
            <span className="text-sm text-[var(--color-text-primary)]">That is the fan setting</span>
          </label>
        </div>
        <p className={hintClass}>Leave the oven empty for no-bake recipes. Fan, conventional, Fahrenheit and gas mark are all worked out on the page from what you type.</p>
      </Section>

      <Section title="Ingredients">
        <div className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={ing.id} className="space-y-2 sm:space-y-0">
              <div className="flex gap-2 items-start">
                <Input className="w-20" placeholder="Amt" aria-label="Amount" value={ing.amount} onChange={(e) => updateIngredient(i, "amount", e.target.value)} />
                <select value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} aria-label="Unit" className={`${selectClass} w-24 px-2`}>
                  <option value="">Unit</option>
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <Input className="flex-1" placeholder="Ingredient" aria-label="Ingredient" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} />
                <Input className="hidden sm:block w-28" placeholder="Group" aria-label="Group" value={ing.group || ""} onChange={(e) => updateIngredient(i, "group", e.target.value)} />
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  aria-label="Remove ingredient"
                  className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="sm:hidden">
                <Input className="w-full" placeholder="Group (optional)" aria-label="Group" value={ing.group || ""} onChange={(e) => updateIngredient(i, "group", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setIngredients([...ingredients, newIngredient()])} className="h-11 text-sm text-[var(--color-primary)] hover:underline">
            Add an ingredient
          </button>
          <p className={hintClass}>Amounts can be fractions (1/2, 1.5). Groups such as &ldquo;For the icing&rdquo; split the list into headed parts.</p>
        </div>
      </Section>

      <Section title="Method">
        <div className="space-y-4">
          {instructions.map((inst, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2 items-start">
                <span className="h-11 w-8 flex items-center justify-center text-sm font-semibold text-[var(--color-text-tertiary)] flex-shrink-0">{inst.step}</span>
                <Textarea className="flex-1 min-h-[60px]" placeholder="What to do in this step" aria-label={`Step ${inst.step}`} value={inst.text} onChange={(e) => updateInstruction(i, "text", e.target.value)} />
                <button
                  type="button"
                  onClick={() => removeInstruction(i)}
                  aria-label="Remove step"
                  className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="pl-10 space-y-2">
                <ImageUpload compact label="Step photo (optional)" value={inst.image || ""} onChange={(v) => updateInstruction(i, "image", v)} folder="steps" />
                {inst.image && (
                  <Input
                    placeholder="Describe the step photo"
                    aria-label={`Describe the photo for step ${inst.step}`}
                    value={inst.imageAlt || ""}
                    onChange={(e) => updateInstruction(i, "imageAlt", e.target.value.slice(0, MAX.alt))}
                    maxLength={MAX.alt}
                  />
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setInstructions([...instructions, newInstruction(instructions.length + 1)])} className="h-11 text-sm text-[var(--color-primary)] hover:underline">
            Add a step
          </button>
        </div>
      </Section>

      <Collapsible title="The personal bits (optional)" open={showPersonal} onToggle={() => setShowPersonal(!showPersonal)}>
        <div className="space-y-6 pt-2">
          <div className="space-y-1.5">
            <Input label="Your note" value={ruksNote} onChange={(e) => setRuksNote(e.target.value.slice(0, MAX.ruksNote))} maxLength={MAX.ruksNote} placeholder="third time lucky" />
            <p className={hintClass}>
              Shows in your handwriting by the name. A few words is plenty. {ruksNote.length}/{MAX.ruksNote}
            </p>
            {ruksNote && (
              <p className="note text-[var(--color-text-secondary)]" aria-hidden="true">
                {ruksNote}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Charms</label>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => {
                const active = badges.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleMulti(badges, b.id, setBadges)}
                    aria-pressed={active}
                    title={b.blurb}
                    className={`h-10 px-4 rounded-full text-sm font-medium border transition-colors ${
                      active
                        ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                        : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            <p className={hintClass}>Small chips on the recipe. Each one also puts the bake in its collection. Two at most is usually right.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Input label="The taste-tester says" value={tasteTester} onChange={(e) => setTasteTester(e.target.value.slice(0, MAX.verdict))} maxLength={MAX.verdict} placeholder="Ate three before they cooled." />
              <p className={hintClass}>
                {tasteTester.length}/{MAX.verdict}
              </p>
            </div>
            <div className="space-y-1.5">
              <Input label="Agooh says" value={agooh} onChange={(e) => setAgooh(e.target.value.slice(0, MAX.verdict))} maxLength={MAX.verdict} placeholder="More chocolate next time." />
              <p className={hintClass}>
                {agooh.length}/{MAX.verdict}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Input label="Inspired by" value={inspiredBy} onChange={(e) => setInspiredBy(e.target.value.slice(0, MAX.inspiredBy))} maxLength={MAX.inspiredBy} placeholder="a bakery in Lisbon" />
            <p className={hintClass}>
              Shows as &ldquo;Inspired by {inspiredBy || "…"}&rdquo;. {inspiredBy.length}/{MAX.inspiredBy}
            </p>
          </div>

          <div className="space-y-1.5">
            <Input label="Keeps" value={keeps} onChange={(e) => setKeeps(e.target.value.slice(0, MAX.keeps))} maxLength={MAX.keeps} placeholder="Three days in a tin. Freezes well unbaked." />
            <p className={hintClass}>
              {keeps.length}/{MAX.keeps}
            </p>
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Tips and nutrition (optional)" open={showTips} onToggle={() => setShowTips(!showTips)}>
        <div className="pt-2">
          <Textarea label="Tips" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="The thing you wish someone had told you." />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <Input label="Calories" type="number" min={0} value={calories || ""} onChange={(e) => setCalories(Number(e.target.value))} />
            <Input label="Protein (g)" type="number" min={0} value={protein || ""} onChange={(e) => setProtein(Number(e.target.value))} />
            <Input label="Carbs (g)" type="number" min={0} value={carbs || ""} onChange={(e) => setCarbs(Number(e.target.value))} />
            <Input label="Fat (g)" type="number" min={0} value={fat || ""} onChange={(e) => setFat(Number(e.target.value))} />
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Search engines (optional)" open={showSeo} onToggle={() => setShowSeo(!showSeo)}>
        <div className="pt-2">
          <Input label={`Title for search results (${metaTitle.length}/60)`} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={60} />
          <Textarea label={`Description for search results (${metaDescription.length}/160)`} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={160} className="mt-4" />
        </div>
      </Collapsible>

      <Section title="Publishing">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={status === "published"} onChange={(e) => setStatus(e.target.checked ? "published" : "draft")} className="size-5 accent-[var(--color-primary)]" />
            <span className="text-sm font-medium">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
            <span className="text-sm font-medium">Featured</span>
          </label>
        </div>
      </Section>

      {/* Actions: pinned to the bottom so they are always within a thumb's reach */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 bg-[var(--color-background)] border-t border-[var(--color-border)]">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="h-12 px-6 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save and publish" : "Publish"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="h-12 px-6 rounded-full border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50"
          >
            Save as draft
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={openPreview}
              className="h-12 px-6 rounded-full border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-secondary)] transition-colors"
              title="Opens the saved version of this recipe in a new tab, even while it is a draft"
            >
              Preview
            </button>
          )}
          <button type="button" onClick={() => router.push("/admin/recipes")} className="h-12 px-4 rounded-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponents

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
      {children}
    </section>
  );
}

function Collapsible({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--color-secondary)] transition-colors">
        <span className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</span>
        <svg
          className={`w-5 h-5 text-[var(--color-text-tertiary)] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

function PillGroup({
  label,
  options,
  selected,
  onToggle,
  display,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  display?: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              aria-pressed={active}
              className={`h-10 px-4 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {display?.[opt] || opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
