import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";

export function InstagramBlock() {
  return (
    <section className="py-12 sm:py-16 border-y border-[var(--color-border)] bg-[var(--color-band)] text-[var(--color-on-band)]">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow mb-2 text-current opacity-75">On Instagram</p>
            <h2 className="h-section mb-2">Follow along for the everyday cooking</h2>
            <p className="max-w-[52ch] opacity-85">
              {TAGLINE_SECONDARY}. Reels, behind-the-scenes and whatever is bubbling on the stove today.
            </p>
          </div>
          <a
            href={SOCIAL_LINKS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-[var(--radius-sm)] border border-current text-sm font-semibold hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)] transition-colors"
          >
            <InstagramIcon className="w-4 h-4" />
            {SOCIAL_LINKS.instagram.handle}
          </a>
        </div>
      </div>
    </section>
  );
}
