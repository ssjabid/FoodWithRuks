import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { COPY } from "@/lib/copy";
import { SOCIAL_LINKS } from "@/lib/site";

/** Instagram as a plain link, and the newsletter as one line and a field. */
export function EmailLine() {
  return (
    <section className="py-10 sm:py-14 newsletter-section grid gap-8 md:grid-cols-2 md:gap-14 md:items-start">
      <div>
        <h2 className="h-section text-[var(--color-text)]">Between bakes</h2>
        <a
          href={SOCIAL_LINKS.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-flex items-center gap-2 mt-3 text-[var(--color-text-2)] hover:text-[var(--color-cheek)]"
        >
          <InstagramIcon className="w-4 h-4" />
          {SOCIAL_LINKS.instagram.handle} on Instagram
        </a>
      </div>
      <div className="max-w-md">
        {/* DRAFT: needs Ruks */}
        <p className="text-[var(--color-text-2)] mb-3">{COPY.newsletterLine}</p>
        <NewsletterForm source="home" variant="inline" />
      </div>
    </section>
  );
}
