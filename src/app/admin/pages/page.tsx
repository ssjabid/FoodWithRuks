"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import { rawContentUrl } from "@/lib/site";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

const fieldClass =
  "w-full px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]";

interface Form {
  heroIntro: string;
  footerBlurb: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutBody: string;
  aboutPhoto: string;
}

const EMPTY: Form = { heroIntro: "", footerBlurb: "", aboutTitle: "", aboutSubtitle: "", aboutBody: "", aboutPhoto: "" };

/** Photos inserted in the editor show the raw GitHub copy; the site path is what gets stored. */
const RAW_PREFIX = rawContentUrl("public");

export default function AdminPagesPage() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch("/api/admin/pages");
        if (res.ok) {
          const d = (await res.json()) as Partial<Form>;
          setForm({
            heroIntro: d.heroIntro ?? "",
            footerBlurb: d.footerBlurb ?? "",
            aboutTitle: d.aboutTitle ?? "",
            aboutSubtitle: d.aboutSubtitle ?? "",
            aboutBody: d.aboutBody ?? "",
            aboutPhoto: d.aboutPhoto ?? "",
          });
        }
      } catch {
        /* keep empty */
      }
      setLoaded(true);
    }
    load();
  }, []);

  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/admin/pages", {
        method: "PUT",
        body: JSON.stringify({ ...form, aboutBody: form.aboutBody.split(RAW_PREFIX).join("") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessage({ type: "error", text: data.error || "Could not save." });
      else setMessage({ type: "success", text: "Saved. The site updates within a minute." });
    } catch {
      setMessage({ type: "error", text: "Could not save." });
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Pages</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">The words on the home page, the footer and the About page.</p>
      </div>

      {!loaded ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">Loading…</p>
      ) : (
        <form onSubmit={save} className="space-y-10 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
          <fieldset className="space-y-5">
            <legend className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">Home page</legend>
            <div className="space-y-1.5">
              <label htmlFor="heroIntro" className="block text-sm font-medium text-[var(--color-text-primary)]">
                Intro under the headline
              </label>
              <textarea id="heroIntro" value={form.heroIntro} onChange={(e) => set("heroIntro")(e.target.value)} maxLength={300} rows={2} className={`${fieldClass} py-2.5`} />
              <p className="text-xs text-[var(--color-text-tertiary)]">One or two short sentences. {form.heroIntro.length}/300</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="footerBlurb" className="block text-sm font-medium text-[var(--color-text-primary)]">
                Footer blurb
              </label>
              <textarea id="footerBlurb" value={form.footerBlurb} onChange={(e) => set("footerBlurb")(e.target.value)} maxLength={300} rows={2} className={`${fieldClass} py-2.5`} />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">About page</legend>
            <div className="space-y-1.5">
              <label htmlFor="aboutTitle" className="block text-sm font-medium text-[var(--color-text-primary)]">
                Title
              </label>
              <input id="aboutTitle" type="text" value={form.aboutTitle} onChange={(e) => set("aboutTitle")(e.target.value)} maxLength={120} className={`${fieldClass} h-11`} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="aboutSubtitle" className="block text-sm font-medium text-[var(--color-text-primary)]">
                Subtitle
              </label>
              <input id="aboutSubtitle" type="text" value={form.aboutSubtitle} onChange={(e) => set("aboutSubtitle")(e.target.value)} maxLength={200} className={`${fieldClass} h-11`} />
            </div>
            <ImageUpload label="Your photo" value={form.aboutPhoto} onChange={set("aboutPhoto")} folder="misc" hint="A portrait photo works best. Shown beside the About text." />
            <RichTextEditor label="Your story" value={form.aboutBody} onChange={set("aboutBody")} folder="misc" placeholder="Tell readers who you are and what this blog is about…" />
          </fieldset>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`} aria-live="polite">
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save pages"}
          </button>
        </form>
      )}
    </div>
  );
}
