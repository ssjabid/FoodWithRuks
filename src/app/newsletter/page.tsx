import type { Metadata } from "next";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
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
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <header className="mb-8">
          <p className="accent-italic text-lg mb-3">From our kitchen to yours</p>
          <h1 className="h-page text-[var(--color-text-primary)] mb-3">{TAGLINE_SECONDARY}, delivered</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Join the {SITE_NAME} newsletter for wholesome, easy-to-follow recipes and the stories behind them. Pure
            comfort, cooked simply, and shared with love.
          </p>
        </header>

        <div className="p-5 sm:p-6 rounded-[var(--radius-md)] bg-[var(--color-surface)] mb-10">
          <NewsletterForm source="newsletter-page" variant="stacked" />
          <p className="text-xs text-[var(--color-text-tertiary)] mt-3">No spam, ever. Unsubscribe anytime.</p>
        </div>

        <h2 className="h-section text-[var(--color-text-primary)] mb-4">What to expect</h2>
        <ul className="divide-y divide-[var(--color-border)]">
          {EXPECT.map((item) => (
            <li key={item.title} className="py-4">
              <p className="font-medium text-[var(--color-text-primary)]">{item.title}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
