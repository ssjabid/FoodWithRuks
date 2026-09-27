"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import { rawContentUrl } from "@/lib/site";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

const fieldClass =
  "w-full px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)]";
const labelClass = "block text-sm font-medium text-[var(--color-text-primary)]";
const hintClass = "text-xs text-[var(--color-text-tertiary)]";

const CURRENTLY_MAX = 60;

interface CurrentlyForm {
  baking: string;
  craving: string;
  lastWalk: string;
  latestParcel: string;
}

interface Form {
  heroIntro: string;
  footerBlurb: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutBody: string;
  aboutPhoto: string;
  aboutPhotoAlt: string;
  currently: CurrentlyForm;
}

const EMPTY_CURRENTLY: CurrentlyForm = { baking: "", craving: "", lastWalk: "", latestParcel: "" };
const EMPTY: Form = { heroIntro: "", footerBlurb: "", aboutTitle: "", aboutSubtitle: "", aboutBody: "", aboutPhoto: "", aboutPhotoAlt: "", currently: EMPTY_CURRENTLY };

const CURRENTLY_ROWS: Array<{ key: keyof CurrentlyForm; label: string; placeholder: string }> = [
  { key: "baking", label: "Baking", placeholder: "brown butter cookies, again" },
  { key: "craving", label: "Craving", placeholder: "a proper custard tart" },
  { key: "lastWalk", label: "Last walk", placeholder: "the reservoir loop, muddy" },
  { key: "latestParcel", label: "Latest parcel", placeholder: "a tin of brownies to Leeds" },
];

/** Photos inserted in the editor show the raw GitHub copy; the site path is what gets stored. */
const RAW_PREFIX = rawContentUrl("public");

function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

export default function AdminPagesPage() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [currentlyUpdatedAt, setCurrentlyUpdatedAt] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch("/api/admin/pages");
        if (res.ok) {
          const d = (await res.json()) as Partial<Omit<Form, "currently">> & { currently?: Partial<CurrentlyForm> & { updatedAt?: string } };
          setForm({
            heroIntro: d.heroIntro ?? "",
            footerBlurb: d.footerBlurb ?? "",
            aboutTitle: d.aboutTitle ?? "",
            aboutSubtitle: d.aboutSubtitle ?? "",
            aboutBody: d.aboutBody ?? "",
            aboutPhoto: d.aboutPhoto ?? "",
            aboutPhotoAlt: d.aboutPhotoAlt ?? "",
            currently: {
              baking: d.currently?.baking ?? "",
              craving: d.currently?.craving ?? "",
              lastWalk: d.currently?.lastWalk ?? "",
              latestParcel: d.currently?.latestParcel ?? "",
            },
          });
          setCurrentlyUpdatedAt(d.currently?.updatedAt);
        }
      } catch {
        /* keep empty */
      }
      setLoaded(true);
    }
    load();
  }, []);

  const set = (key: Exclude<keyof Form, "currently">) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const setCurrently = (key: keyof CurrentlyForm) => (value: string) =>
    setForm((f) => ({ ...f, currently: { ...f.currently, [key]: value.slice(0, CURRENTLY_MAX) } }));

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
      else {
        setMessage({ type: "success", text: "Saved. The site updates within a minute." });
        setCurrentlyUpdatedAt(new Date().toISOString());
      }
    } catch {
      setMessage({ type: "error", text: "Could not save." });
    }
    setSaving(false);
  }

  const stale = daysSince(currentlyUpdatedAt);
  const currentlyEmpty = Object.values(form.currently).every((v) => !v);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Pages</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">The Currently card, the words on the front page and the footer, and the About page.</p>
      </div>

      {!loaded ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">Loading…</p>
      ) : (
        <form onSubmit={save} className="space-y-10 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
          <fieldset className="space-y-5">
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Currently</legend>
            <p className={hintClass}>
              Four short lines on the front page. Empty rows stay hidden, and the whole card hides when all four are empty.
              {stale !== null && stale >= 30 && !currentlyEmpty && (
                <span className="block mt-1 text-[var(--color-warning)]">Last updated {stale} days ago. Worth a fresh line?</span>
              )}
              {stale !== null && stale < 30 && <span className="block mt-1">Last updated {stale === 0 ? "today" : `${stale} day${stale === 1 ? "" : "s"} ago`}.</span>}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {CURRENTLY_ROWS.map((row) => (
                <div key={row.key} className="space-y-1.5">
                  <label htmlFor={`currently-${row.key}`} className={labelClass}>
                    {row.label}
                  </label>
                  <input
                    id={`currently-${row.key}`}
                    type="text"
                    value={form.currently[row.key]}
                    onChange={(e) => setCurrently(row.key)(e.target.value)}
                    maxLength={CURRENTLY_MAX}
                    placeholder={row.placeholder}
                    className={`${fieldClass} h-11`}
                  />
                  <p className={hintClass}>
                    {form.currently[row.key].length}/{CURRENTLY_MAX}
                  </p>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Front page and footer</legend>
            <div className="space-y-1.5">
              <label htmlFor="heroIntro" className={labelClass}>
                A line under the bake (optional)
              </label>
              <textarea id="heroIntro" value={form.heroIntro} onChange={(e) => set("heroIntro")(e.target.value)} maxLength={300} rows={2} className={`${fieldClass} py-2.5`} />
              <p className={hintClass}>One or two short sentences. {form.heroIntro.length}/300</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="footerBlurb" className={labelClass}>
                Footer line
              </label>
              <textarea id="footerBlurb" value={form.footerBlurb} onChange={(e) => set("footerBlurb")(e.target.value)} maxLength={300} rows={2} className={`${fieldClass} py-2.5`} />
              <p className={hintClass}>{form.footerBlurb.length}/300</p>
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">About page</legend>
            <div className="space-y-1.5">
              <label htmlFor="aboutTitle" className={labelClass}>
                Title
              </label>
              <input id="aboutTitle" type="text" value={form.aboutTitle} onChange={(e) => set("aboutTitle")(e.target.value)} maxLength={120} className={`${fieldClass} h-11`} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="aboutSubtitle" className={labelClass}>
                A line under the title
              </label>
              <input id="aboutSubtitle" type="text" value={form.aboutSubtitle} onChange={(e) => set("aboutSubtitle")(e.target.value)} maxLength={200} className={`${fieldClass} h-11`} />
            </div>
            <ImageUpload label="Your photo" value={form.aboutPhoto} onChange={set("aboutPhoto")} folder="misc" hint="A portrait photo works best. Until there is one, the two little bakes keep the seat warm." />
            {form.aboutPhoto && (
              <div className="space-y-1.5">
                <label htmlFor="aboutPhotoAlt" className={labelClass}>
                  Describe the photo
                </label>
                <input
                  id="aboutPhotoAlt"
                  type="text"
                  value={form.aboutPhotoAlt}
                  onChange={(e) => set("aboutPhotoAlt")(e.target.value)}
                  maxLength={160}
                  placeholder="Ruks in the kitchen, holding a tray of cookies"
                  className={`${fieldClass} h-11`}
                />
                <p className={hintClass}>For people who use a screen reader. One plain sentence. {form.aboutPhotoAlt.length}/160</p>
              </div>
            )}
            <RichTextEditor label="Your words" value={form.aboutBody} onChange={set("aboutBody")} folder="misc" placeholder="Who you are, what you bake, why this site exists. As long or short as you like." />
          </fieldset>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`} aria-live="polite">
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-12 px-6 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save pages"}
          </button>
        </form>
      )}
    </div>
  );
}
