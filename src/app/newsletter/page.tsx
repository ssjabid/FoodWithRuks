import type { Metadata } from "next";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { PageTransition } from "@/components/shared/PageTransition";
import { SITE_NAME, TAGLINE_SECONDARY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Newsletter",
  description: `${TAGLINE_SECONDARY}, delivered. New recipes and little-life stories from ${SITE_NAME}, straight to your inbox.`,
};

const EXPECT = [
  { title: "New recipes first", body: "Every new recipe lands in your inbox before anywhere else." },
  { title: "Little-life stories", body: "Days out, eating out, travel with a toddler and the odd craft." },
  { title: "No noise", body: "A short note when there is something worth sharing. Unsubscribe any time." },
];

export default function NewsletterPage() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="font-heading italic text-[var(--color-accent-text)] mb-2">From our kitchen to yours</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            {TAGLINE_SECONDARY}, delivered
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed mb-8">
            Join the {SITE_NAME} newsletter for wholesome, easy-to-follow recipes and the stories behind them.
            Pure comfort, cooked simply, and shared with love.
          </p>

          <div className="p-5 sm:p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)] shadow-[var(--shadow-sm)] mb-10">
            <NewsletterForm source="newsletter-page" variant="stacked" />
            <p className="text-xs text-[var(--color-text-tertiary)] mt-3">No spam, ever. Unsubscribe anytime.</p>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">What to expect</h2>
          <ul className="space-y-4">
            {EXPECT.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span
                  className="mt-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{item.title}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageTransition>
  );
}
