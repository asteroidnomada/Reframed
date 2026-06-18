import Stripe from "stripe";
import { env } from "./env";
import { supabaseAdmin } from "./supabase";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return _stripe;
}

export async function getOrCreateCustomer(
  userId: string,
  email: string
): Promise<string> {
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  await supabaseAdmin
    .from("users")
    .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return customer.id;
}

export async function createSubscriptionCheckout({
  userId,
  email,
  returnUrl,
}: {
  userId: string;
  email: string;
  returnUrl: string;
}): Promise<string> {
  const customerId = await getOrCreateCustomer(userId, email);
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: env("STRIPE_PRICE_PRO_MONTHLY"), quantity: 1 }],
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    metadata: { supabase_user_id: userId },
  });
  return session.url!;
}

export async function createCreditCheckout({
  userId,
  email,
  qty,
  returnUrl,
}: {
  userId: string;
  email: string;
  qty: number;
  returnUrl: string;
}): Promise<string> {
  const customerId = await getOrCreateCustomer(userId, email);
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: env("STRIPE_PRICE_CREDIT_UNIT"), quantity: qty }],
    success_url: `${env("NEXT_PUBLIC_APP_URL")}/account/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    metadata: { supabase_user_id: userId, kind: "credits", qty: String(qty) },
    invoice_creation: { enabled: true },
  });
  return session.url!;
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
