"use client";

import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";

export function InstagramBlock() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer>
          <StaggerItem>
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] px-6 py-10 sm:px-10 sm:py-14 text-center"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--color-accent-soft) 60%, var(--color-elevated)), var(--color-elevated) 60%)",
              }}
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent-text)] shadow-[var(--shadow-sm)]">
                <InstagramIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Follow along on Instagram</h2>
              <p className="text-[var(--color-text-secondary)] text-base sm:text-lg max-w-xl mx-auto mb-6">
                {TAGLINE_SECONDARY}. Reels, behind-the-scenes, and whatever is bubbling on the stove today.
              </p>
              <motion.a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                {SOCIAL_LINKS.instagram.handle}
              </motion.a>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
