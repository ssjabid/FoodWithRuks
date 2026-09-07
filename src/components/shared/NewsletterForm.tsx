"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SubscriberSource } from "@/types";

type Status = "idle" | "submitting" | "success" | "error";

interface NewsletterFormProps {
  source: SubscriberSource;
  /** inline = pill with button inside (home), stacked = full width rows (newsletter page), compact = small footer row */
  variant?: "inline" | "stacked" | "compact";
  className?: string;
}

const SUCCESS_COPY = "You're in. Warmth in every bite, straight to your inbox.";

export function NewsletterForm({ source, variant = "inline", className }: NewsletterFormProps) {
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
      setMessage(SUCCESS_COPY);
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
      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn(
              "text-sm",
              status === "success" ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
            )}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

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
            disabled={status === "submitting"}
            className="flex-1 min-w-0 h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="h-9 w-9 shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center hover:bg-[var(--color-primary-hover)] btn-press disabled:opacity-60"
            aria-label="Subscribe"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
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
        <label htmlFor={`newsletter-${source}`} className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
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
            disabled={status === "submitting"}
            className="flex-1 h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:bg-[var(--color-primary-hover)] btn-press disabled:opacity-60"
          >
            {status === "submitting" ? "Joining…" : "Join the newsletter"}
          </button>
        </div>
        {statusLine}
      </form>
    );
  }

  // inline (default) — rounded pill with the button inside
  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      {honeypot}
      <div className="flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-elevated)] p-1 focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] transition-all">
        <input
          type="email"
          required
          placeholder="Your email address"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="flex-1 min-w-0 h-9 sm:h-10 pl-4 pr-2 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="h-9 sm:h-10 px-5 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60 shrink-0"
        >
          {status === "submitting" ? "…" : "Subscribe"}
        </button>
      </div>
      {statusLine}
    </form>
  );
}
