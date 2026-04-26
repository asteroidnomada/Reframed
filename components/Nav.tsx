"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const FREE_MONTHLY_CREDITS = 3;

type Variant = "primary" | "secondary";

type Props = {
  variant?: Variant;
  backHref?: string;
  onClose?: () => void;
};

export function Nav({ variant = "primary", backHref, onClose }: Props) {
  if (variant === "secondary") {
    return (
      <nav className="border-b border-border bg-bg">
        <div className="relative flex w-full items-center justify-between px-6 pt-2 pb-[9px] lg:px-20">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 py-3 text-sm leading-5 text-fg-muted hover:text-fg whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11.667 7H2.333" />
                <path d="M6.417 11.083 2.333 7l4.084-4.083" />
              </svg>
              Back
            </Link>
          ) : (
            <span aria-hidden className="py-3 text-sm leading-5 invisible">Back</span>
          )}
          <Link
            href="/"
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
  const used = 0;

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
  }, []);

  const initial = (initialSource?.[0] ?? "M").toUpperCase();

  return (
    <nav className="border-b border-border bg-bg">
      <div className="flex w-full items-center justify-between px-6 pt-3 pb-[13px] lg:px-20">
        <Link
          href="/"
          className="text-lg font-semibold leading-7 tracking-[-0.5px] text-fg"
        >
          Reframed
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden lg:inline-flex items-center rounded-md border border-border bg-bg px-3 py-1 text-sm leading-5 text-fg-muted">
            {used}/{FREE_MONTHLY_CREDITS} credits
          </span>
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
