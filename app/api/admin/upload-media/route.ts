import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseServerClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://xoxhmugmtzscmjlbpfuj.supabase.co'
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

function verifyAdminToken(request: Request): boolean {
  const incomingToken = request.headers.get('x-admin-token')?.trim() || ''
  const validToken = (
    process.env.ADMIN_API_TOKEN ||
    process.env.NEXT_PUBLIC_ADMIN_PIN ||
    'GoTall@Admin2026'
  ).trim()

  return incomingToken === validToken
}

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'])

export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'stretches'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/)
    const ext = extMatch ? extMatch[1].toLowerCase() : ''

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file extension '.${ext}'. Allowed: JPG, PNG, WebP, GIF, MP4, WebM.` },
        { status: 400 }
      )
    }

    const isVideo = ext === 'mp4' || ext === 'webm' || file.type.startsWith('video/')
    const isGif = ext === 'gif' || file.type === 'image/gif'
    const mediaType: 'video' | 'gif' | 'image' = isVideo ? 'video' : isGif ? 'gif' : 'image'

    const MAX_SIZE = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size (${isVideo ? '50MB' : '10MB'}).` },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    const safeBaseName = file.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
    const safeRandomId = Math.random().toString(36).substring(2, 10)
    const filePath = `${folder}/${Date.now()}_${safeRandomId}_${safeBaseName}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const contentType = isVideo
      ? ext === 'webm' ? 'video/webm' : 'video/mp4'
      : isGif
      ? 'image/gif'
      : ext === 'png'
      ? 'image/png'
      : ext === 'webp'
      ? 'image/webp'
      : 'image/jpeg'

    const { error: uploadError } = await supabase.storage
      .from('exercise-media')
      .upload(filePath, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicData } = supabase.storage
      .from('exercise-media')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      publicUrl: publicData.publicUrl,
      mediaType,
      fileName: file.name,
      fileSize: file.size,
      path: filePath,
    })
  } catch (err: any) {
    console.error('Upload media route error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
