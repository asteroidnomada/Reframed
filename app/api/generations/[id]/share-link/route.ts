import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if share link already exists
  const { data: existing } = await supabase
    .from('share_links')
    .select('access_token, expires_at')
    .eq('generation_id', id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    return NextResponse.json({
      token: existing.access_token,
      url: `${baseUrl}/s/${existing.access_token}`,
      expires_at: existing.expires_at,
    })
  }

  const { data: shareLink, error } = await supabase
    .from('share_links')
    .insert({ generation_id: id, user_id: user.id })
    .select('access_token, expires_at')
    .single()

  if (error || !shareLink) {
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  return NextResponse.json({
    token: shareLink.access_token,
    url: `${baseUrl}/s/${shareLink.access_token}`,
    expires_at: shareLink.expires_at,
  }, { status: 201 })
}
