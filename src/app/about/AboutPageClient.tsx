import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { SITE_NAME, SITE_BYLINE, SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";

export function AboutPageClient() {
  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <header className="mb-8">
          <p className="accent-italic text-lg mb-3">{SITE_BYLINE}</p>
          <h1 className="h-page text-[var(--color-text-primary)] mb-3">Hi, I&apos;m Ruks!</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">The home cook behind {SITE_NAME}</p>
        </header>

        <div className="space-y-5 text-body text-[var(--color-text-primary)] mb-10">
          <p>
            Welcome to {SITE_NAME}, my little corner of the internet where food meets love. Agooh is our little one,
            and most of what you will find here has been tested on a very honest audience of one before it ever
            reaches you.
          </p>
          <p>
            My cooking journey started in my family&apos;s kitchen, watching my mum create magic with simple
            ingredients. Every dish had a story, every spice had a purpose, and every meal brought the family
            together.
          </p>
          <p>
            Today I share those recipes with the same energy: food that is easy to follow, wholesome, and full of
            flavour. Pure comfort, cooked simply. Nothing complicated, nothing you cannot find in a normal
            supermarket, and always enough for seconds.
          </p>
          <p>
            Beyond the kitchen you will find our days out, the places we love to eat, our travels with a toddler in
            tow, and the crafts that keep rainy afternoons cheerful. Thank you for being here. {TAGLINE_SECONDARY}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 mb-12">
          <ButtonLink href="/recipes">Browse recipes</ButtonLink>
          <Link href="/contact" className="link text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
            Get in touch
          </Link>
        </div>

        <div className="pt-8 border-t border-[var(--color-border)]">
          <p className="eyebrow mb-2">Follow along</p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            New recipes, behind-the-scenes and the occasional kitchen disaster, first on Instagram.
          </p>
          <a
            href={SOCIAL_LINKS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex items-center gap-2 text-[var(--color-primary)]"
          >
            <InstagramIcon className="w-5 h-5" />
            {SOCIAL_LINKS.instagram.handle}
          </a>
        </div>
      </div>
    </div>
  );
}
