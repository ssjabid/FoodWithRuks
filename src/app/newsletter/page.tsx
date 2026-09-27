import type { Metadata } from "next";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "New bakes by email",
  description: COPY.newsletterLine,
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <header className="mb-8">
          <h1 className="h-page text-[var(--color-text)] mb-3">New bakes by email</h1>
          {/* DRAFT: needs Ruks */}
          <p className="text-[1.125rem] text-[var(--color-text-2)]">{COPY.newsletterLine}</p>
        </header>

        <div className="p-5 sm:p-6 rounded-[var(--radius-lg)] bg-[var(--color-surface)]">
          <NewsletterForm source="newsletter-page" variant="stacked" />
          {/* DRAFT: needs Ruks */}
          <p className="text-xs text-[var(--color-text-3)] mt-3">{COPY.newsletterSmallPrint}</p>
        </div>
      </div>
    </div>
  );
}
