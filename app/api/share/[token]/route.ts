import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const SHARE_SIGNED_URL_TTL = 30 * 24 * 60 * 60 // 30 days in seconds

interface RouteContext {
  params: Promise<{ token: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token } = await params

  // Service role bypasses RLS to resolve share links
  const supabase = await createServiceClient()

  const { data: shareLink, error } = await supabase
    .from('share_links')
    .select('generation_id, expires_at, view_count')
    .eq('access_token', token)
    .single()

  if (error || !shareLink) {
    return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
  }

  if (new Date(shareLink.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Share link expired' }, { status: 410 })
  }

  const { data: generation } = await supabase
    .from('generations')
    .select('id, style_preset, display_path, completed_at')
    .eq('id', shareLink.generation_id)
    .single()

  if (!generation?.display_path) {
    return NextResponse.json({ error: 'Generation not available' }, { status: 404 })
  }

  const { data: signedUrl } = await supabase.storage
    .from('reframed')
    .createSignedUrl(generation.display_path, SHARE_SIGNED_URL_TTL)

  // Increment view count (fire and forget)
  supabase
    .from('share_links')
    .update({ view_count: shareLink.view_count + 1 })
    .eq('access_token', token)

  return NextResponse.json({
    generation_id: generation.id,
    style_preset: generation.style_preset,
    completed_at: generation.completed_at,
    image_url: signedUrl?.signedUrl,
  })
}
