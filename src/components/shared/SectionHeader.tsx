import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title?: string;
  description?: string;
  /** Quiet link on the right ("View all") */
  href?: string;
  linkLabel?: string;
  className?: string;
  /** Use h1 for page headers */
  as?: "h1" | "h2";
}

/** Editorial section header: eyebrow + heading on the left, quiet link on the right, hairline below. */
export function SectionHeader({ eyebrow, title, description, href, linkLabel = "View all", className, as = "h2" }: SectionHeaderProps) {
  const Heading = as;
  return (
    <div className={cn("flex items-end justify-between gap-6 border-b border-[var(--color-border)] pb-4 mb-8", className)}>
      <div className="min-w-0">
        <p className="eyebrow mb-2">{eyebrow}</p>
        {title && <Heading className={cn(as === "h1" ? "h-page" : "h-section", "text-[var(--color-text-primary)]")}>{title}</Heading>}
        {description && <p className="mt-2 text-[var(--color-text-secondary)] max-w-[60ch]">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="link shrink-0 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] pb-1">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
