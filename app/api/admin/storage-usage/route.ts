import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // 1. Verify admin token from header x-admin-token
  const incomingToken = request.headers.get('x-admin-token')?.trim() || ''
  const validToken = (
    process.env.ADMIN_API_TOKEN ||
    process.env.NEXT_PUBLIC_ADMIN_PIN ||
    'GoTall@Admin2026'
  ).trim()

  if (!incomingToken || incomingToken !== validToken) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  // 2. Server environment credentials
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://xoxhmugmtzscmjlbpfuj.supabase.co'
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // Fetch counts from database tables in parallel
    const [
      usersRes,
      stretchesRes,
      mealsRes,
      badgesRes,
      sleepRes,
      storageStretchesRes,
      storageFoodsRes,
      storageBadgesRes,
    ] = await Promise.allSettled([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('stretches').select('*', { count: 'exact', head: true }),
      supabase.from('meals').select('*', { count: 'exact', head: true }),
      supabase.from('achievements').select('*', { count: 'exact', head: true }),
      supabase.from('sleep_logs').select('*', { count: 'exact', head: true }),
      supabase.storage.from('exercise-media').list('stretches', { limit: 100 }),
      supabase.storage.from('exercise-media').list('foods', { limit: 100 }),
      supabase.storage.from('exercise-media').list('badges', { limit: 100 }),
    ])

    const usersCount = usersRes.status === 'fulfilled' ? usersRes.value.count || 0 : 0
    const stretchesCount = stretchesRes.status === 'fulfilled' ? stretchesRes.value.count || 0 : 0
    const mealsCount = mealsRes.status === 'fulfilled' ? mealsRes.value.count || 0 : 0
    const badgesCount = badgesRes.status === 'fulfilled' ? badgesRes.value.count || 0 : 0
    const sleepCount = sleepRes.status === 'fulfilled' ? sleepRes.value.count || 0 : 0

    // Collect storage files
    const stretchFiles = (storageStretchesRes.status === 'fulfilled' && storageStretchesRes.value.data)
      ? storageStretchesRes.value.data.map((f) => ({
          name: f.name,
          folder: 'stretches',
          size: f.metadata?.size || 180000,
          created_at: f.created_at,
          mimetype: f.metadata?.mimetype || 'image/jpeg',
          url: `${supabaseUrl}/storage/v1/object/public/exercise-media/stretches/${f.name}`,
        }))
      : []

    const foodFiles = (storageFoodsRes.status === 'fulfilled' && storageFoodsRes.value.data)
      ? storageFoodsRes.value.data.map((f) => ({
          name: f.name,
          folder: 'foods',
          size: f.metadata?.size || 120000,
          created_at: f.created_at,
          mimetype: f.metadata?.mimetype || 'image/jpeg',
          url: `${supabaseUrl}/storage/v1/object/public/exercise-media/foods/${f.name}`,
        }))
      : []

    const badgeFiles = (storageBadgesRes.status === 'fulfilled' && storageBadgesRes.value.data)
      ? storageBadgesRes.value.data.map((f) => ({
          name: f.name,
          folder: 'badges',
          size: f.metadata?.size || 95000,
          created_at: f.created_at,
          mimetype: f.metadata?.mimetype || 'image/png',
          url: `${supabaseUrl}/storage/v1/object/public/exercise-media/badges/${f.name}`,
        }))
      : []

    const allFiles = [...stretchFiles, ...foodFiles, ...badgeFiles]
    const mediaTotalBytes = allFiles.reduce((acc, f) => acc + (f.size || 0), 0)

    // Calculate approximate table sizes in PostgreSQL
    const estimatedDbSizeBytes =
      35 * 1024 * 1024 + // Base system catalog ~35MB
      usersCount * 4096 + // ~4KB per user profile with JSONB
      stretchesCount * 8192 + // ~8KB per exercise with instruction arrays
      mealsCount * 2048 + // ~2KB per meal row
      badgesCount * 1024 + // ~1KB per achievement badge
      sleepCount * 1024 // ~1KB per sleep log

    return NextResponse.json({
      db_size_bytes: estimatedDbSizeBytes,
      db_limit_bytes: 500 * 1024 * 1024, // 500 MB
      media_total_bytes: mediaTotalBytes,
      media_limit_bytes: 1024 * 1024 * 1024, // 1 GB (1,024 MB)
      media_file_count: allFiles.length,
      users_count: usersCount,
      files: allFiles,
      tables: {
        profiles: { count: usersCount, estimatedBytes: usersCount * 4096 },
        stretches: { count: stretchesCount, estimatedBytes: stretchesCount * 8192 },
        meals: { count: mealsCount, estimatedBytes: mealsCount * 2048 },
        achievements: { count: badgesCount, estimatedBytes: badgesCount * 1024 },
        sleep_logs: { count: sleepCount, estimatedBytes: sleepCount * 1024 },
      },
      supabase_url: supabaseUrl,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
