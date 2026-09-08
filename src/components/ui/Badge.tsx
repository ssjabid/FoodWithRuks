import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-secondary)] text-[var(--color-text-primary)]",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent-text)]",
  outline: "border border-[var(--color-border)] text-[var(--color-text-secondary)]",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-[var(--radius-badge)]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
