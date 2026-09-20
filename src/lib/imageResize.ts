"use client";

/**
 * Browser-side photo preparation: decode (honouring EXIF orientation), scale so
 * the longest side is at most `maxSide`, and encode as WebP. Keeps uploads small
 * (a phone photo becomes ~150-300 KB) so the repo stays lean.
 */

/** Longest-side widths committed for every photo; the first is the one stored on the document. */
export const PHOTO_WIDTHS = [1600, 800] as const;

export interface ResizedImage {
  width: number;
  height: number;
  dataUrl: string;
}

export async function resizeImage(file: File, maxSide: number, quality = 0.82): Promise<ResizedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Could not read this photo. Try a JPG or PNG.");
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let dataUrl = canvas.toDataURL("image/webp", quality);
  if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { width, height, dataUrl };
}

/** Produces every configured variant, largest first. */
export async function prepareVariants(file: File): Promise<ResizedImage[]> {
  const out: ResizedImage[] = [];
  for (const w of PHOTO_WIDTHS) out.push(await resizeImage(file, w));
  return out;
}
