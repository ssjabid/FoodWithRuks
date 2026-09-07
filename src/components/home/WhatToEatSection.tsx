"use client";

import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { WhatToEatGrid } from "@/components/recipe/WhatToEatGrid";

export function WhatToEatSection() {
  return (
    <section className="py-16 sm:py-20 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer>
          <StaggerItem>
            <div className="mb-8 sm:mb-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">What to eat?</h2>
              <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
                Pick a craving and we&apos;ll take it from there.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        <WhatToEatGrid size="large" />
      </div>
    </section>
  );
}
