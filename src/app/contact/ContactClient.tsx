"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/shared/PageTransition";
import { StaggerContainer, StaggerItem } from "@/components/shared/StaggerReveal";

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
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
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

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl">
          <StaggerContainer>
            <StaggerItem>
              <div className="mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                  Get in Touch
                </h1>
                <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
                  Have a question, recipe request, or just want to say hello? I&apos;d love to hear from you!
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              {status === "success" ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-center"
                >
                  <h3 className="font-semibold tracking-tight text-xl text-[var(--color-text-primary)] mb-2">Message Sent!</h3>
                  <p className="text-[var(--color-text-secondary)]">Thank you for reaching out. I&apos;ll get back to you soon.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setStatus("idle")}>
                    Send Another Message
                  </Button>
                </motion.div>
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
                  <Input id="email" label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
                  <Input id="subject" label="Subject" placeholder="What's this about?" value={form.subject} onChange={(e) => updateField("subject", e.target.value)} required />
                  <Textarea id="message" label="Message" placeholder="Your message..." value={form.message} onChange={(e) => updateField("message", e.target.value)} required />

                  {status === "error" && (
                    <p className="text-sm text-[var(--color-error)]">Something went wrong. Please try again.</p>
                  )}

                  <Button type="submit" disabled={status === "submitting"}>
                    {status === "submitting" ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  );
}
