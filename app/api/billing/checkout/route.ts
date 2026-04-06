import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'

export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('stripe_customer_id, plan_tier')
    .eq('id', user.id)
    .single()

  if (userRow?.plan_tier === 'pro') {
    return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: userRow?.stripe_customer_id ?? undefined,
    customer_email: userRow?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: STRIPE_PRICES.pro_monthly, quantity: 1 }],
    success_url: `${baseUrl}/account?upgraded=true`,
    cancel_url: `${baseUrl}/account`,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ checkout_url: session.url })
}
