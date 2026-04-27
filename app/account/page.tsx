"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { createClient } from "@/lib/supabase/client";

const FREE_MONTHLY_CREDITS = 3;

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [used] = useState(0);
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent">("idle");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setEmail(u?.email ?? null);
      const meta = (u?.user_metadata ?? {}) as Record<string, unknown>;
      const fullName =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        null;
      setName(fullName);
    });
  }, [supabase]);

  const onResetPassword = async () => {
    if (!email) return;
    setResetState("sending");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/account`,
    });
    if (error) {
      setResetState("idle");
      return;
    }
    setResetState("sent");
  };

  const onSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const passwordHint =
    resetState === "sent"
      ? "Check your email for a reset link."
      : "Send a reset link to your email.";

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav />
      <main className="w-full px-6 pt-10 pb-24 lg:px-20 lg:pt-12 lg:pb-40">
        <div className="flex flex-col gap-8 lg:gap-16">
          <h1 className="text-2xl font-medium leading-8 text-fg">Account settings</h1>

          <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-28">
            <div className="lg:w-[173px]">
              <h2 className="text-xl leading-7 text-fg">Profile</h2>
            </div>
            <div className="flex flex-col gap-6 lg:w-[458px] lg:flex-shrink-0">
              <div className="flex items-start gap-4">
                <div className="flex w-[108px] shrink-0 flex-col gap-1 lg:w-[171px]">
                  <p className="text-xs leading-4 text-fg-muted">Name</p>
                  <p className="truncate text-sm font-medium leading-5 text-fg lg:font-medium">
                    {name ?? "—"}
                  </p>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1 lg:w-[221px] lg:flex-none">
                  <p className="text-xs leading-4 text-fg-muted">Email</p>
                  <p className="truncate text-sm font-medium leading-5 text-fg">
                    {email ?? " "}
                  </p>
                </div>
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
                  className="inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-bg px-5 py-2 text-sm leading-5 text-fg transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetState === "sending"
                    ? "Sending…"
                    : resetState === "sent"
                      ? "Link sent"
                      : "Reset password"}
                </button>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-28">
            <div className="flex flex-col gap-2 lg:w-[173px]">
              <h2 className="text-xl leading-7 text-fg">Plan &amp; credits</h2>
              <p className="text-xs leading-4 text-fg-muted">Free Tier</p>
            </div>
            <div className="flex flex-col gap-12 lg:w-[458px] lg:flex-shrink-0">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium leading-4 text-fg">
                    {used} of {FREE_MONTHLY_CREDITS} credits used
                  </p>
                  <p className="text-xs leading-4 text-fg-muted">
                    Credits reset on the 1st of each month.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-6 border-t border-border pt-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-sm leading-5 text-fg">Upgrade to Pro</p>
                    <p className="text-xs leading-4 text-fg-muted">
                      $29/month for unlimited generations.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-3 py-1 text-sm leading-5 text-white disabled:cursor-not-allowed"
                  >
                    Coming soon
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm leading-5 text-fg">Sign out</p>
                  <p className="text-xs leading-4 text-fg-muted">
                    End your session on this device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={signingOut}
                  className="inline-flex shrink-0 items-center py-3 text-sm leading-5 text-fg-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
