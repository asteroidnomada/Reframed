import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSubscriptionCheckout } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const returnUrl = `${env("NEXT_PUBLIC_APP_URL")}/account`;
  const url = await createSubscriptionCheckout({
    userId: user.id,
    email: user.email!,
    returnUrl,
  });

  return NextResponse.json({ url });
}
