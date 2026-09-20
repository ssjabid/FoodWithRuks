import { cn } from "@/lib/utils";
import { FoodPlaceholder } from "./FoodPlaceholder";

interface PhotoProps {
  src?: string | null;
  alt: string;
  /** Fixed aspect ratio; omit when the parent sets the size via className. */
  ratio?: "square" | "landscape" | "portrait";
  /** natural = let the image keep its own height (step photos, article images) */
  fit?: "cover" | "natural";
  className?: string;
  /** srcset sizes hint; defaults to a card-sized image */
  sizes?: string;
  /** Above-the-fold images load eagerly */
  priority?: boolean;
}

const UPLOAD_WIDTHS = [1600, 800];

/** Uploaded photos are named <base>-w<width>.webp with several widths; build a srcset from that. */
export function buildSrcSet(src: string): string | undefined {
  const m = src.match(/^(.*)-w(\d+)\.(webp|jpg|png)$/);
  if (!m) return undefined;
  const [, base, w, ext] = m;
  const widths = UPLOAD_WIDTHS.filter((x) => x <= Number(w));
  if (widths.length < 2) return undefined;
  return widths.map((x) => `${base}-w${x}.${ext} ${x}w`).join(", ");
}

/** A real photo when one exists, otherwise the flat placeholder. Plain <img>, no optimisation quota. */
export function Photo({
  src,
  alt,
  ratio,
  fit = "cover",
  className,
  sizes = "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: PhotoProps) {
  if (!src) return <FoodPlaceholder ratio={ratio} className={className} />;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-placeholder-bg)]",
        fit === "cover" && ratio === "square" && "aspect-square",
        fit === "cover" && ratio === "landscape" && "aspect-[5/4]",
        fit === "cover" && ratio === "portrait" && "aspect-[4/5]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={buildSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn("block w-full", fit === "cover" ? "h-full object-cover" : "h-auto")}
      />
    </div>
  );
}
