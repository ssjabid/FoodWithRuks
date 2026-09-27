import Link from "next/link";
import { cn } from "@/lib/utils";
import { BADGES, type BadgeId } from "@/lib/constants";

interface CharmProps {
  badge: BadgeId;
  /** Link to the collection (default) or render as a plain chip / pressable filter */
  as?: "link" | "chip" | "button";
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Recipe badges as small, round-ended blush chips with a tiny icon. Each links to its collection. */
export function Charm({ badge, as = "link", selected = false, onClick, className }: CharmProps) {
  const meta = BADGES.find((b) => b.id === badge);
  if (!meta) return null;
  const cls = cn("charm", badge === "trail-tested" && "charm-sage", className);
  const inner = (
    <>
      <CharmIcon badge={badge} />
      {meta.label}
    </>
  );

  if (as === "button") {
    return (
      <button type="button" aria-pressed={selected} onClick={onClick} className={cls} title={meta.blurb} data-gold={selected ? "" : undefined}>
        {inner}
      </button>
    );
  }
  if (as === "chip") {
    return (
      <span className={cls} title={meta.blurb}>
        {inner}
      </span>
    );
  }
  return (
    <Link href={`/collections/${meta.collection}`} className={cls} title={meta.blurb}>
      {inner}
    </Link>
  );
}

/** Tiny line icons drawn for this site. 14px, stroke = currentColor. */
export function CharmIcon({ badge, className }: { badge: BadgeId; className?: string }) {
  const p = {
    className: cn("w-3.5 h-3.5 shrink-0", className),
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (badge) {
    case "first-try":
      // a dotted ring: an attempt, not yet a habit
      return (
        <svg {...p}>
          <circle cx="8" cy="8" r="5.5" strokeDasharray="2.2 2.2" />
          <path d="M8 5.5v2.8l1.8 1.2" />
        </svg>
      );
    case "travels-well":
      // a string-tied parcel
      return (
        <svg {...p}>
          <rect x="2.5" y="4.5" width="11" height="9" rx="1" />
          <path d="M8 4.5v9M2.5 9h11M6 4.5c0-1.4 1-2.2 2-1.3 1-.9 2-.1 2 1.3" />
        </svg>
      );
    case "little-helpers":
      // a small hand
      return (
        <svg {...p}>
          <path d="M5.5 8.5V4.2a1 1 0 0 1 2 0v3.3M7.5 7.5V3.4a1 1 0 0 1 2 0v4.1M9.5 7.5V4.4a1 1 0 0 1 2 0v4.6M11.5 9v2.2c0 1.6-1.3 2.8-3 2.8H7.3c-1 0-1.9-.5-2.4-1.3L3.2 10a1 1 0 0 1 1.6-1.2l.7 1" />
        </svg>
      );
    case "trail-tested":
      // a boot
      return (
        <svg {...p}>
          <path d="M4 3.5h4.5v4.2c0 .7.4 1.3 1 1.6l3 1.5c.6.3 1 .9 1 1.6V13H4v-2.5" />
          <path d="M4 3.5v9.5M6.2 6h2.3" />
        </svg>
      );
    case "make-ahead":
      // a clock
      return (
        <svg {...p}>
          <circle cx="8" cy="8.5" r="5.5" />
          <path d="M8 5.5v3l2 1.2M6.5 2h3" />
        </svg>
      );
    case "taste-testers-pick":
      // a fork
      return (
        <svg {...p}>
          <path d="M5 2.5v3.3c0 1 .7 1.7 1.6 1.7H7v6M9 2.5v3.3c0 1-.7 1.7-1.6 1.7M5 2.5v2M9 2.5v2M7 2.5v3.5" />
        </svg>
      );
    default:
      return null;
  }
}
