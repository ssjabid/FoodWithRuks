import { cn } from "@/lib/utils";
import { Mark } from "./Mark";

interface PlaceholderProps {
  /** What the photo would show, e.g. "Lamingtons" -> "Lamingtons: photo coming" */
  label?: string;
  ratio?: "square" | "landscape" | "portrait" | "wide";
  className?: string;
  /** Show the caption (off for tiny thumbnails) */
  caption?: boolean;
}

/**
 * Honest placeholder for a photo that does not exist yet: a flour frame, the mark
 * small and centred, and a caption naming the bake. Never a stock photo.
 */
export function Placeholder({ label, ratio, className, caption = true }: PlaceholderProps) {
  return (
    <div
      className={cn(
        "placeholder rounded-[var(--radius-crisp)] overflow-hidden",
        ratio === "square" && "aspect-square",
        ratio === "landscape" && "aspect-[5/4]",
        ratio === "portrait" && "aspect-[4/5]",
        ratio === "wide" && "aspect-[16/10]",
        className
      )}
      role="img"
      aria-label={label ? `${label}: photo coming` : "Photo coming"}
    >
      <Mark state="squished" size={36} className="opacity-70" />
      {caption && label && <span className="text-xs px-3 text-center leading-snug">{label}: photo coming</span>}
    </div>
  );
}
