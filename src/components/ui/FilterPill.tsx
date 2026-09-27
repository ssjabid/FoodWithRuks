import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

/** A round filter chip, 44px tall so it works with floury fingers. */
export function FilterPill({ label, selected, onClick, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "h-11 px-4 rounded-full text-sm font-medium border-[1.5px] inline-flex items-center gap-1.5 transition-colors",
        selected
          ? "bg-[var(--color-cheek)] text-[var(--color-on-cheek)] border-[var(--color-cheek)]"
          : "bg-transparent text-[var(--color-text-2)] border-[var(--color-line-strong)] hover:border-[var(--color-cheek)] hover:text-[var(--color-cheek)]",
        className
      )}
    >
      {label}
    </button>
  );
}
