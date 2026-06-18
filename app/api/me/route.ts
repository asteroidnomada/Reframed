import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getProfileForUser } from "@/lib/billing";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfileForUser(user.id);

  const { data: rows } = await supabaseAdmin
    .from("purchases")
    .select(
      "id, kind, credits, amount_cents, currency, status, hosted_invoice_url, invoice_pdf_url, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const purchases = (rows ?? []).map((p) => ({
    id: p.id,
    kind: p.kind,
    credits: p.credits,
    amountCents: p.amount_cents,
    currency: p.currency,
    status: p.status,
    hostedInvoiceUrl: p.hosted_invoice_url,
    invoicePdfUrl: p.invoice_pdf_url,
    createdAt: p.created_at,
  }));

  return NextResponse.json({
    planTier: profile.plan_tier,
    billingState: profile.billing_state,
    generationCountThisMonth: profile.generation_count_this_month,
    creditBalance: profile.credit_balance,
    gracePeriodEndsAt: profile.grace_period_ends_at,
    purchases,
  });
}
