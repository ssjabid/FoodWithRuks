"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContactClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", honeypot: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, subject: form.subject, message: form.message }),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "", honeypot: "" });
      } else {
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
          <p className="eyebrow mb-2">Contact</p>
          <h1 className="h-page text-[var(--color-text-primary)] mb-3">Get in touch</h1>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Have a question, a recipe request, or just want to say hello? I&apos;d love to hear from you.
          </p>
        </header>

        {status === "success" ? (
          <div className="fade-in p-6 rounded-[var(--radius-md)] bg-[var(--color-surface)]">
            <h3 className="h-card text-[var(--color-text-primary)] mb-2">Message sent</h3>
            <p className="text-[var(--color-text-secondary)] mb-4">Thank you for reaching out. I&apos;ll get back to you soon.</p>
            <Button variant="outline" onClick={() => setStatus("idle")}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.honeypot}
                onChange={(e) => updateField("honeypot", e.target.value)}
              />
            </div>

            <Input id="name" label="Name" placeholder="Your name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            <Input id="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
            <Input id="subject" label="Subject" placeholder="What's this about?" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} required />
            <Textarea id="message" label="Message" placeholder="Your message…" value={form.message} onChange={(e) => updateField("message", e.target.value)} required />

            {status === "error" && <p className="text-sm text-[var(--color-error)]">Something went wrong. Please try again.</p>}

            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
