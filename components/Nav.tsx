"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const FREE_MONTHLY_CREDITS = 3;

type Variant = "primary" | "secondary";

type Props = {
  variant?: Variant;
  backHref?: string;
  onBack?: () => void;
  onClose?: () => void;
};

export function Nav({ variant = "primary", backHref, onBack, onClose }: Props) {
  if (variant === "secondary") {
    const backArrow = (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11.667 7H2.333" />
        <path d="M6.417 11.083 2.333 7l4.084-4.083" />
      </svg>
    );
    return (
      <nav className="sticky top-0 z-30 border-b border-border bg-bg">
        <div className="relative flex w-full items-center justify-between px-6 pt-2 pb-[9px] lg:px-20">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 py-3 text-sm leading-5 text-fg-muted hover:text-fg whitespace-nowrap"
            >
              {backArrow}
              Back
            </button>
          ) : backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 py-3 text-sm leading-5 text-fg-muted hover:text-fg whitespace-nowrap"
            >
              {backArrow}
              Back
            </Link>
          ) : (
            <span aria-hidden className="py-3 text-sm leading-5 invisible">Back</span>
          )}
          <Link
            href="/gallery"
            className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold leading-7 tracking-[-0.5px] text-fg"
          >
            Reframed
          </Link>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="py-1 pl-3 text-fg hover:text-fg-muted"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          ) : (
            <span aria-hidden className="py-1 pl-3 invisible">
              <span className="block size-6" />
            </span>
          )}
        </div>
      </nav>
    );
  }

  return <PrimaryNav />;
}

function PrimaryNav() {
  const [initialSource, setInitialSource] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [planTier, setPlanTier] = useState<string>("free");
  const [billingState, setBillingState] = useState<string>("active");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const meta = (u?.user_metadata ?? {}) as Record<string, unknown>;
      const fullName =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        null;
      const firstName = fullName?.trim().split(/\s+/)[0] ?? null;
      setInitialSource(firstName || u?.email || null);
    });
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        setUsed(d.generationCountThisMonth ?? 0);
        setCreditBalance(d.creditBalance ?? 0);
        setPlanTier(d.planTier ?? "free");
        setBillingState(d.billingState ?? "active");
      })
      .catch(() => {});
  }, []);

  const initial = (initialSource?.[0] ?? "M").toUpperCase();
  const isPro = planTier === "pro" && billingState === "active";
  const remainingFree = Math.max(0, FREE_MONTHLY_CREDITS - used);
  const totalCredits = remainingFree + (creditBalance ?? 0);
  const outOfCredits = !isPro && totalCredits === 0;

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-bg">
      <div className="flex w-full items-center justify-between px-6 pt-3 pb-[13px] lg:px-20">
        <Link
          href="/gallery"
          className="text-lg font-semibold leading-7 tracking-[-0.5px] text-fg"
        >
          Reframed
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/account"
            className="hidden lg:inline-flex items-center gap-[10px] rounded-md border border-border bg-bg px-3 py-1 text-sm leading-5 text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            {isPro
              ? "Unlimited credits"
              : `${totalCredits} credit${totalCredits === 1 ? "" : "s"}`}
            {outOfCredits && (
              <span
                className="inline-flex items-center rounded px-1 py-px text-xs leading-4 font-medium"
                style={{ background: "#acccff", color: "#0062ff" }}
              >
                Upgrade
              </span>
            )}
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-md bg-accent px-3 py-1 text-sm leading-5 text-white hover:bg-accent-hover"
          >
            New upload
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="inline-flex items-center justify-center rounded-md border border-border bg-bg px-2 py-1 text-sm leading-5 text-fg-muted hover:text-fg"
          >
            {initial}
          </Link>
        </div>
      </div>
    </nav>
  );
}
