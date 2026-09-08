import { NewsletterForm } from "@/components/shared/NewsletterForm";

export function NewsletterSection() {
  return (
    <section className="py-12 sm:py-16 newsletter-section">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="eyebrow mb-2">Newsletter</p>
          <h2 className="h-section mb-2">Stay connected</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            New recipes and little-life stories, delivered to your inbox. No spam, ever.
          </p>
          <NewsletterForm source="home" variant="inline" />
        </div>
      </div>
    </section>
  );
}
