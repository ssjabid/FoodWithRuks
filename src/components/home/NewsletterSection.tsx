"use client";

import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="py-16 sm:py-20 bg-[var(--color-surface)] newsletter-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer>
          <StaggerItem>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">Stay Connected</h2>
              <p className="text-[var(--color-text-secondary)] text-base sm:text-lg mb-6">
                New recipes and little-life stories, delivered to your inbox.
              </p>
              <NewsletterForm source="home" variant="inline" />
              <p className="text-xs text-[var(--color-text-tertiary)] mt-3">No spam, ever. Unsubscribe anytime.</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
