import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const spaceId = formData.get('space_id') as string | null

  if (!file || !spaceId) {
    return NextResponse.json({ error: 'file and space_id required' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 15 MB limit' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File must be JPEG, PNG, or HEIC' }, { status: 400 })
  }

  // TODO: EXIF strip server-side before storage
  // TODO: content moderation check
  // TODO: upload to Supabase Storage /uploads/{user_id}/{capture_id}/

  return NextResponse.json(
    { message: 'Upload handler — implementation pending' },
    { status: 501 }
  )
}
