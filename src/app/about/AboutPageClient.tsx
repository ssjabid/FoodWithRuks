"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/shared/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";
import { SITE_NAME, SITE_BYLINE, SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";
import { InstagramIcon } from "@/components/shared/InstagramIcon";

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
                  <InstagramIcon className="w-5 h-5" />
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
