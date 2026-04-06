import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const quotaLimit = userRow.plan_tier === 'pro' ? null : 3

  return NextResponse.json({
    user: userRow,
    quota: {
      used: userRow.generation_count_this_month,
      limit: quotaLimit,
      resets_at: userRow.quota_reset_at,
    },
  })
}
