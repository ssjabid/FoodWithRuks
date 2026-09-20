import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/shared/Photo";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { getPageContentSafe } from "@/lib/firebase/pageContent";
import { SITE_BYLINE, SOCIAL_LINKS } from "@/lib/site";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContentSafe();
  return {
    title: "About",
    description: `${content.aboutTitle} ${content.aboutSubtitle}. Food made with love, cooked simply, for your soul.`,
  };
}

export default async function AboutPage() {
  const content = await getPageContentSafe();
  const hasPhoto = Boolean(content.aboutPhoto);

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className={hasPhoto ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 items-start" : ""}>
        <div className="max-w-prose">
          <header className="mb-8">
            <p className="accent-italic text-lg mb-3">{SITE_BYLINE}</p>
            <h1 className="h-page text-[var(--color-text-primary)] mb-3">{content.aboutTitle}</h1>
            {content.aboutSubtitle && <p className="text-lg text-[var(--color-text-secondary)]">{content.aboutSubtitle}</p>}
          </header>

          {hasPhoto && (
            <Photo
              src={content.aboutPhoto}
              alt={content.aboutTitle}
              ratio="portrait"
              priority
              sizes="(min-width: 640px) 360px, 100vw"
              className="w-full max-w-xs mb-8 lg:hidden"
            />
          )}

          <div className="prose mb-10" dangerouslySetInnerHTML={{ __html: content.aboutBody }} />

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

        {hasPhoto && (
          <Photo
            src={content.aboutPhoto}
            alt={content.aboutTitle}
            ratio="portrait"
            priority
            sizes="360px"
            className="hidden lg:block w-full lg:sticky lg:top-20"
          />
        )}
      </div>
    </div>
  );
}
