import { ImageResponse } from "next/og";
import { getRecipeBySlug } from "@/lib/firebase/recipes";
import { fixtureRecipeBySlug } from "@/lib/content";
import { factsLine } from "@/lib/facts";
import { SITE_NAME } from "@/lib/site";
import { OG, absoluteUrl, fetchImageDataUrl, loadLora, markDataUrl } from "@/lib/og";
import type { Recipe } from "@/types";

export const alt = `A recipe from ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The recipe card: her photo on the left when there is one, the bake's name and one plain fact on the right. */
export default async function RecipeOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let recipe: Recipe | null = null;
  try {
    recipe = await getRecipeBySlug(slug);
  } catch {
    recipe = null;
  }
  if (!recipe) recipe = fixtureRecipeBySlug(slug);

  const [lora, photo] = await Promise.all([loadLora(500), recipe?.heroImage ? fetchImageDataUrl(absoluteUrl(recipe.heroImage)) : Promise.resolve(null)]);
  const fonts = lora ? [{ name: "Lora", data: lora, weight: 500 as const, style: "normal" as const }] : undefined;
  const serif = lora ? "Lora" : "Georgia, 'Times New Roman', serif";
  const title = recipe?.title ?? SITE_NAME;
  const facts = recipe ? factsLine(recipe) : "";
  const titleSize = title.length > 40 ? 52 : title.length > 24 ? 64 : 76;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: OG.ground, color: OG.text, fontFamily: serif }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={540} height={630} alt="" style={{ objectFit: "cover", width: 540, height: 630 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "56px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 30, color: OG.text2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markDataUrl()} width={44} height={44} alt="" style={{ marginRight: 14 }} />
            <span>Agooh</span>
            <span style={{ color: OG.cheek, margin: "0 9px" }}>&amp;</span>
            <span>Ruks</span>
          </div>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 500, lineHeight: 1.08, letterSpacing: -1, marginTop: 28 }}>{title}</div>
          {facts && <div style={{ display: "flex", fontSize: 30, color: OG.text2, marginTop: 24 }}>{facts}</div>}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
