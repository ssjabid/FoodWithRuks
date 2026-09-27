"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDateLong } from "@/lib/facts";
import { COPY } from "@/lib/copy";
import type { PublicComment } from "@/types";

interface CommentsSectionProps {
  recipeSlug: string;
  comments: PublicComment[];
  rating: { average: number; count: number };
}

type Status = "idle" | "submitting" | "sent" | "error";

/** Minimum number of real ratings before an average is shown. */
export const MIN_RATINGS = 3;

/** Approved comments + "Made it? Tell Ruks." New comments wait for approval in /admin/comments. */
export function CommentsSection({ recipeSlug, comments, rating }: CommentsSectionProps) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(0);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (stars === 0) {
      setStatus("error");
      setMessage("Please choose a star rating.");
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeSlug, name, text, rating: stars, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
      setMessage(COPY.commentsThanks); // DRAFT: needs Ruks
      setName("");
      setText("");
      setStars(0);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const showAverage = rating.count >= MIN_RATINGS;

  return (
    <section id="comments" className="comments-section mt-16 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        {/* DRAFT: needs Ruks */}
        <h2 className="h-section text-[var(--color-text)]">{COPY.commentsInvite}</h2>
        {showAverage && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-text-2)]">
            <StarRating rating={Math.round(rating.average)} size="sm" />
            <span>
              {rating.average.toFixed(1)} from {rating.count} ratings
            </span>
          </p>
        )}
      </div>

      {comments.length > 0 && (
        <ul className="border-t border-[var(--color-line)] mb-10">
          {comments.map((c) => (
            <li key={c.id} className="py-5 border-b border-[var(--color-line)]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                <span className="font-medium text-[var(--color-text)]">{c.name}</span>
                <StarRating rating={c.rating} size="sm" />
                <span className="text-xs text-[var(--color-text-3)]">{formatDateLong(new Date(c.createdAt))}</span>
              </div>
              <p className="text-body text-[var(--color-text)] whitespace-pre-line">{c.text}</p>
            </li>
          ))}
        </ul>
      )}

      {status === "sent" ? (
        <p className="fade-in text-[var(--color-success)]" aria-live="polite">
          {message}
        </p>
      ) : (
        <form onSubmit={submit} className="max-w-lg space-y-5">
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

          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-[var(--color-text)]">Your rating</span>
            <StarRating rating={stars} interactive onRate={setStars} size="lg" />
          </div>

          <Input id="comment-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={60} required />
          <Textarea
            id="comment-text"
            label="Comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How did it go? Any tweaks?"
            maxLength={2000}
            required
          />

          {status === "error" && (
            <p className="text-sm text-[var(--color-error)]" aria-live="polite">
              {message}
            </p>
          )}

          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Sending…" : "Post comment"}
          </Button>
          {/* DRAFT: needs Ruks */}
          <p className="text-xs text-[var(--color-text-3)]">{COPY.commentsHint}</p>
        </form>
      )}
    </section>
  );
}
