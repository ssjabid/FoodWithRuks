import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Quiet link on the right ("See all") */
  href?: string;
  linkLabel?: string;
  className?: string;
  as?: "h1" | "h2";
}

/** Section heading in sentence case with an optional quiet link on the right. No labels above it. */
export function SectionHeader({ title, description, href, linkLabel = "See all", className, as = "h2" }: SectionHeaderProps) {
  const Heading = as;
  return (
    <div className={cn("flex items-end justify-between gap-6 mb-6", className)}>
      <div className="min-w-0">
        <Heading className={cn(as === "h1" ? "h-page" : "h-section", "text-[var(--color-text)]")}>{title}</Heading>
        {description && <p className="mt-2 text-[var(--color-text-2)] max-w-[60ch]">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="link shrink-0 text-sm text-[var(--color-text-2)] hover:text-[var(--color-cheek)] pb-1">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
