export type CreditInvoice = {
  id: string;
  number: string;
  iso: string;
  date: string;
  year: string;
  credits: number;
  unitPrice: number;
  amount: number;
  status: "Paid";
  type: "credits";
};

export type Purchase = {
  id: string;
  kind: "credits" | "subscription" | "refund";
  credits: number | null;
  amountCents: number;
  currency: string;
  status: "paid" | "refunded";
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  createdAt: string;
};

export type MeData = {
  planTier: "free" | "pro";
  billingState: "active" | "grace" | "inactive";
  generationCountThisMonth: number;
  creditBalance: number;
  gracePeriodEndsAt: string | null;
  purchases: Purchase[];
};

export function money(n: number): string {
  return "$" + n.toFixed(2);
}

export function formatPurchaseDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
