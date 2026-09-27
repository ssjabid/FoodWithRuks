import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_BYLINE, SITE_NAME } from "@/lib/site";
import { Mark } from "./Mark";

interface WordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Show "Pass the Butter, Ruks" underneath, in her handwriting layer */
  withByline?: boolean;
  /** Show the mark beside the name */
  withMark?: boolean;
  /** Plain span instead of a link (inside another link, or on the home page header) */
  asText?: boolean;
}

const sizes = {
  sm: { text: "text-[1.125rem]", mark: 22 },
  md: { text: "text-[1.375rem]", mark: 26 },
  lg: { text: "text-[1.75rem]", mark: 34 },
};

/** "Agooh & Ruks" in Lora. The ampersand wears the cheek colour: that is the one ring on the wordmark. */
export function Wordmark({ className, size = "md", withByline = false, withMark = true, asText = false }: WordmarkProps) {
  const s = sizes[size];
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {withMark && <Mark size={s.mark} />}
      <span className="flex flex-col leading-none">
        <span className={cn("font-heading font-medium tracking-tight text-[var(--color-text)]", s.text)}>
          Agooh <span className="text-[var(--color-cheek)]">&amp;</span> Ruks
        </span>
        {withByline && <span className="note text-[1rem] leading-tight mt-1">{SITE_BYLINE}</span>}
      </span>
    </span>
  );

  if (asText) return content;
  return (
    <Link href="/" className="inline-flex rounded-[var(--radius-sm)]" aria-label={`${SITE_NAME}, home`}>
      {content}
    </Link>
  );
}
