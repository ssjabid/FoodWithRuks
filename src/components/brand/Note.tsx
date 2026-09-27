import { cn } from "@/lib/utils";

interface NoteProps {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
  size?: "sm" | "md" | "lg";
  /** cheek = the rose; ink = secondary cocoa (default) */
  tone?: "ink" | "cheek";
  /** A slight lean, like a line written on a tin. Use once per screen at most. */
  tilt?: boolean;
}

const sizes = { sm: "text-[1.05rem]", md: "", lg: "text-[1.625rem]" };

/**
 * Her handwriting layer. Always real text (screen readers get it as-is),
 * never for essential information, one or two per screen.
 */
export function Note({ children, className, as = "p", size = "md", tone = "ink", tilt = false }: NoteProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "note",
        sizes[size],
        tone === "cheek" ? "text-[var(--color-cheek)]" : "text-[var(--color-text-2)]",
        tilt && "inline-block -rotate-1 origin-left",
        className
      )}
    >
      {children}
    </Tag>
  );
}
