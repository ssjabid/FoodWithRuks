"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Textarea } from "@/components/ui/Input";
import { adminFetch } from "@/lib/adminFetch";
import { slugify } from "@/lib/utils";
import {
  RECIPE_CATEGORIES,
  MEAL_TYPES,
  DIETARY_TAGS,
  SPECIAL_OCCASIONS,
  DIFFICULTY_OPTIONS,
  UNIT_OPTIONS,
} from "@/lib/constants";
import type { Recipe, Ingredient, Instruction } from "@/types";

interface RecipeFormProps {
  recipe?: Recipe;
}

function newIngredient(): Ingredient {
  return { id: crypto.randomUUID(), amount: "", unit: "", name: "", group: "" };
}

function newInstruction(step: number): Instruction {
  return { step, text: "", image: "" };
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const isEdit = !!recipe;

  const [title, setTitle] = useState(recipe?.title || "");
  const [slug, setSlug] = useState(recipe?.slug || "");
  const [description, setDescription] = useState(recipe?.description || "");
  const [personalStory, setPersonalStory] = useState(recipe?.personalStory || "");
  const [heroImage, setHeroImage] = useState(recipe?.heroImage || "");
  const [instagramUrl, setInstagramUrl] = useState(recipe?.instagramUrl || "");
  const [category, setCategory] = useState<string[]>(recipe?.category || []);
  const [mealType, setMealType] = useState<string[]>(recipe?.mealType || []);
  const [dietaryTags, setDietaryTags] = useState<string[]>(recipe?.dietaryTags || []);
  const [specialOccasion, setSpecialOccasion] = useState<string[]>(recipe?.specialOccasion || []);
  const [tags, setTags] = useState(recipe?.tags?.join(", ") || "");
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || "medium");
  const [prepTime, setPrepTime] = useState(recipe?.prepTime || 0);
  const [cookTime, setCookTime] = useState(recipe?.cookTime || 0);
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [newIngredient()]
  );
  const [instructions, setInstructions] = useState<Instruction[]>(
    recipe?.instructions?.length ? recipe.instructions : [newInstruction(1)]
  );
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
    setInstructions((prev) =>
      prev.filter((_, i) => i !== index).map((inst, i) => ({ ...inst, step: i + 1 }))
    );
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required";
    if (category.length === 0) return "Select at least one category";
    if (!ingredients.some((i) => i.name.trim())) return "Add at least one ingredient";
    if (!instructions.some((i) => i.text.trim())) return "Add at least one instruction step";
    return null;
  };

  const handleSave = async (publishOverride?: "draft" | "published") => {
    const finalStatus = publishOverride || status;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
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
      instagramUrl,
      category,
      mealType,
      dietaryTags,
      specialOccasion,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      difficulty,
      prepTime,
      cookTime,
      servings,
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

      if (!res.ok) throw new Error("Failed to save");
      router.push("/admin/recipes");
    } catch {
      setError("Failed to save recipe. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="p-3 rounded-[var(--radius-sm)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Section title="Basic Info">
        <Input
          label="Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Recipe title"
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="recipe-slug"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description..."
        />
        <Textarea
          label="Personal Story"
          value={personalStory}
          onChange={(e) => setPersonalStory(e.target.value)}
          placeholder="Your personal story behind this recipe..."
        />
      </Section>

      {/* Media */}
      <Section title="Media">
        <Input
          label="Hero Image URL"
          value={heroImage}
          onChange={(e) => setHeroImage(e.target.value)}
          placeholder="https://..."
        />
        <p className="text-xs text-[var(--color-text-tertiary)]">Image upload coming soon. For now, paste an image URL.</p>
        <Input
          label="Instagram URL"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/p/..."
        />
      </Section>

      {/* Categorization */}
      <Section title="Categorization">
        <PillGroup label="Category" options={RECIPE_CATEGORIES.map((c) => c.value)} selected={category} onToggle={(v) => toggleMulti(category, v, setCategory)} display={Object.fromEntries(RECIPE_CATEGORIES.map((c) => [c.value, c.label]))} />
        <PillGroup label="Meal Type" options={MEAL_TYPES.map((m) => m.value)} selected={mealType} onToggle={(v) => toggleMulti(mealType, v, setMealType)} display={Object.fromEntries(MEAL_TYPES.map((m) => [m.value, m.label]))} />
        <PillGroup label="Dietary Tags" options={[...DIETARY_TAGS]} selected={dietaryTags} onToggle={(v) => toggleMulti(dietaryTags, v, setDietaryTags)} />
        <PillGroup label="Special Occasion" options={SPECIAL_OCCASIONS.map((s) => s.value)} selected={specialOccasion} onToggle={(v) => toggleMulti(specialOccasion, v, setSpecialOccasion)} display={Object.fromEntries(SPECIAL_OCCASIONS.map((s) => [s.value, s.label]))} />
        <Input
          label="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="chicken, curry, comfort food"
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
            className="w-full h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </Section>

      {/* Timing */}
      <Section title="Timing">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Prep Time (min)" type="number" value={prepTime || ""} onChange={(e) => setPrepTime(Number(e.target.value))} />
          <Input label="Cook Time (min)" type="number" value={cookTime || ""} onChange={(e) => setCookTime(Number(e.target.value))} />
          <Input label="Servings" type="number" value={servings || ""} onChange={(e) => setServings(Number(e.target.value))} />
        </div>
      </Section>

      {/* Ingredients */}
      <Section title="Ingredients">
        <div className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={ing.id} className="space-y-2 sm:space-y-0">
              <div className="flex gap-2 items-start">
                <Input className="w-20" placeholder="Amt" value={ing.amount} onChange={(e) => updateIngredient(i, "amount", e.target.value)} />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  className="h-11 px-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] w-24"
                >
                  <option value="">Unit</option>
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <Input className="flex-1" placeholder="Ingredient name" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} />
                <Input className="hidden sm:block w-28" placeholder="Group" value={ing.group || ""} onChange={(e) => updateIngredient(i, "group", e.target.value)} />
                <button
                  onClick={() => removeIngredient(i)}
                  className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-text-tertiary)] hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="sm:hidden">
                <Input className="w-full" placeholder="Group (optional)" value={ing.group || ""} onChange={(e) => updateIngredient(i, "group", e.target.value)} />
              </div>
            </div>
          ))}
          <button
            onClick={() => setIngredients([...ingredients, newIngredient()])}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            + Add ingredient
          </button>
        </div>
      </Section>

      {/* Instructions */}
      <Section title="Instructions">
        <div className="space-y-3">
          {instructions.map((inst, i) => (
            <div key={i} className="space-y-2 sm:space-y-0">
              <div className="flex gap-2 items-start">
                <span className="h-11 w-8 flex items-center justify-center text-sm font-bold text-[var(--color-text-tertiary)] flex-shrink-0">
                  {inst.step}
                </span>
                <Textarea
                  className="flex-1 min-h-[60px]"
                  placeholder="Describe this step..."
                  value={inst.text}
                  onChange={(e) => updateInstruction(i, "text", e.target.value)}
                />
                <Input className="hidden sm:block w-40" placeholder="Image URL" value={inst.image || ""} onChange={(e) => updateInstruction(i, "image", e.target.value)} />
                <button
                  onClick={() => removeInstruction(i)}
                  className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--color-text-tertiary)] hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="sm:hidden pl-10">
                <Input className="w-full" placeholder="Image URL (optional)" value={inst.image || ""} onChange={(e) => updateInstruction(i, "image", e.target.value)} />
              </div>
            </div>
          ))}
          <button
            onClick={() => setInstructions([...instructions, newInstruction(instructions.length + 1)])}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            + Add step
          </button>
        </div>
      </Section>

      {/* Tips & Nutrition (collapsible) */}
      <Collapsible title="Tips & Nutrition" open={showTips} onToggle={() => setShowTips(!showTips)}>
        <Textarea label="Tips" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="Cooking tips..." />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <Input label="Calories" type="number" value={calories || ""} onChange={(e) => setCalories(Number(e.target.value))} />
          <Input label="Protein (g)" type="number" value={protein || ""} onChange={(e) => setProtein(Number(e.target.value))} />
          <Input label="Carbs (g)" type="number" value={carbs || ""} onChange={(e) => setCarbs(Number(e.target.value))} />
          <Input label="Fat (g)" type="number" value={fat || ""} onChange={(e) => setFat(Number(e.target.value))} />
        </div>
      </Collapsible>

      {/* SEO (collapsible) */}
      <Collapsible title="SEO" open={showSeo} onToggle={() => setShowSeo(!showSeo)}>
        <Input
          label={`Meta Title (${metaTitle.length}/60)`}
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          maxLength={60}
        />
        <Textarea
          label={`Meta Description (${metaDescription.length}/160)`}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          maxLength={160}
          className="mt-4"
        />
      </Collapsible>

      {/* Publishing */}
      <Section title="Publishing">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={status === "published"}
              onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
              className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm font-medium">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm font-medium">Featured</span>
          </label>
        </div>
      </Section>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={() => handleSave("published")}
          disabled={saving}
          className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update & Publish" : "Publish"}
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={saving}
          className="h-11 px-6 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-secondary)] transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => router.push("/admin/recipes")}
          className="h-11 px-6 rounded-[var(--radius-sm)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Subcomponents

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
      {children}
    </section>
  );
}

function Collapsible({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--color-secondary)] transition-colors"
      >
        <span className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">{title}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          className="w-5 h-5 text-[var(--color-text-tertiary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <label className="block text-sm font-medium text-[var(--color-text-primary)]">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
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
