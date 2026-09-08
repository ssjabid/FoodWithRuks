import Link from "next/link";
import { cn } from "@/lib/utils";
import { WHAT_TO_EAT, type WhatToEatIcon } from "@/lib/constants";

export interface WhatToEatActive {
  param: "category" | "mealType";
  value: string;
}

interface WhatToEatGridProps {
  active?: WhatToEatActive | null;
  className?: string;
}

/** Compact "What to eat?" filter row used on /recipes. Flat tiles, colour-only hover. */
export function WhatToEatGrid({ active = null, className }: WhatToEatGridProps) {
  return (
    <div className={cn("grid gap-2 grid-cols-3 sm:grid-cols-5 lg:grid-cols-10", className)}>
      {WHAT_TO_EAT.map((item) => {
        const isActive = !!active && active.param === item.param && active.value === item.value;
        const href = isActive ? "/recipes" : `/recipes?${item.param}=${item.value}`;
        return (
          <Link
            key={item.key}
            href={href}
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-[var(--radius-md)] border text-xs font-medium text-center transition-colors",
              isActive
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
                : "bg-transparent text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            )}
          >
            <WhatToEatIconSvg icon={item.icon} className="w-5 h-5" />
            <span className="leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

/** Simple line icons, stroke = currentColor. */
export function WhatToEatIconSvg({ icon, className }: { icon: WhatToEatIcon; className?: string }) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icon) {
    case "starter":
      return (
        <svg {...common}>
          <path d="M4 13h16a8 8 0 01-16 0z" />
          <path d="M9 4c0 1.5-1 1.5-1 3M13 4c0 1.5-1 1.5-1 3M17 4c0 1.5-1 1.5-1 3" />
        </svg>
      );
    case "main":
      return (
        <svg {...common}>
          <path d="M3 17h18" />
          <path d="M5 17a7 7 0 0114 0" />
          <path d="M12 8V6" />
          <path d="M2 20h20" />
        </svg>
      );
    case "side":
      return (
        <svg {...common}>
          <path d="M6 14h12a6 6 0 01-12 0z" />
          <path d="M18 5l-5 6" />
          <circle cx="19" cy="4" r="1.5" />
        </svg>
      );
    case "snack":
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="12" rx="3" />
          <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
        </svg>
      );
    case "breakfast":
      return (
        <svg {...common}>
          <circle cx="11" cy="12" r="7" />
          <circle cx="11" cy="12" r="2.5" />
          <path d="M18 12h4" />
        </svg>
      );
    case "dinner":
      return (
        <svg {...common}>
          <path d="M7 3v18M5 3v6a2 2 0 004 0V3" />
          <path d="M17 3c-2 2-2 8 0 10v8" />
        </svg>
      );
    case "dessert":
      return (
        <svg {...common}>
          <path d="M6 11h12l-1.5 9h-9z" />
          <path d="M5 11a3 3 0 013-3 4 4 0 018 0 3 3 0 013 3" />
          <path d="M12 4v2" />
        </svg>
      );
    case "drink":
      return (
        <svg {...common}>
          <path d="M6 5h12l-1.5 15h-9z" />
          <path d="M8 10h8" />
          <path d="M13 5l4-3" />
        </svg>
      );
    case "bread":
      return (
        <svg {...common}>
          <path d="M4 12a4 4 0 014-4h8a4 4 0 014 4v6H4z" />
          <path d="M8 12v6M16 12v6" />
        </svg>
      );
    case "baby":
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
