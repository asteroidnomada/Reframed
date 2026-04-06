import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { guest_session_id } = await request.json()

  if (!guest_session_id) {
    return NextResponse.json({ error: 'guest_session_id required' }, { status: 400 })
  }

  // TODO: transfer guest generation to authenticated user
  // Validate session belongs to same IP, hasn't expired, hasn't been migrated

  return NextResponse.json({ message: 'Migration handler — implementation pending' }, { status: 501 })
}
