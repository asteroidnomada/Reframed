"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { createClient } from "@/lib/supabase/client";
import { type MeData } from "@/lib/credits";

const FREE_MONTHLY_LIMIT = 3;

function GraceBanner({ endsAt, onManage }: { endsAt: string; onManage: () => void }) {
  const date = new Date(endsAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm leading-5 text-red-700">
        Payment failed — update your card by <strong>{date}</strong> to keep Pro access.
      </p>
      <button
        type="button"
        onClick={onManage}
        className="shrink-0 text-sm font-medium text-red-700 underline-offset-2 hover:underline"
      >
        Manage subscription
      </button>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [me, setMe] = useState<MeData | null>(null);
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent">("idle");
  const [signingOut, setSigningOut] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    fetch("/api/me")
      .then((r) => r.json())
      .then((data: MeData) => setMe(data))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResetPassword = async () => {
    if (!email) return;
    setResetState("sending");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/account`,
    });
    if (error) { setResetState("idle"); return; }
    setResetState("sent");
  };

  const onSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const onUpgradeToPro = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/billing/checkout/subscription", { method: "POST" });
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setUpgrading(false);
    }
  };

  const onManageSubscription = async () => {
    setManaging(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      setManaging(false);
    }
  };

  const isPro = me?.planTier === "pro" && me?.billingState === "active";
  const isGrace = me?.billingState === "grace";
  const used = me?.generationCountThisMonth ?? 0;
  const balance = me?.creditBalance ?? 0;

  const passwordHint =
    resetState === "sent"
      ? "Check your email for a reset link."
      : "Send a reset link to your email.";

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav />
      <main className="w-full px-6 pt-10 pb-24 lg:px-20 lg:pt-12 lg:pb-40">
        <div className="flex flex-col">
          <h1 className="text-2xl font-medium leading-8 text-fg">Account settings</h1>

          {/* Profile */}
          <section className="mt-2 flex flex-col gap-6 py-[22px] lg:flex-row lg:items-start lg:gap-28">
            <div className="lg:w-[173px]">
              <h2 className="text-xl leading-7 text-fg">Profile</h2>
            </div>
            <div className="flex flex-col gap-6 lg:w-[458px] lg:flex-shrink-0">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-xs leading-4 text-fg-muted">Email</p>
                <p className="truncate text-sm font-medium leading-5 text-fg">{email ?? " "}</p>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border py-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm leading-5 text-fg">Password</p>
                  <p className="text-xs leading-4 text-fg-muted">{passwordHint}</p>
                </div>
                <button
                  type="button"
                  onClick={onResetPassword}
                  disabled={resetState !== "idle" || !email}
                  className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm leading-5 text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetState === "sending" ? "Sending…" : resetState === "sent" ? "Link sent" : "Reset password"}
                </button>
              </div>
            </div>
          </section>

          {/* Plan & credits */}
          <section className="flex flex-col gap-6 border-t border-border py-[22px] lg:flex-row lg:items-start lg:gap-28">
            <div className="flex flex-col gap-2 lg:w-[173px]">
              <h2 className="text-xl leading-7 text-fg">Plan &amp; credits</h2>
            </div>
            <div className="flex flex-col gap-6 lg:w-[458px] lg:flex-shrink-0">
              {isGrace && me?.gracePeriodEndsAt && (
                <GraceBanner endsAt={me.gracePeriodEndsAt} onManage={onManageSubscription} />
              )}

              {isPro ? (
                <>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-sm leading-5 text-fg">Reframed Pro · $29/month</p>
                      <p className="text-xs leading-4 text-fg-muted">Manage your subscription, card, and invoices.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onManageSubscription}
                      disabled={managing}
                      className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm leading-5 text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {managing ? "Loading…" : "Manage subscription"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium leading-5 text-fg">Unlimited generations</p>
                    <p className="text-xs leading-4 text-fg-muted">
                      Credits reset on the 1st of each month.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium leading-4 text-fg">
                      {used} of {FREE_MONTHLY_LIMIT} credits used
                    </p>
                    <p className="text-xs leading-4 text-fg-muted">
                      Credits reset on the 1st of each month.
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-sm leading-5 text-fg">Upgrade to Pro</p>
                      <p className="text-xs leading-4 text-fg-muted">$29/month for unlimited generations.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onUpgradeToPro}
                      disabled={upgrading}
                      className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-3 py-1 text-sm leading-5 text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {upgrading ? "Loading…" : "Upgrade to Pro"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-6 border-t border-border pt-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-sm leading-5 text-fg">{balance} render credits</p>
                      <p className="text-xs leading-4 text-fg-muted">
                        Don&rsquo;t expire. Use when your monthly generations run out.
                      </p>
                    </div>
                    <Link
                      href="/account/credits"
                      className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-3 py-1 text-sm leading-5 text-white transition-colors hover:bg-accent-hover"
                    >
                      Add credits
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Usage */}
          <section className="flex flex-col gap-6 border-t border-border py-[22px] lg:flex-row lg:items-start lg:gap-28">
            <div className="lg:w-[173px]">
              <h2 className="text-xl leading-7 text-fg">Usage</h2>
            </div>
            <div className="flex flex-col lg:w-[458px] lg:flex-shrink-0">
              <p className="text-sm leading-5 text-fg">
                {isPro
                  ? `${used}/unlimited credits used`
                  : `${used}/${FREE_MONTHLY_LIMIT} credits used`}
              </p>
            </div>
          </section>

          {/* Billing */}
          <section className="flex flex-col gap-6 border-t border-border py-[22px] lg:flex-row lg:items-start lg:gap-28">
            <div className="flex flex-col gap-2 lg:w-[173px]">
              <h2 className="text-xl leading-7 text-fg">Billing</h2>
            </div>
            <div className="flex flex-col lg:w-[458px] lg:flex-shrink-0">
              <div className="flex items-center py-3.5">
                <Link
                  href="/account/billing"
                  className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm leading-5 text-white transition-colors hover:bg-accent-hover"
                >
                  View invoices
                </Link>
              </div>
            </div>
          </section>

          {/* Sign out */}
          <section className="flex flex-col gap-6 border-t border-border py-[22px] lg:flex-row lg:items-start lg:gap-28">
            <div className="lg:w-[173px]">
              <h2 className="text-xl leading-7 text-fg">Sign out</h2>
            </div>
            <div className="flex flex-col lg:w-[458px] lg:flex-shrink-0">
              <button
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                className="inline-flex w-fit items-center justify-center rounded-md border border-border bg-bg px-3 py-1 text-sm leading-5 text-fg transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
