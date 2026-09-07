"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <section className="py-16 sm:py-20 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerContainer>
          <StaggerItem>
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                Stay Connected
              </h2>
              <p className="text-[var(--color-text-secondary)] text-base sm:text-lg mb-6">
                Get new recipes delivered straight to your inbox.
              </p>

              <form onSubmit={handleSubmit} className="relative">
                <div
                  className="flex items-center h-12 sm:h-14 rounded-full border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden transition-shadow duration-200"
                  style={{ boxShadow: focused ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent)" : "none" }}
                >
                  <input
                    ref={inputRef}
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                    className="flex-1 h-full px-5 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
                  />
                  <AnimatePresence mode="wait">
                    {status === "success" ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center gap-1.5 px-5 h-full text-sm font-semibold text-[var(--color-success)] whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Subscribed!
                      </motion.div>
                    ) : (
                      <motion.button
                        key="submit"
                        type="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-9 sm:h-10 mx-1.5 px-5 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-colors whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Subscribe</span>
                        <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              <p className="text-xs text-[var(--color-text-tertiary)] mt-3">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
