"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { DownloadButton } from "@/components/account/Invoice";
import { type MeData, type Purchase, money, formatPurchaseDate } from "@/lib/credits";

export default function BillingPage() {
  const [me, setMe] = useState<MeData | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data: MeData) => setMe(data))
      .catch(() => {});
  }, []);

  const purchases: Purchase[] = me?.purchases ?? [];

  return (
    <div className="min-h-screen bg-bg-subtle">
      <Nav />
      <main className="w-full px-6 pt-10 pb-24 lg:px-20 lg:pt-12 lg:pb-40">
        <div className="flex flex-col gap-8 lg:gap-12">
          <div className="flex flex-col gap-4">
            <Link
              href="/account"
              className="inline-flex w-fit items-center gap-1.5 text-sm leading-5 text-fg-muted transition-colors hover:text-fg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to account
            </Link>
          </div>

          <div className="flex flex-col gap-4 lg:max-w-[640px]">
            {purchases.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong px-6 py-10 text-center">
                <span className="mb-1 text-fg-faint" aria-hidden>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3v18l2-1.4L9 21l2-1.4L13 21l2-1.4L17 21l2-1.4V3l-2 1.4L15 3l-2 1.4L11 3 9 4.4 7 3 5 4.4z" />
                    <path d="M8.5 9h7M8.5 13h7" />
                  </svg>
                </span>
                <p className="text-sm font-medium leading-5 text-fg">No invoices yet</p>
                <p className="max-w-[320px] text-xs leading-[18px] text-fg-muted">
                  Purchase render credits and your receipts will appear here, ready to download.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="pb-3 text-sm font-semibold text-fg">Billing history</p>
                {purchases.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-border py-3.5 last:border-b"
                  >
                    <div className="flex min-w-0 flex-col gap-[3px]">
                      <span className="text-sm font-medium leading-[18px] text-fg">
                        {p.kind === "credits"
                          ? `${p.credits} credit${p.credits === 1 ? "" : "s"}`
                          : p.kind === "refund"
                          ? `Refund · ${p.credits} credit${p.credits === 1 ? "" : "s"}`
                          : "Reframed Pro"}
                      </span>
                      <span className="flex items-center gap-2 text-xs leading-4 text-fg-muted">
                        <span>{formatPurchaseDate(p.createdAt)}</span>
                        <span className="text-border-strong">·</span>
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ background: p.status === "paid" ? "#3C8C5A" : "#DC2626" }}
                            aria-hidden
                          />
                          {p.status === "paid" ? "Paid" : "Refunded"}
                        </span>
                      </span>
                    </div>
                    <span
                      className={`whitespace-nowrap text-right text-sm font-medium tabular-nums ${
                        p.amountCents < 0 ? "text-fg-muted" : "text-fg"
                      }`}
                    >
                      {p.amountCents < 0
                        ? `-${money(Math.abs(p.amountCents) / 100)}`
                        : money(p.amountCents / 100)}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      {p.hostedInvoiceUrl ? (
                        <a
                          href={p.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-[34px] items-center justify-center rounded-md border border-border bg-bg px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-border-strong hover:bg-bg-subtle"
                        >
                          View
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-[34px] items-center justify-center rounded-md border border-border bg-bg px-3.5 text-[13px] font-medium text-fg opacity-40 cursor-not-allowed"
                        >
                          View
                        </button>
                      )}
                      <DownloadButton pdfUrl={p.invoicePdfUrl} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
