import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/shared/Photo";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { Mark } from "@/components/brand/Mark";
import { Note } from "@/components/brand/Note";
import { getPageContentSafe } from "@/lib/firebase/pageContent";
import { SOCIAL_LINKS } from "@/lib/site";
import { COPY } from "@/lib/copy";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContentSafe();
  return {
    title: "About",
    description: content.aboutSubtitle || "Who Ruks is, and what this site is for.",
    alternates: { canonical: "/about" },
  };
}

/** Her page: the words she wrote in /admin/pages, her photo (the pair keeps the seat warm until then), and her sign-off. */
export default async function AboutPage() {
  const content = await getPageContentSafe();
  const hasPhoto = Boolean(content.aboutPhoto);

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 items-start">
        <div className="max-w-prose">
          <h1 className="h-page text-[var(--color-text)]">{content.aboutTitle}</h1>
          {content.aboutSubtitle && <p className="mt-3 text-[1.125rem] text-[var(--color-text-2)]">{content.aboutSubtitle}</p>}

          {/* DRAFT: needs Ruks (default body lives in src/lib/firebase/pageContent.ts) */}
          <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: content.aboutBody }} />

          {/* DRAFT: needs Ruks */}
          <Note size="lg" className="mt-8" tilt>
            {COPY.aboutSignOff}
          </Note>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <ButtonLink href="/bakes">All the bakes</ButtonLink>
            <Link href="/contact" className="link text-[var(--color-text-2)] hover:text-[var(--color-cheek)]">
              Say hello
            </Link>
          </div>

          <a
            href={SOCIAL_LINKS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex items-center gap-2 mt-10 text-[var(--color-text-2)] hover:text-[var(--color-cheek)]"
          >
            <InstagramIcon className="w-5 h-5" />
            {SOCIAL_LINKS.instagram.handle} on Instagram
          </a>
        </div>

        <div className="order-first lg:order-none lg:sticky lg:top-20">
          {hasPhoto ? (
            <Photo
              src={content.aboutPhoto}
              alt={content.aboutPhotoAlt || content.aboutTitle}
              ratio="portrait"
              priority
              sizes="(min-width: 1024px) 420px, 320px"
              className="w-full max-w-[320px] lg:max-w-none"
            />
          ) : (
            <div className="aspect-[4/5] w-full max-w-[240px] lg:max-w-none rounded-[var(--radius-lg)] bg-[var(--color-blush)] flex items-center justify-center" aria-hidden="true">
              <Mark variant="pair" size={120} className="w-[45%] h-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
