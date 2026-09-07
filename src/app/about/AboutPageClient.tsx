"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/shared/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { SITE_NAME, SITE_BYLINE, SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";

export function AboutPageClient() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl">
          <StaggerContainer>
            <StaggerItem>
              <div className="mb-8 sm:mb-10">
                <p className="font-heading italic text-[var(--color-accent-text)] mb-2">{SITE_BYLINE}</p>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                  Hi, I&apos;m Ruks!
                </h1>
                <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
                  The home cook behind {SITE_NAME}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-5 text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed mb-10">
                <p>
                  Welcome to {SITE_NAME}, my little corner of the internet where food meets love.
                  Agooh is our little one, and most of what you will find here has been tested on a
                  very honest audience of one before it ever reaches you.
                </p>
                <p>
                  My cooking journey started in my family&apos;s kitchen, watching my mum create magic
                  with simple ingredients. Every dish had a story, every spice had a purpose, and every
                  meal brought the family together.
                </p>
                <p>
                  Today I share those recipes with the same energy: food that is easy to follow,
                  wholesome, and full of flavour. Pure comfort, cooked simply. Nothing complicated,
                  nothing you cannot find in a normal supermarket, and always enough for seconds.
                </p>
                <p>
                  Beyond the kitchen you will find our days out, the places we love to eat, our travels
                  with a toddler in tow, and the crafts that keep rainy afternoons cheerful. Thank you
                  for being here. {TAGLINE_SECONDARY}.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/recipes">
                  <Button>Browse Recipes</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Get in Touch</Button>
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="pt-8 border-t border-[var(--color-border)]">
                <h3 className="font-semibold tracking-tight text-xl text-[var(--color-text-primary)] mb-2">
                  Follow Along
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  New recipes, behind-the-scenes and the occasional kitchen disaster, first on Instagram.
                </p>
                <motion.a
                  href={SOCIAL_LINKS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  {SOCIAL_LINKS.instagram.handle}
                </motion.a>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  );
}
