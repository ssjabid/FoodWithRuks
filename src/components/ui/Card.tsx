import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** kept for API compatibility; cards are flat now and never move */
  hover?: boolean;
}

/** Flat editorial card: no border, no shadow, rounded image clip. Hover treatment lives on the parent link. */
export function Card({ className, hover: _hover, children, ...props }: CardProps) {
  void _hover;
  return (
    <div className={cn("rounded-[var(--radius-md)] overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-3", className)} {...props}>
      {children}
    </div>
  );
}
