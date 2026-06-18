import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPortalSession } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const returnUrl = `${env("NEXT_PUBLIC_APP_URL")}/account`;
  const url = await createPortalSession({
    customerId: profile.stripe_customer_id,
    returnUrl,
  });

  return NextResponse.json({ url });
}
