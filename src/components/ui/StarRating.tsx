"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({ rating, maxStars = 5, interactive = false, onRate, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div
      className="inline-flex gap-0.5"
      role={interactive ? "radiogroup" : "img"}
      aria-label={`Rating: ${rating} out of ${maxStars}`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starNumber = i + 1;
        const filled = interactive ? starNumber <= (hovered || rating) : starNumber <= rating;
        const Star = (
          <svg
            className={cn(
              sizes[size],
              "transition-colors",
              filled ? "text-[var(--color-warning)]" : "text-[var(--color-border)]"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );

        if (!interactive) return <span key={i}>{Star}</span>;

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={starNumber === rating}
            className="cursor-pointer"
            onClick={() => onRate?.(starNumber)}
            onMouseEnter={() => setHovered(starNumber)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${starNumber} star${starNumber !== 1 ? "s" : ""}`}
          >
            {Star}
          </button>
        );
      })}
    </div>
  );
}
