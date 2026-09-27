"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/copy";
import type { SubscriberSource } from "@/types";

type Status = "idle" | "submitting" | "success" | "error";

interface NewsletterFormProps {
  source: SubscriberSource;
  /** inline = round pill with the button inside; stacked = full-width rows; compact = small row */
  variant?: "inline" | "stacked" | "compact";
  className?: string;
  buttonLabel?: string;
}

export function NewsletterForm({ source, variant = "inline", className, buttonLabel = "Send" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage(COPY.newsletterThanks); // DRAFT: needs Ruks
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const honeypot = (
    <input
      type="text"
      name="website"
      value={website}
      onChange={(e) => setWebsite(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] w-px h-px opacity-0"
    />
  );

  const statusLine = (
    <div aria-live="polite" className="min-h-[1.25rem] mt-2">
      {message && (
        <p key={status} className={cn("fade-in text-sm", status === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
          {message}
        </p>
      )}
    </div>
  );

  const busy = status === "submitting";
  const button = "rounded-full bg-[var(--color-cheek)] text-[var(--color-on-cheek)] font-semibold hover:bg-[var(--color-cheek-hover)] transition-colors disabled:opacity-60";

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={cn("relative", className)}>
        {honeypot}
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Your email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className="field flex-1 min-w-0 h-11 px-4 rounded-full text-base sm:text-sm"
          />
          <button type="submit" disabled={busy} className={cn(button, "h-11 px-4 text-sm shrink-0")}>
            {busy ? "…" : buttonLabel}
          </button>
        </div>
        {statusLine}
      </form>
    );
  }

  if (variant === "stacked") {
    return (
      <form onSubmit={handleSubmit} className={cn("relative", className)}>
        {honeypot}
        <label htmlFor={`newsletter-${source}`} className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          Email address
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id={`newsletter-${source}`}
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className="field flex-1 h-12 px-4 rounded-full text-base"
          />
          <button type="submit" disabled={busy} className={cn(button, "h-12 px-6 text-base")}>
            {busy ? "Sending…" : buttonLabel}
          </button>
        </div>
        {statusLine}
      </form>
    );
  }

  // inline (default): a round pill with the button inside
  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      {honeypot}
      <div className="field flex items-center rounded-full p-1">
        <input
          type="email"
          required
          placeholder="Your email"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          className="field-bare flex-1 min-w-0 h-10 pl-4 pr-2 text-base"
        />
        <button type="submit" disabled={busy} className={cn(button, "h-10 px-5 text-sm shrink-0")}>
          {busy ? "…" : buttonLabel}
        </button>
      </div>
      {statusLine}
    </form>
  );
}
