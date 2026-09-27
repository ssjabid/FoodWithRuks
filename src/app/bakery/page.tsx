import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { Mark } from "@/components/brand/Mark";
import { getSiteSettingsSafe } from "@/lib/firebase/siteSettings";
import { COPY } from "@/lib/copy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The someday bakery",
  robots: { index: false, follow: false },
};

/** Hidden until "Show the someday bakery page" is switched on in /admin/settings. A waitlist, nothing more. */
export default async function BakeryPage() {
  const settings = await getSiteSettingsSafe();
  if (!settings.showBakery) notFound();

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <Mark state="asleep" size={44} className="mb-6" />
        {/* DRAFT: needs Ruks */}
        <h1 className="h-page text-[var(--color-text)] mb-3">{COPY.bakeryTitle}</h1>
        <p className="text-[1.125rem] text-[var(--color-text-2)] mb-8">{COPY.bakeryBody}</p>
        <div className="p-5 sm:p-6 rounded-[var(--radius-lg)] bg-[var(--color-blush)] text-[var(--color-on-blush)]">
          <NewsletterForm source="bakery" variant="stacked" buttonLabel={COPY.bakeryButton} />
        </div>
      </div>
    </div>
  );
}
