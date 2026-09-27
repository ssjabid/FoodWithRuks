import { cn } from "@/lib/utils";

/**
 * A divider drawn as a fine chain with a single pendant. One or two per page,
 * for the breaks that matter. Counts as one piece of gold.
 */
export function Necklace({ className }: { className?: string }) {
  return (
    <div className={cn("necklace", className)} aria-hidden="true">
      <i data-gold="" />
    </div>
  );
}
