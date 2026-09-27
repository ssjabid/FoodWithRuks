import { useId } from "react";
import { cn } from "@/lib/utils";
import { MARK, MARK_VIEWBOX, eyePaths, eyeStroke, type MarkState } from "@/lib/mark";

interface MarkProps {
  /** squished = the resting face (logo); open = two dots; asleep = flat lines (easter eggs only) */
  state?: MarkState;
  /** single bake, or the pair (a big one and a small one) */
  variant?: "single" | "pair";
  /** Rendered size in px (width). The pair is wider than it is tall. */
  size?: number;
  /** A couple of crumbs beside the bite (404 page) */
  crumbs?: boolean;
  className?: string;
  /** Accessible name; empty string hides it from screen readers (decorative use) */
  title?: string;
}

/** The squish mark. Colours come from the theme tokens so it sits on any surface. */
export function Mark({ state = "squished", variant = "single", size = 28, crumbs = false, className, title = "" }: MarkProps) {
  const id = useId();
  const decorative = title === "";
  const width = variant === "pair" ? size * 1.5 : size;

  return (
    <svg
      viewBox={variant === "pair" ? "0 0 96 64" : MARK_VIEWBOX}
      width={width}
      height={size}
      className={cn("mark shrink-0", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
    >
      <Bake id={`${id}-a`} state={state} crumbs={crumbs} />
      {variant === "pair" && (
        <g transform="translate(58 30) scale(0.56)">
          <Bake id={`${id}-b`} state={state === "asleep" ? "asleep" : "open"} />
        </g>
      )}
    </svg>
  );
}

function Bake({ id, state, crumbs = false }: { id: string; state: MarkState; crumbs?: boolean }) {
  const { body, bite, cheeks } = MARK;
  return (
    <g>
      <mask id={id}>
        <rect width="64" height="64" fill="white" />
        <circle cx={bite.cx} cy={bite.cy} r={bite.r} fill="black" />
      </mask>
      <g mask={`url(#${id})`}>
        <circle cx={body.cx} cy={body.cy} r={body.r} fill="var(--color-mark-body)" stroke="var(--color-mark-ink)" strokeWidth={MARK.bodyStroke} />
      </g>
      {/* the bite's edge */}
      <path
        d={`M${bite.cx - bite.r * 0.62} ${bite.cy + bite.r * 0.78} a${bite.r} ${bite.r} 0 0 0 ${bite.r * 1.32} -${bite.r * 0.35}`}
        fill="none"
        stroke="var(--color-mark-ink)"
        strokeWidth={MARK.bodyStroke}
        strokeLinecap="round"
      />
      {cheeks.map((c, i) => (
        <circle key={i} className="mark-cheek" cx={c.cx} cy={c.cy} r={c.r} fill="var(--color-mark-cheek)" />
      ))}
      {eyePaths(state).map((d, i) => (
        <path key={i} className="mark-eye" d={d} fill="none" stroke="var(--color-mark-ink)" strokeWidth={eyeStroke(state)} strokeLinecap="round" />
      ))}
      {crumbs &&
        MARK.crumbs.map((c, i) => (
          <circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} fill="var(--color-mark-body)" stroke="var(--color-mark-ink)" strokeWidth={1} />
        ))}
    </g>
  );
}
