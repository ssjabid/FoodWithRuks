"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { COPY } from "@/lib/copy";

/** "Say hello." The subject can be pre-filled from a link (the search empty state does this). */
export function ContactClient() {
  const params = useSearchParams();
  const [form, setForm] = useState(() => ({
    name: "",
    email: "",
    subject: (params.get("subject") ?? "").slice(0, 120),
    message: "",
    honeypot: "",
  }));
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, subject: form.subject, message: form.message, website: form.honeypot }),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "", honeypot: "" });
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setServerError(data.error || "");
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-prose">
        <header className="mb-8">
          {/* DRAFT: needs Ruks */}
          <h1 className="h-page text-[var(--color-text)] mb-3">{COPY.contactTitle}</h1>
          <p className="text-[1.125rem] text-[var(--color-text-2)]">{COPY.contactBody}</p>
        </header>

        {status === "success" ? (
          <div className="fade-in p-6 rounded-[var(--radius-md)] bg-[var(--color-surface)]">
            {/* DRAFT: needs Ruks */}
            <h2 className="h-card text-[var(--color-text)] mb-2">Sent</h2>
            <p className="text-[var(--color-text-2)] mb-4">{COPY.contactThanks}</p>
            <Button variant="outline" onClick={() => setStatus("idle")}>
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(e) => updateField("honeypot", e.target.value)} />
            </div>

            <Input id="name" label="Name" placeholder="Your name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            <Input id="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
            <Input id="subject" label="Subject" placeholder="What is it about?" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} maxLength={120} required />
            <Textarea id="message" label="Message" placeholder="Say hello" value={form.message} onChange={(e) => updateField("message", e.target.value)} required />

            {status === "error" && <p className="text-sm text-[var(--color-error)]">{serverError || "Something went wrong. Please try again."}</p>}

            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Send"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
