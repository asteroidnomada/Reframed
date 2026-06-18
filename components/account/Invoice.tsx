"use client";

import { useEffect } from "react";
import { type CreditInvoice, money } from "@/lib/credits";

const BILLED_TO = {
  name: "Mirandy Kim",
  email: "asteroidnomada@gmail.com",
};

const ISSUER = {
  name: "Reframed, Inc.",
  line1: "2261 Market Street, Suite 540",
  line2: "San Francisco, CA 94114",
  taxLabel: "Tax ID",
  tax: "US-88-4391022",
};

const CloseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M1 1L13 13M13 1L1 13" />
  </svg>
);

export function InvoiceDocument({
  invoice,
  email = BILLED_TO.email,
  name = BILLED_TO.name,
}: {
  invoice: CreditInvoice;
  email?: string;
  name?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-bg shadow-sm">
      <div
        className="pointer-events-none absolute right-[-10px] bottom-6 -rotate-12 select-none text-[96px] font-bold leading-none tracking-[0.04em]"
        style={{ color: "rgba(60, 140, 90, 0.06)" }}
        aria-hidden
      >
        PAID
      </div>

      <div className="flex flex-col gap-8 p-11">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2.5">
            <span className="text-[19px] font-semibold leading-none tracking-[-0.5px] text-fg">
              Reframed
            </span>
            <span className="text-[11.5px] leading-[17px] text-fg-muted">
              {ISSUER.name}
              <br />
              {ISSUER.line1}
              <br />
              {ISSUER.line2}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
              Invoice
            </span>
            <span className="text-[15px] font-semibold tabular-nums text-fg">
              {invoice.number}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]"
              style={{
                borderColor: "#BFE0CC",
                background: "#F3FAF5",
                color: "#2F7A4C",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#3C8C5A" }}
                aria-hidden
              />
              Paid
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-7">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg-faint">
              Billed to
            </span>
            <span className="text-[13px] font-semibold leading-[18px] text-fg">
              {name}
            </span>
            <span className="text-[12.5px] leading-[18px] text-fg-muted">{email}</span>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg-faint">
              Details
            </span>
            <span className="text-[12.5px] leading-[18px] text-fg-muted">
              <strong className="font-semibold text-fg">Issued</strong>&nbsp; {invoice.date}
            </span>
            <span className="text-[12.5px] leading-[18px] text-fg-muted">
              <strong className="font-semibold text-fg">Order type</strong>&nbsp; One-time purchase
            </span>
            <span className="text-[12.5px] leading-[18px] text-fg-muted">
              {ISSUER.taxLabel} {ISSUER.tax}
            </span>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-[1fr_56px_96px] gap-3 border-b border-fg pb-2.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Description
            </span>
            <span className="text-right text-[10.5px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Qty
            </span>
            <span className="text-right text-[10.5px] font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Amount
            </span>
          </div>
          <div className="grid grid-cols-[1fr_56px_96px] gap-3 border-b border-border py-3.5">
            <div className="flex flex-col gap-[3px]">
              <span className="text-[13px] font-medium text-fg">Render credits</span>
              <span className="text-[11.5px] text-fg-muted">
                4K upscales &amp; high-resolution exports · {money(invoice.unitPrice)} per credit
              </span>
            </div>
            <span className="text-right text-[13px] tabular-nums text-fg">{invoice.credits}</span>
            <span className="text-right text-[13px] tabular-nums text-fg">
              {money(invoice.amount)}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="w-[240px]">
            <div className="flex items-center justify-between py-2 text-[12.5px] tabular-nums text-fg-muted">
              <span>Subtotal</span>
              <span className="font-medium text-fg">{money(invoice.amount)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-[12.5px] tabular-nums text-fg-muted">
              <span>Tax</span>
              <span className="font-medium text-fg">{money(0)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-fg pt-3 text-[15px] font-semibold tabular-nums text-fg">
              <span>Total paid</span>
              <span>{money(invoice.amount)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-border pt-5">
          <span className="text-[12.5px] font-medium text-fg">
            Thank you for renovating with Reframed.
          </span>
          <span className="text-[11.5px] leading-[17px] text-fg-muted">
            Charged to Visa ending 4242 on {invoice.date}. This invoice was generated automatically and is valid without a signature.
          </span>
          <span className="text-[11.5px] leading-[17px] text-fg-muted">
            Questions? billing@reframed.app
          </span>
        </div>
      </div>
    </div>
  );
}

export function DownloadButton({
  pdfUrl,
  label = "Download",
  className = "",
}: {
  pdfUrl?: string | null;
  label?: string;
  className?: string;
}) {
  const base =
    "inline-flex h-[34px] min-w-[116px] items-center justify-center gap-[7px] whitespace-nowrap rounded-md border px-3.5 text-[13px] font-medium transition-colors";
  const tone = "border-border bg-bg text-fg hover:border-border-strong hover:bg-bg-subtle";

  if (!pdfUrl) {
    return (
      <button
        type="button"
        disabled
        className={`${base} ${tone} cursor-not-allowed opacity-40 ${className}`}
      >
        <span>{label}</span>
      </button>
    );
  }

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`${base} ${tone} ${className}`}
    >
      <span>{label}</span>
    </a>
  );
}

export function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.6px] border-border-strong border-t-fg"
      aria-hidden
    />
  );
}

export function InvoiceModal({
  invoice,
  onClose,
}: {
  invoice: CreditInvoice;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-overlay px-6 py-14"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-xl bg-bg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-fg">
              Invoice {invoice.number}
            </span>
            <span className="text-xs tabular-nums text-fg-muted">
              {invoice.date} · {invoice.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto bg-bg-subtle p-7">
          <InvoiceDocument invoice={invoice} />
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <DownloadButton pdfUrl={null} label="Download PDF" />
        </div>
      </div>
    </div>
  );
}
