import Link from "next/link";
import { Necklace } from "@/components/brand/Necklace";
import { Note } from "@/components/brand/Note";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { FOOTER_LINKS } from "@/lib/constants";
import { COPY } from "@/lib/copy";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/site";
import { getPageContentSafe } from "@/lib/firebase/pageContent";

interface FooterProps {
  showCooking: boolean;
}

export async function Footer({ showCooking }: FooterProps) {
  const year = new Date().getFullYear();
  const content = await getPageContentSafe();
  const links = FOOTER_LINKS.filter((item) => item.hideWhenEmpty !== "cooking" || showCooking);

  return (
    <footer className="mt-20">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <Necklace className="mb-10" />
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end pb-12">
          <div className="max-w-md">
            {/* DRAFT: needs Ruks */}
            <Note size="lg" as="p">
              {COPY.footerLine}
            </Note>
            {content.footerBlurb && <p className="text-sm text-[var(--color-text-2)] mt-2">{content.footerBlurb}</p>}
            <p className="text-xs text-[var(--color-text-3)] mt-4">
              {SITE_NAME}, {year}. Recipes and photos are Ruks&rsquo;s own.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-2)] lg:justify-end">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="link hover:text-[var(--color-text)]">
                {item.label}
              </Link>
            ))}
            <a href={SOCIAL_LINKS.instagram.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5 hover:text-[var(--color-text)]">
              <InstagramIcon className="w-4 h-4" />
              {SOCIAL_LINKS.instagram.handle}
            </a>
            <a href="/feed.xml" className="link hover:text-[var(--color-text)]">
              RSS
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
