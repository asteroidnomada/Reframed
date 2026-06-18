import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { topUpCredits, applyRefund } from "@/lib/billing";
import { env } from "@/lib/env";

export const runtime = "nodejs";

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function dedupEvent(eventId: string, type: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("stripe_events").insert({
    event_id: eventId,
    type,
    received_at: new Date().toISOString(),
  });
  // Unique constraint violation means already processed
  return error?.code === "23505";
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, env("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const alreadyProcessed = await dedupEvent(event.id, event.type);
  if (alreadyProcessed) return NextResponse.json({ ok: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (!userId) break;

        if (session.mode === "subscription") {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

          await supabaseAdmin
            .from("users")
            .update({
              plan_tier: "pro",
              billing_state: "active",
              stripe_subscription_id: subscriptionId ?? null,
              grace_period_ends_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          // Fetch invoice for purchase record
          if (session.invoice) {
            const invoiceId =
              typeof session.invoice === "string" ? session.invoice : session.invoice.id;
            const invoice = await getStripe().invoices.retrieve(invoiceId);
            await supabaseAdmin.from("purchases").insert({
              user_id: userId,
              stripe_payment_intent_id:
                invoice.confirmation_secret?.client_secret?.split("_secret_")[0] ?? null,
              stripe_invoice_id: invoice.id,
              kind: "subscription",
              amount_cents: invoice.amount_paid,
              currency: invoice.currency,
              status: "paid",
              hosted_invoice_url: invoice.hosted_invoice_url ?? null,
              invoice_pdf_url: invoice.invoice_pdf ?? null,
            });
          }
        } else if (
          session.mode === "payment" &&
          session.metadata?.kind === "credits"
        ) {
          const qty = parseInt(session.metadata.qty ?? "0", 10);
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? "";

          if (qty > 0 && paymentIntentId) {
            await topUpCredits({ userId, qty, paymentIntentId, eventId: event.id });

            // Fetch invoice if created
            let hostedUrl: string | null = null;
            let pdfUrl: string | null = null;
            if (session.invoice) {
              const invoiceId =
                typeof session.invoice === "string" ? session.invoice : session.invoice.id;
              const invoice = await getStripe().invoices.retrieve(invoiceId);
              hostedUrl = invoice.hosted_invoice_url ?? null;
              pdfUrl = invoice.invoice_pdf ?? null;
            }

            await supabaseAdmin.from("purchases").insert({
              user_id: userId,
              stripe_payment_intent_id: paymentIntentId,
              kind: "credits",
              credits: qty,
              amount_cents: session.amount_total ?? qty * 80,
              currency: session.currency ?? "usd",
              status: "paid",
              hosted_invoice_url: hostedUrl,
              invoice_pdf_url: pdfUrl,
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const userId = await getUserIdByCustomer(customerId);
        if (!userId) break;

        await supabaseAdmin
          .from("users")
          .update({ billing_state: "active", grace_period_ends_at: null, updated_at: new Date().toISOString() })
          .eq("id", userId);

        // Record renewal invoice (skip if already inserted from checkout.session.completed)
        if (invoice.billing_reason === "subscription_cycle") {
          const piId = invoice.confirmation_secret?.client_secret?.split("_secret_")[0] ?? null;

          if (piId) {
            const { data: existing } = await supabaseAdmin
              .from("purchases")
              .select("id")
              .eq("stripe_payment_intent_id", piId)
              .maybeSingle();

            if (!existing) {
              await supabaseAdmin.from("purchases").insert({
                user_id: userId,
                stripe_payment_intent_id: piId,
                stripe_invoice_id: invoice.id,
                kind: "subscription",
                amount_cents: invoice.amount_paid,
                currency: invoice.currency,
                status: "paid",
                hosted_invoice_url: invoice.hosted_invoice_url ?? null,
                invoice_pdf_url: invoice.invoice_pdf ?? null,
              });
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const userId = await getUserIdByCustomer(customerId);
        if (!userId) break;

        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + 7);

        await supabaseAdmin
          .from("users")
          .update({
            billing_state: "grace",
            grace_period_ends_at: graceEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        if (!customerId) break;

        const userId = await getUserIdByCustomer(customerId);
        if (!userId) break;

        await supabaseAdmin
          .from("users")
          .update({
            plan_tier: "free",
            billing_state: "inactive",
            stripe_subscription_id: null,
            grace_period_ends_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null;
        if (!paymentIntentId) break;

        await applyRefund({ paymentIntentId, eventId: event.id });
        break;
      }
    }
  } catch (err) {
    console.error(`Webhook handler error [${event.type}]:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
