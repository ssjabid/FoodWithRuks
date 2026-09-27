import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `What ${SITE_NAME} stores, in plain English.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "27 September 2026";

/** Plain English, kept in step with what the code actually does. Update it when a form changes. */
export default function PrivacyPage() {
  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <h1 className="h-page text-[var(--color-text)] mb-3">Privacy</h1>
        <p className="text-[1.125rem] text-[var(--color-text-2)] mb-10">
          This is a personal recipe site. It keeps as little as it can, and this page says exactly what that is. Last updated {UPDATED}.
        </p>

        <div className="prose">
          <h2>New bakes by email</h2>
          <p>
            If you leave your email address, it is stored along with where on the site you signed up and the date. It is used only to send the
            occasional email about new bakes. Nothing is shared or sold. To be removed, use the link in any email or{" "}
            <Link href="/contact">say hello</Link> and ask.
          </p>

          <h2>Comments and ratings</h2>
          <p>
            A comment stores the name you give, the comment itself, your star rating and the date. To stop the same person flooding a recipe, a
            scrambled version of your internet address is kept alongside it. The scrambled version cannot be turned back into the address and is never
            shown. Comments are read by a person before they appear, and can be removed on request.
          </p>

          <h2>Messages</h2>
          <p>When you use the contact form, your name, email address, subject and message are stored so that Ruks can read and reply to them.</p>

          <h2>Things that stay in your browser</h2>
          <p>
            Saved recipes, your light or dark choice and the state of any recipe you are part-way through cooking live in your own browser and are
            never sent anywhere. Clearing your browser data clears them.
          </p>

          <h2>Counting and cookies</h2>
          <p>
            Each recipe keeps a simple total of how often it has been opened. The number is anonymous. The public site sets no cookies and runs no
            advertising or analytics trackers.
          </p>

          <h2>Instagram</h2>
          <p>
            Some recipes have a reel. It loads only after you press &ldquo;Watch it here&rdquo;. From that point Instagram&rsquo;s own privacy terms
            apply to what it loads.
          </p>

          <h2>Hosting</h2>
          <p>
            The site is hosted on Vercel and its data lives in Google Firebase. Both keep ordinary server logs (such as the pages requested and the
            time) for a short period to keep the service running.
          </p>

          <h2>Questions</h2>
          <p>
            Ask anything about this page through the <Link href="/contact">contact form</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
