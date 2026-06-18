import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCreditCheckout } from "@/lib/stripe";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const MIN_QTY = 5;
const MAX_QTY = 500;
const STEP = 1;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let qty: number;
  try {
    const body = await req.json();
    qty = Number(body.qty);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Number.isInteger(qty) || qty < MIN_QTY || qty > MAX_QTY) {
    return NextResponse.json(
      { error: `qty must be between ${MIN_QTY} and ${MAX_QTY}` },
      { status: 400 }
    );
  }

  const returnUrl = `${env("NEXT_PUBLIC_APP_URL")}/account/credits`;
  const url = await createCreditCheckout({
    userId: user.id,
    email: user.email!,
    qty,
    returnUrl,
  });

  return NextResponse.json({ url });
}
