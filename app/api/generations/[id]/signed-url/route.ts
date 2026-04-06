import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SIGNED_URL_TTL_SECONDS = 15 * 60 // 15 minutes

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

  const { data: generation, error: genError } = await supabase
    .from('generations')
    .select('display_path, status')
    .eq('id', id)
    .single()

  if (genError || !generation) {
    return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
  }

  if (generation.status !== 'completed' || !generation.display_path) {
    return NextResponse.json({ error: 'Generation not ready' }, { status: 409 })
  }

  const { data: signedUrl, error: urlError } = await supabase.storage
    .from('reframed')
    .createSignedUrl(generation.display_path, SIGNED_URL_TTL_SECONDS)

  if (urlError || !signedUrl) {
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString()

  return NextResponse.json({ url: signedUrl.signedUrl, expires_at: expiresAt })
}
