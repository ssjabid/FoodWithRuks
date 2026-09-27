import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactClient } from "./ContactClient";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Say hello",
  description: COPY.contactBody,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 min-h-[50vh]">
          <h1 className="h-page text-[var(--color-text)]">{COPY.contactTitle}</h1>
        </div>
      }
    >
      <ContactClient />
    </Suspense>
  );
}
