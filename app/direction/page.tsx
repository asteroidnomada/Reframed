"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { GeneratingOverlay } from "@/components/GeneratingOverlay";
import { presets } from "@/lib/presets";
import { addItem, addVersion, formatToday, nextDefaultTitle } from "@/lib/gallery";

type Mode =
  | { kind: "new"; imageDataUrl: string }
  | { kind: "reframe"; itemId: string; imageUrl: string };

export default function DirectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reframeRaw = sessionStorage.getItem("reframed:reframe");
    if (reframeRaw) {
      try {
        const parsed = JSON.parse(reframeRaw) as { itemId: string; imageUrl: string };
        if (parsed.itemId && parsed.imageUrl) {
          setMode({ kind: "reframe", itemId: parsed.itemId, imageUrl: parsed.imageUrl });
          return;
        }
      } catch {}
    }
    const dataUrl = sessionStorage.getItem("reframed:pending");
    if (!dataUrl) {
      router.replace("/upload");
      return;
    }
    setMode({ kind: "new", imageDataUrl: dataUrl });
  }, [router]);

  const onGenerate = async () => {
    if (!selected || !mode) return;
    setError(null);
    setLoading(true);
    try {
      const trimmed = customPrompt.trim();
      const base =
        mode.kind === "new"
          ? { imageDataUrl: mode.imageDataUrl, presetId: selected }
          : { imageUrl: mode.imageUrl, presetId: selected };
      const body = trimmed ? { ...base, customPrompt: trimmed } : base;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as {
        id: string;
        title: string;
        beforeUrl: string;
        afterUrl: string;
      };
      const today = formatToday();
      if (mode.kind === "new") {
        addItem({
          id: data.id,
          title: nextDefaultTitle(),
          date: today,
          beforeUrl: data.beforeUrl,
          versions: [
            {
              afterUrl: data.afterUrl,
              presetId: selected,
              presetTitle: data.title,
              date: today,
            },
          ],
        });
        sessionStorage.removeItem("reframed:pending");
      } else {
        addVersion(mode.itemId, {
          afterUrl: data.afterUrl,
          presetId: selected,
          presetTitle: data.title,
          date: today,
        });
        sessionStorage.removeItem("reframed:reframe");
      }
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const disabled = !selected || loading || !mode;

  return (
    <div className="min-h-screen bg-bg-subtle">
      {loading && <GeneratingOverlay />}
      <Nav variant="secondary" backHref="/upload" onClose={() => router.push("/")} />
      <main className="mx-auto w-full max-w-[552px] px-6 pt-10 pb-24 lg:px-0 lg:pb-40">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <header className="flex flex-col gap-1">
              <h1 className="text-2xl font-medium leading-8 text-fg">
                Select a design direction
              </h1>
              <p className="text-xs leading-4 text-fg-muted">
                Each preset tunes furniture, lighting, and signage to a distinct aesthetic.
              </p>
            </header>

            {selected === null ? (
              <div className="flex flex-col gap-3">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p.id)}
                    disabled={loading}
                    className="flex w-full flex-col items-start gap-2 rounded-md border-2 border-border bg-bg p-4 text-left transition-colors hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-subtle"
                  >
                    <span className="text-sm leading-5 text-fg">{p.title}</span>
                    <span className="text-xs leading-4 text-fg-muted">{p.subtitle}</span>
                  </button>
                ))}
              </div>
            ) : (
              (() => {
                const p = presets.find((x) => x.id === selected);
                if (!p) return null;
                return (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      aria-pressed="true"
                      className="flex w-full flex-col items-start gap-2 rounded-md border-2 border-accent bg-bg p-4"
                    >
                      <span className="text-sm leading-5 text-fg">{p.title}</span>
                      <span className="text-xs leading-4 text-fg-muted">{p.subtitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      disabled={loading}
                      className="text-sm leading-5 text-fg-muted underline-offset-2 hover:text-fg hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Choose different direction
                    </button>
                  </div>
                );
              })()
            )}
          </section>

          {selected !== null && (
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-2.5">
                <header className="flex flex-col gap-1">
                  <h2 className="text-xl leading-7 text-fg">
                    Add custom directions
                  </h2>
                  <p className="text-xs leading-4 text-fg-muted">Optional</p>
                </header>

                <div className="flex w-full flex-col items-end gap-2">
                  <textarea
                    id="custom-prompt"
                    rows={2}
                    maxLength={500}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. add plants, brass hardware, warm daylight…"
                    disabled={loading}
                    className="w-full resize-none rounded-md border border-border bg-bg px-4 pt-4 pb-10 text-sm leading-5 text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none disabled:opacity-50"
                  />
                  <p className="text-sm leading-5 text-fg-muted">
                    {customPrompt.length}/500
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onGenerate}
                disabled={disabled}
                className="inline-flex w-full items-center justify-center rounded-md bg-accent px-5 py-2 text-sm leading-5 text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-subtle lg:w-auto lg:self-start"
              >
                {loading ? "Generating…" : "Generate with AI"}
              </button>

              {error && (
                <p role="alert" className="text-sm leading-5 text-red-600">
                  {error}
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
