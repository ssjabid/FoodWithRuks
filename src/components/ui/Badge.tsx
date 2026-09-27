import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface)] text-[var(--color-text)]",
  accent: "bg-[var(--color-blush)] text-[var(--color-on-blush)]",
  outline: "border border-[var(--color-line-strong)] text-[var(--color-text-2)]",
};

/** Small round-ended label. Sentence case is the caller's job. */
export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center h-7 px-2.5 text-xs font-medium rounded-full", variantStyles[variant], className)} {...props} />;
}
