"use client";

import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)]",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-text-primary)]",
  outline:
    "border border-[var(--color-primary)] text-[var(--color-primary)]",
  ghost:
    "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-secondary)]",
};

const fillColors: Record<Variant, string> = {
  primary: "bg-[var(--color-primary-hover)]",
  secondary: "bg-[var(--color-border)]",
  outline: "bg-[var(--color-primary)]",
  ghost: "bg-[var(--color-secondary)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3 text-sm font-medium",
  md: "h-11 px-6 text-sm font-semibold",
  lg: "h-11 px-6 text-sm font-semibold",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    const { onDrag, onDragStart, onDragEnd, onAnimationStart, ...safeProps } = props as Record<string, unknown>;
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative overflow-hidden group inline-flex items-center justify-center rounded-[var(--radius-sm)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...(safeProps as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        <span
          className={cn(
            "absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
            fillColors[variant],
            variant === "outline" && "group-hover:text-[var(--color-on-primary)]"
          )}
        />
        <span className={cn("relative z-10", variant === "outline" && "group-hover:text-[var(--color-on-primary)] transition-colors duration-300")}>
          {children}
        </span>
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
