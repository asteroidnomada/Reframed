import { supabaseAdmin } from "./supabase";

export class OutOfQuotaError extends Error {
  constructor(public readonly reason: "free" | "credits") {
    super(`Out of quota: ${reason}`);
    this.name = "OutOfQuotaError";
  }
}

type Profile = {
  id: string;
  plan_tier: string;
  billing_state: string;
  credit_balance: number;
  generation_count_this_month: number;
  quota_reset_at: string;
  stripe_customer_id: string | null;
  grace_period_ends_at: string | null;
};

export async function getProfileForUser(userId: string): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, plan_tier, billing_state, credit_balance, generation_count_this_month, quota_reset_at, stripe_customer_id, grace_period_ends_at"
    )
    .eq("id", userId)
    .single();

  if (error || !data) throw new Error(`Profile not found for user ${userId}`);

  // Lazy monthly rollover: reset count if quota_reset_at has passed
  if (new Date() >= new Date(data.quota_reset_at)) {
    const nextReset = new Date();
    nextReset.setUTCDate(1);
    nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);
    nextReset.setUTCHours(0, 0, 0, 0);

    await supabaseAdmin
      .from("users")
      .update({
        generation_count_this_month: 0,
        quota_reset_at: nextReset.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    data.generation_count_this_month = 0;
    data.quota_reset_at = nextReset.toISOString();
  }

  return data as Profile;
}

export async function reserveCredit({
  userId,
  generationId,
}: {
  userId: string;
  generationId: string;
}): Promise<void> {
  const profile = await getProfileForUser(userId);

  // Pro users with active billing are unlimited
  if (profile.plan_tier === "pro" && profile.billing_state === "active") return;

  // Use a free monthly generation if available
  if (profile.generation_count_this_month < 3) {
    await supabaseAdmin
      .from("users")
      .update({
        generation_count_this_month: profile.generation_count_this_month + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    return;
  }

  // No free slots — require a credit
  if (profile.credit_balance <= 0) {
    throw new OutOfQuotaError("free");
  }

  const { error } = await supabaseAdmin.from("credit_ledger").insert({
    user_id: userId,
    delta: -1,
    kind: "reserve",
    generation_id: generationId,
  });
  if (error) throw error;

  await supabaseAdmin
    .from("users")
    .update({
      credit_balance: profile.credit_balance - 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function commitCredit({
  generationId,
}: {
  generationId: string;
}): Promise<void> {
  // Flip reserve → commit in ledger (no balance change; audit only)
  await supabaseAdmin
    .from("credit_ledger")
    .update({ kind: "commit" })
    .eq("generation_id", generationId)
    .eq("kind", "reserve");
}

export async function releaseCredit({
  userId,
  generationId,
}: {
  userId: string;
  generationId: string;
}): Promise<void> {
  const { data: reserve } = await supabaseAdmin
    .from("credit_ledger")
    .select("id")
    .eq("generation_id", generationId)
    .eq("kind", "reserve")
    .maybeSingle();

  if (reserve) {
    // Was a credit reserve — refund it
    await supabaseAdmin.from("credit_ledger").insert({
      user_id: userId,
      delta: 1,
      kind: "release",
      generation_id: generationId,
    });
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("credit_balance")
      .eq("id", userId)
      .single();
    if (profile) {
      await supabaseAdmin
        .from("users")
        .update({
          credit_balance: profile.credit_balance + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  } else {
    // Was a free-tier slot — undo the monthly count increment
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("generation_count_this_month")
      .eq("id", userId)
      .single();
    if (profile && profile.generation_count_this_month > 0) {
      await supabaseAdmin
        .from("users")
        .update({
          generation_count_this_month: profile.generation_count_this_month - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  }
}

export async function topUpCredits({
  userId,
  qty,
  paymentIntentId,
  eventId,
}: {
  userId: string;
  qty: number;
  paymentIntentId: string;
  eventId: string;
}): Promise<void> {
  // Idempotent on eventId
  const { error: ledgerError } = await supabaseAdmin
    .from("credit_ledger")
    .insert({
      user_id: userId,
      delta: qty,
      kind: "topup",
      stripe_payment_intent_id: paymentIntentId,
      idempotency_key: eventId,
    });

  if (ledgerError) {
    // Unique constraint on idempotency_key — already processed
    if (ledgerError.code === "23505") return;
    throw ledgerError;
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("credit_balance")
    .eq("id", userId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from("users")
      .update({
        credit_balance: profile.credit_balance + qty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }
}

export async function applyRefund({
  paymentIntentId,
  eventId,
}: {
  paymentIntentId: string;
  eventId: string;
}): Promise<void> {
  const { data: purchase } = await supabaseAdmin
    .from("purchases")
    .select(
      "id, user_id, credits, amount_cents, currency, stripe_invoice_id, hosted_invoice_url, invoice_pdf_url"
    )
    .eq("stripe_payment_intent_id", paymentIntentId)
    .eq("kind", "credits")
    .maybeSingle();

  if (!purchase) return; // Not a credit purchase

  const credits = purchase.credits ?? 0;

  // Idempotent on eventId — guards double-processing of the whole refund
  const { error: ledgerError } = await supabaseAdmin
    .from("credit_ledger")
    .insert({
      user_id: purchase.user_id,
      delta: -credits,
      kind: "refund",
      stripe_payment_intent_id: paymentIntentId,
      idempotency_key: eventId,
    });

  if (ledgerError) {
    if (ledgerError.code === "23505") return;
    throw ledgerError;
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("credit_balance")
    .eq("id", purchase.user_id)
    .single();

  if (profile) {
    await supabaseAdmin
      .from("users")
      .update({
        credit_balance: Math.max(0, profile.credit_balance - credits),
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase.user_id);
  }

  // Record the refund as its own deduction line in billing history. The
  // original purchase stays "paid"; payment_intent is null to satisfy the
  // unique index (the ledger entry above holds the idempotent link).
  await supabaseAdmin.from("purchases").insert({
    user_id: purchase.user_id,
    stripe_payment_intent_id: null,
    stripe_invoice_id: purchase.stripe_invoice_id,
    kind: "refund",
    credits,
    amount_cents: -Math.abs(purchase.amount_cents),
    currency: purchase.currency,
    status: "refunded",
    hosted_invoice_url: purchase.hosted_invoice_url,
    invoice_pdf_url: purchase.invoice_pdf_url,
  });
}
