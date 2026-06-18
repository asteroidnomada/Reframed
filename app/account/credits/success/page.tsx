"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Spinner } from "@/components/account/Invoice";
import { money } from "@/lib/credits";
import { PRICE_PER_CREDIT } from "@/lib/credits-config";
import type { Purchase } from "@/lib/credits";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 5;

export default function CreditSuccessPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [qty, setQty] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<Purchase | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    const pendingQty = sessionStorage.getItem("reframed:credits:pending_qty");
    if (pendingQty) setQty(parseInt(pendingQty, 10));

    const poll = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        const latestCredit = (data.purchases as Purchase[] ?? []).find(
          (p) => p.kind === "credits"
        );
        if (latestCredit) setReceipt(latestCredit);
      } catch {}
      attempts.current += 1;
      if (attempts.current < POLL_MAX_ATTEMPTS) {
        setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        setReady(true);
      }
    };

    poll();

    return () => {
      sessionStorage.removeItem("reframed:credits:pending_qty");
    };
  }, []);

  // Show ready once we have a receipt or exhausted polls
  useEffect(() => {
    if (receipt) setReady(true);
  }, [receipt]);

  const total = qty !== null ? money(qty * PRICE_PER_CREDIT) : null;
  const creditsAdded = qty ?? receipt?.credits;

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav />
      <main className="mx-auto w-full max-w-[680px] px-6 pt-10 pb-24 lg:pt-14">
        {!ready ? (
          <div className="flex flex-col items-center gap-4 pt-20 text-center">
            <Spinner />
            <p className="text-sm text-fg-muted">Confirming your payment…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-bg px-10 py-12 text-center">
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "#F3FAF5", color: "#2F7A4C" }}
              aria-hidden
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4 10-11" />
              </svg>
            </span>

            <div className="flex flex-col gap-2">
              <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.01em] text-fg">
                {creditsAdded != null ? `${creditsAdded} credits added` : "Credits added"}
              </h1>
              <p className="max-w-[440px] text-sm leading-5 text-fg-muted">
                {total ? `Payment of ${total} complete. ` : ""}
                Your new balance is ready to use, and a receipt has been added to your billing history.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {receipt?.hostedInvoiceUrl ? (
                <a
                  href={receipt.hostedInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-fg px-5 py-2.5 text-sm font-medium leading-5 text-bg transition-colors hover:opacity-80"
                >
                  View receipt
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center rounded-lg bg-fg px-5 py-2.5 text-sm font-medium leading-5 text-bg opacity-40 cursor-not-allowed"
                >
                  View receipt
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-bg px-5 py-2.5 text-sm font-medium leading-5 text-fg transition-colors hover:border-border-strong"
              >
                Back to account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
