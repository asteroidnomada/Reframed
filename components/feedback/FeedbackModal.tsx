"use client";

import { useEffect, useRef, useState } from "react";

type Category = "Bug" | "Idea" | "Praise" | "Other";

const CATEGORIES: Category[] = ["Bug", "Idea", "Praise", "Other"];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ open, onClose }: Props) {
  const [category, setCategory] = useState<Category>("Idea");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => taRef.current?.focus(), 80);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    setCategory("Idea");
    setRating(0);
    setHover(0);
    setMessage("");
    setError(null);
    setDone(false);
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    setError(null);
    if (message.trim().length < 5) {
      setError("Add a few more words so we can act on it.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating,
          message: message.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body?.error ?? "Failed to send");
      }
      setDone(true);
      setTimeout(onClose, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] overflow-hidden rounded-lg bg-bg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="px-7 py-12 text-center">
            <p className="text-xl font-semibold text-fg">Thanks!</p>
            <p className="mt-2 text-sm text-fg-muted">
              We read every note — this directly shapes what we build next.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 px-7 pb-4 pt-6">
              <div>
                <h2 id="feedback-title" className="text-lg font-semibold text-fg">
                  Send feedback
                </h2>
                <p className="mt-1 text-[13px] text-fg-muted">
                  Help shape Reframed during beta.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-base text-fg-muted hover:text-fg"
              >
                ×
              </button>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex flex-col gap-5 px-7 pt-5">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-fg">
                  What&apos;s this about?
                </span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const active = c === category;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        aria-pressed={active}
                        className={`inline-flex items-center justify-center rounded-full px-3.5 py-2 text-[13px] font-medium leading-none transition-colors ${
                          active
                            ? "bg-accent text-white"
                            : "border border-border bg-bg text-fg hover:border-border-strong"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-fg">
                  How&apos;s your experience so far?
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const filled = (hover || rating) >= n;
                    return (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        onClick={() => setRating(n === rating ? 0 : n)}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        className={`text-[22px] leading-none transition-colors ${
                          filled ? "text-fg" : "text-fg-faint hover:text-fg-muted"
                        }`}
                      >
                        {filled ? "★" : "☆"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="feedback-message" className="text-[13px] font-medium text-fg">
                  Tell us more
                </label>
                <textarea
                  id="feedback-message"
                  ref={taRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="What's working, what's not, what would you love?"
                  className="w-full resize-none rounded-md border border-border-strong bg-bg px-3.5 py-3 text-[13px] text-fg placeholder:text-fg-faint focus:border-fg focus:outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-[13px] text-red-600">
                  {error}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-7 py-5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-border bg-bg px-4 py-2.5 text-sm font-medium text-fg hover:border-border-strong"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send feedback"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
