import { cn } from "@/lib/utils";
import { Chevron } from "./Chevron";

interface SelectProps {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  id?: string;
  className?: string;
  /** pill = compact rounded control (filter rows); block = full-width form field */
  variant?: "pill" | "block";
  disabled?: boolean;
}

/** Native <select>, styled. Keyboard, type-ahead and Escape come for free. */
export function Select({ options, value, onChange, id, className, variant = "pill", disabled, ...rest }: SelectProps) {
  return (
    <span className={cn("relative inline-flex", variant === "block" && "w-full", className)}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={rest["aria-label"]}
        className={cn(
          "field appearance-none cursor-pointer pr-9",
          variant === "pill"
            ? "h-9 rounded-full pl-4 text-sm font-medium"
            : "h-11 w-full rounded-[var(--radius-sm)] pl-4 text-base",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Chevron className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
    </span>
  );
}
