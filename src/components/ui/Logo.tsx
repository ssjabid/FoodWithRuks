import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_BYLINE } from "@/lib/site";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Show "Pass the Butter, Ruks" beneath the wordmark. */
  withByline?: boolean;
  /** Render as a plain span (no link) — for places already inside a link. */
  asText?: boolean;
}

const sizeStyles = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ className, size = "md", withByline = false, asText = false }: LogoProps) {
  const content = (
    <>
      <span className="font-heading font-semibold tracking-tight text-[var(--color-text-primary)]">
        Agooh <span className="text-[var(--color-accent-text)]">&amp;</span> Ruks
      </span>
      {withByline && (
        <span className="block font-heading italic text-xs font-normal tracking-normal text-[var(--color-text-secondary)] mt-0.5">
          {SITE_BYLINE}
        </span>
      )}
    </>
  );

  const classes = cn("inline-block leading-tight", sizeStyles[size], className);

  if (asText) return <span className={classes}>{content}</span>;

  return (
    <Link href="/" className={cn(classes, "hover:opacity-80 transition-opacity duration-200")} aria-label="Agooh & Ruks — home">
      {content}
    </Link>
  );
}
