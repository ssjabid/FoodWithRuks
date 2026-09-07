"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { WHAT_TO_EAT, type WhatToEatIcon } from "@/lib/constants";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";

export interface WhatToEatActive {
  param: "category" | "mealType";
  value: string;
}

interface WhatToEatGridProps {
  /** Which box is currently selected (recipes page). */
  active?: WhatToEatActive | null;
  /** large = home page hero boxes, compact = recipes page filter row */
  size?: "compact" | "large";
  className?: string;
}

export function WhatToEatGrid({ active = null, size = "large", className }: WhatToEatGridProps) {
  const compact = size === "compact";

  return (
    <StaggerContainer
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-3 sm:grid-cols-5 lg:grid-cols-10" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4",
        className
      )}
    >
      {WHAT_TO_EAT.map((item) => {
        const isActive = !!active && active.param === item.param && active.value === item.value;
        const href = isActive ? "/recipes" : `/recipes?${item.param}=${item.value}`;
        return (
          <StaggerItem key={item.key}>
            <Link
              href={href}
              scroll={false}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "group flex items-center justify-center text-center rounded-[var(--radius-lg)] border transition-all duration-200",
                compact
                  ? "flex-col gap-1.5 px-2 py-3 text-xs font-medium"
                  : "flex-col gap-3 px-4 py-6 sm:py-8 text-sm sm:text-base font-medium",
                isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)] shadow-[var(--shadow-md)]"
                  : "bg-[var(--color-elevated)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  compact ? "w-8 h-8" : "w-12 h-12 sm:w-14 sm:h-14",
                  isActive
                    ? "bg-[color-mix(in_srgb,var(--color-on-primary)_15%,transparent)]"
                    : "bg-[var(--color-secondary)] text-[var(--color-primary)] group-hover:bg-[var(--color-accent-soft)]"
                )}
                aria-hidden="true"
              >
                <WhatToEatIconSvg icon={item.icon} className={compact ? "w-4 h-4" : "w-6 h-6 sm:w-7 sm:h-7"} />
              </span>
              <span className={compact ? "leading-tight" : "font-heading text-base sm:text-lg"}>{item.label}</span>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}

/** Simple line icons, stroke = currentColor. */
function WhatToEatIconSvg({ icon, className }: { icon: WhatToEatIcon; className?: string }) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "starter": // small bowl with steam
      return (
        <svg {...common}>
          <path d="M4 13h16a8 8 0 01-16 0z" />
          <path d="M9 4c0 1.5-1 1.5-1 3M13 4c0 1.5-1 1.5-1 3M17 4c0 1.5-1 1.5-1 3" />
        </svg>
      );
    case "main": // plate with cloche
      return (
        <svg {...common}>
          <path d="M3 17h18" />
          <path d="M5 17a7 7 0 0114 0" />
          <path d="M12 8V6" />
          <path d="M2 20h20" />
        </svg>
      );
    case "side": // small side bowl + spoon
      return (
        <svg {...common}>
          <path d="M6 14h12a6 6 0 01-12 0z" />
          <path d="M18 5l-5 6" />
          <circle cx="19" cy="4" r="1.5" />
        </svg>
      );
    case "snack": // pretzel-ish / cracker
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="12" rx="3" />
          <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
        </svg>
      );
    case "breakfast": // egg in pan
      return (
        <svg {...common}>
          <circle cx="11" cy="12" r="7" />
          <circle cx="11" cy="12" r="2.5" />
          <path d="M18 12h4" />
        </svg>
      );
    case "dinner": // fork + knife
      return (
        <svg {...common}>
          <path d="M7 3v18M5 3v6a2 2 0 004 0V3" />
          <path d="M17 3c-2 2-2 8 0 10v8" />
        </svg>
      );
    case "dessert": // cupcake
      return (
        <svg {...common}>
          <path d="M6 11h12l-1.5 9h-9z" />
          <path d="M5 11a3 3 0 013-3 4 4 0 018 0 3 3 0 013 3" />
          <path d="M12 4v2" />
        </svg>
      );
    case "drink": // glass with straw
      return (
        <svg {...common}>
          <path d="M6 5h12l-1.5 15h-9z" />
          <path d="M8 10h8" />
          <path d="M13 5l4-3" />
        </svg>
      );
    case "bread": // loaf
      return (
        <svg {...common}>
          <path d="M4 12a4 4 0 014-4h8a4 4 0 014 4v6H4z" />
          <path d="M8 12v6M16 12v6" />
        </svg>
      );
    case "baby": // bib / smiley
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="7" />
          <path d="M9 12h.01M15 12h.01" />
          <path d="M9.5 15.5a3.5 3.5 0 005 0" />
          <path d="M8 6a2 2 0 014 0 2 2 0 014 0" />
        </svg>
      );
  }
}
