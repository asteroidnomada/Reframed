import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json()

  if (!refresh_token) {
    return NextResponse.json({ error: 'refresh_token required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.refreshSession({ refresh_token })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
  })
}
