import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { StylePreset } from '@/lib/types'

const STYLE_PRESETS: StylePreset[] = ['minimalist', 'industrial', 'warm_neighborhood']
const FREE_TIER_LIMIT = 3

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { capture_id, style_preset } = await request.json()

  if (!capture_id || !style_preset) {
    return NextResponse.json({ error: 'capture_id and style_preset required' }, { status: 400 })
  }

  if (!STYLE_PRESETS.includes(style_preset)) {
    return NextResponse.json({ error: 'Invalid style_preset' }, { status: 400 })
  }

  // Quota check
  const { data: userRow } = await supabase
    .from('users')
    .select('plan_tier, generation_count_this_month, billing_state')
    .eq('id', user.id)
    .single()

  if (userRow?.plan_tier === 'free' && (userRow?.generation_count_this_month ?? 0) >= FREE_TIER_LIMIT) {
    return NextResponse.json({ error: 'Monthly quota exceeded', code: 'QUOTA_EXCEEDED' }, { status: 402 })
  }

  // Create generation row
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .insert({
      capture_id,
      user_id: user.id,
      style_preset,
      status: 'queued',
    })
    .select()
    .single()

  if (genError) {
    return NextResponse.json({ error: genError.message }, { status: 500 })
  }

  // TODO: enqueue background job { generation_id: generation.id }

  return NextResponse.json({ generation_id: generation.id }, { status: 202 })
}
