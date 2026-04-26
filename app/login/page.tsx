"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setNotice("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/account`,
        });
        if (error) throw error;
        setNotice("If that email exists, a reset link is on the way.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  const title =
    mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : "Reset password";

  return (
    <div className="min-h-screen bg-bg">
      <Nav variant="secondary" />
      <main className="mx-auto max-w-[400px] px-6 pt-20 pb-24">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-fg-muted">
          {mode === "sign-in" && "Welcome back to Reframed."}
          {mode === "sign-up" && "Start visualizing your space."}
          {mode === "reset" && "We'll email you a reset link."}
        </p>

        {mode !== "reset" && (
          <>
            <button
              type="button"
              onClick={onGoogle}
              className="mt-8 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-bg text-sm font-medium hover:border-border-strong"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.167.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 flex items-center gap-3 text-xs text-fg-muted">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>

          {mode !== "reset" && (
            <label className="block">
              <span className="text-xs font-medium">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </label>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Working…"
              : mode === "sign-in"
                ? "Sign in"
                : mode === "sign-up"
                  ? "Create account"
                  : "Send reset link"}
          </Button>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-fg-muted">{notice}</p>}
        </form>

        <div className="mt-8 space-y-2 text-sm text-fg-muted">
          {mode === "sign-in" && (
            <>
              <p>
                No account?{" "}
                <button type="button" onClick={() => setMode("sign-up")} className="font-medium text-fg hover:underline">
                  Create one
                </button>
              </p>
              <p>
                <button type="button" onClick={() => setMode("reset")} className="font-medium text-fg hover:underline">
                  Forgot password?
                </button>
              </p>
            </>
          )}
          {mode === "sign-up" && (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("sign-in")} className="font-medium text-fg hover:underline">
                Sign in
              </button>
            </p>
          )}
          {mode === "reset" && (
            <p>
              <button type="button" onClick={() => setMode("sign-in")} className="font-medium text-fg hover:underline">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
