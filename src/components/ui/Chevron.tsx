import { cn } from "@/lib/utils";

interface ChevronProps {
  open?: boolean;
  className?: string;
}

/** Down-pointing chevron that rotates when `open`. One implementation for every disclosure. */
export function Chevron({ open = false, className }: ChevronProps) {
  return (
    <svg
      className={cn("shrink-0 transition-transform duration-200", open && "rotate-180", className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
