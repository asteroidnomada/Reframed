"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Spinner } from "@/components/account/Invoice";
import {
  CREDIT_DEFAULT,
  CREDIT_MAX,
  CREDIT_MIN,
  CREDIT_STEP,
  PRICE_PER_CREDIT,
} from "@/lib/credits-config";
import { money } from "@/lib/credits";

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M3 8h10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function SRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className={bold ? "font-semibold text-fg" : "text-fg-muted"}>{value}</span>
    </div>
  );
}

export default function CreditsCheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [qty, setQty] = useState(CREDIT_DEFAULT);
  const [balance, setBalance] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setBalance(d.creditBalance ?? 0))
      .catch(() => {});
  }, []);

  const total = qty * PRICE_PER_CREDIT;

  const onBack = () => {
    if (step === 0) router.push("/account");
    else setStep((step - 1) as 0 | 1);
  };

  const onContinueToStripe = async () => {
    if (redirecting) return;
    setRedirecting(true);
    try {
      const res = await fetch("/api/billing/checkout/credits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ qty }),
      });
      const data = await res.json();
      sessionStorage.setItem("reframed:credits:pending_qty", String(qty));
      window.location.href = data.url;
    } catch {
      setRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav variant="secondary" onBack={onBack} />
      <main className="mx-auto w-full max-w-[680px] px-6 pt-10 pb-24 lg:pt-14">

        {step === 0 && (
          <div className="flex flex-col gap-0 rounded-2xl border border-border bg-bg p-10">
            <div className="flex flex-col gap-1 mb-8">
              <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.01em] text-fg">
                Add credits
              </h1>
              <p className="text-sm leading-5 text-fg-muted">
                Minimum of {CREDIT_MIN} credits must be purchased
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 rounded-xl border border-border bg-bg-subtle py-6 mb-6">
              <button
                type="button"
                onClick={() => setQty(Math.max(CREDIT_MIN, qty - CREDIT_STEP))}
                disabled={qty <= CREDIT_MIN}
                aria-label="Fewer credits"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg text-fg transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MinusIcon />
              </button>
              <span className="w-20 text-center text-5xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-fg">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(Math.min(CREDIT_MAX, qty + CREDIT_STEP))}
                disabled={qty >= CREDIT_MAX}
                aria-label="More credits"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg text-fg transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PlusIcon />
              </button>
            </div>

            <div className="flex flex-col items-center gap-1 mb-8">
              <span className="text-[17px] font-semibold text-fg">{money(total)}</span>
              <span className="text-sm text-fg-muted">
                New balance after purchase: {balance + qty} credits
              </span>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center rounded-lg bg-fg px-7 py-2.5 text-sm font-medium leading-5 text-bg transition-colors hover:opacity-80"
              >
                Continue to review order
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-0 rounded-2xl border border-border bg-bg p-10">
            <div className="flex flex-col gap-1 mb-8">
              <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.01em] text-fg">
                Review your order
              </h1>
              <p className="text-sm leading-5 text-fg-muted">
                Confirm the details before payment. You won&rsquo;t be charged until the next step.
              </p>
            </div>

            <div className="flex flex-col mb-4">
              <SRow label="Credits" value={`${qty} credits`} bold />
              <SRow label="Price per credit" value={money(PRICE_PER_CREDIT)} />
              <SRow label="Subtotal" value={money(total)} />
              <SRow label="Tax" value={money(0)} />
            </div>

            <div className="flex items-center justify-between border-t border-fg pt-4 mb-8">
              <span className="text-[15px] font-semibold text-fg">Total</span>
              <span className="text-[15px] font-semibold tabular-nums text-fg">{money(total)}</span>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center rounded-lg bg-fg px-7 py-2.5 text-sm font-medium leading-5 text-bg transition-colors hover:opacity-80"
              >
                Continue to payment
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-0 rounded-2xl border border-border bg-bg p-10">
            <div className="flex flex-col gap-1 mb-8">
              <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.01em] text-fg">
                Payment
              </h1>
              <p className="text-sm leading-5 text-fg-muted">
                You&rsquo;ll be taken to Stripe to complete your payment securely.
              </p>
            </div>

            <div className="flex flex-col mb-4">
              <SRow label={`Render credits × ${qty}`} value={money(total)} />
              <SRow label="Tax" value={money(0)} />
            </div>

            <div className="flex items-center justify-between border-t border-fg pt-4 mb-8">
              <span className="text-[15px] font-semibold text-fg">Total due</span>
              <span className="text-[15px] font-semibold tabular-nums text-fg">{money(total)}</span>
            </div>

            <button
              type="button"
              onClick={onContinueToStripe}
              disabled={redirecting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-fg px-5 py-3 text-sm font-medium leading-5 text-bg transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {redirecting ? (
                <>
                  <Spinner />
                  <span>Redirecting…</span>
                </>
              ) : (
                <span>Continue to Stripe →</span>
              )}
            </button>
            <p className="mt-4 text-xs leading-[18px] text-fg-muted text-center">
              You&rsquo;ll be redirected to Stripe&rsquo;s secure checkout. Credits are added immediately after payment.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
