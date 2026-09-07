import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminBrandProps {
  className?: string;
  /** Link to /admin (default) or render as static text. */
  asLink?: boolean;
  size?: "md" | "lg";
}

export function AdminBrand({ className, asLink = true, size = "md" }: AdminBrandProps) {
  const inner = (
    <>
      <span className={cn("font-heading font-semibold tracking-tight text-[var(--color-text-primary)]", size === "lg" ? "text-2xl" : "text-lg")}>
        Agooh <span className="text-[var(--color-accent-text)]">&amp;</span> Ruks
      </span>
      <span className="ml-2 align-middle text-[10px] font-body font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-text-secondary)]">
        Admin
      </span>
    </>
  );

  if (!asLink) return <span className={cn("inline-flex items-center", className)}>{inner}</span>;

  return (
    <Link href="/admin" className={cn("inline-flex items-center hover:opacity-80 transition-opacity", className)}>
      {inner}
    </Link>
  );
}
