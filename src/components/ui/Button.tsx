import Link from "next/link";
import { ButtonHTMLAttributes, ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/* Things you touch are round (DESIGN: crisp outside, soft inside). */
const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-cheek)] text-[var(--color-on-cheek)] hover:bg-[var(--color-cheek-hover)]",
  secondary: "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-blush)]",
  outline: "border-[1.5px] border-[var(--color-line-strong)] text-[var(--color-text)] hover:border-[var(--color-cheek)] hover:text-[var(--color-cheek)]",
  ghost: "text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm font-medium",
  md: "h-12 px-6 text-base font-semibold",
  lg: "h-13 px-7 text-base font-semibold",
};

/** Shared class builder so links and buttons look identical. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors",
    "disabled:opacity-50 disabled:pointer-events-none",
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
  <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />
));
Button.displayName = "Button";

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A Next <Link> that looks like a Button (avoids nesting a <button> inside an <a>). */
function ButtonLink({ className, variant = "primary", size = "md", ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

export { Button, ButtonLink };
