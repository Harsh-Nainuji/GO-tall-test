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

// GET: Load live catalog & CRM data from all Supabase tables
export async function GET(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  const supabase = getSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const entity = searchParams.get('entity')

  try {
    const results: Record<string, any> = {}

    // Stretches (Exercises)
    if (!entity || entity === 'stretches') {
      const { data } = await supabase
        .from('stretches')
        .select('*')
        .order('sort_order', { ascending: true })

      if (data && data.length > 0) {
        results.stretches = data.map((s: any) => ({
          id: String(s.id),
          title: s.title,
          category: s.category || 'Height Growth',
          targetZone: s.target_zone || 'Lumbar Decompression',
          durationSeconds: Number(s.duration_seconds) || 60,
          intensity: s.intensity || 'Beginner',
          clinicalBenefit: s.clinical_benefit || '',
          instructions: Array.isArray(s.instructions)
            ? s.instructions
            : typeof s.instructions === 'string'
            ? [s.instructions]
            : [],
          contraindications: s.contraindications || undefined,
          active: s.active ?? true,
          order: s.sort_order || 1,
          media_url: s.media_url || undefined,
          media_type: s.media_type || undefined,
        }))
      }
    }

    // Workout Categories
    if (!entity || entity === 'categories') {
      const { data } = await supabase
        .from('workout_categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (data && data.length > 0) {
        results.categories = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || '🌱',
          description: c.description || '',
          color: c.color || '#06b6d4',
          workoutIds: [],
          active: c.active ?? true,
          order: c.sort_order || 1,
        }))
      }
    }

    // Category Questions
    if (!entity || entity === 'questions') {
      const { data } = await supabase
        .from('category_questions')
        .select('*')
        .order('sort_order', { ascending: true })

      if (data && data.length > 0) {
        results.categoryQuestions = data.map((q: any) => ({
          id: q.id,
          categoryId: q.category_id,
          questionText: q.question_text,
          subtitle: q.subtitle || '',
          options: Array.isArray(q.options) ? q.options : [],
          active: q.active ?? true,
          order: q.sort_order || 1,
        }))
      }
    }

    // Badges / Achievements
    if (!entity || entity === 'badges') {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        results.badges = data.map((b: any) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          icon: b.icon,
          icon_url: b.icon_url,
          category: b.category,
          metricTrigger: b.target_metric,
          targetValue: Number(b.target_value) || 1,
          xpReward: Number(b.xp_reward) || 50,
          tier: b.tier || 'bronze',
          active: b.active ?? true,
          unlockedCount: 0,
        }))
      }
    }

    // Users CRM / Profiles & Supabase Auth Accounts
    if (!entity || entity === 'users') {
      const [profilesRes, authUsersRes] = await Promise.allSettled([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.auth.admin.listUsers({ page: 1, perPage: 200 }).catch(() => ({ data: { users: [] } })),
      ])

      const profilesData = profilesRes.status === 'fulfilled' ? (profilesRes.value as any)?.data : []
      const profiles = (profilesData && Array.isArray(profilesData)) ? profilesData : []
      const authUsers = (authUsersRes.status === 'fulfilled' && (authUsersRes.value as any)?.data?.users)
        ? (authUsersRes.value as any).data.users
        : []

      const userMap = new Map<string, any>()

      // 1. First add from profiles
      for (const u of profiles) {
        const key = u.id || u.user_id || u.email
        if (key) {
          userMap.set(key, {
            id: u.id || u.user_id,
            name: u.name || 'Anonymous User',
            email: u.email || 'user@tallgrame.app',
            gender: u.gender || 'Male',
            age: Number(u.age) || 16,
            currentHeight: Number(u.current_height) || 170,
            predictedHeight: Number(u.predicted_height) || 178,
            potentialGain: Number(u.potential_gain) || 8,
            growthPlateStatus: u.growth_plate_status || 'Open (Accelerated)',
            tannerStage: Number(u.tanner_stage) || 2,
            fatherHeight: Number(u.father_height) || 175,
            motherHeight: Number(u.mother_height) || 162,
            midParentalTarget: Math.round(((Number(u.father_height) || 175) + (Number(u.mother_height) || 162)) / 2),
            streakDays: Number(u.streak_days) || 0,
            stretchesCompleted: Number(u.stretches_completed) || 0,
            nutritionLoggedCount: 0,
            unlockedBadgesCount: 0,
            subscriptionTier: u.subscription_tier || (u.subscription_status === 'pro_annual' ? 'Pro Annual' : u.subscription_status === 'pro_monthly' ? 'Pro Monthly' : 'Free'),
            joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-01-01',
            lastActive: 'Active today',
            recentActivity: 'Synced profile',
          })
        }
      }

      // 2. Then merge from auth users (captures anyone signed up via Auth before profile creation)
      for (const au of authUsers) {
        const key = au.id
        const existing = userMap.get(key) || userMap.get(au.email)
        if (!existing) {
          userMap.set(key, {
            id: au.id,
            name: au.user_metadata?.display_name || au.user_metadata?.name || au.email?.split('@')[0] || 'App Member',
            email: au.email || 'user@tallgrame.app',
            gender: au.user_metadata?.gender || 'Male',
            age: Number(au.user_metadata?.age) || 16,
            currentHeight: Number(au.user_metadata?.current_height) || 170,
            predictedHeight: Number(au.user_metadata?.predicted_height) || 178,
            potentialGain: Number(au.user_metadata?.potential_gain) || 8,
            growthPlateStatus: 'Open (Accelerated)',
            tannerStage: 3,
            fatherHeight: 175,
            motherHeight: 162,
            midParentalTarget: 168.5,
            streakDays: 1,
            stretchesCompleted: 0,
            nutritionLoggedCount: 0,
            unlockedBadgesCount: 0,
            subscriptionTier: au.user_metadata?.subscription_tier || 'Free',
            joinDate: au.created_at ? new Date(au.created_at).toISOString().split('T')[0] : '2026-01-01',
            lastActive: 'Registered account',
            recentActivity: 'Signed up in mobile app',
          })
        }
      }

      if (userMap.size > 0) {
        results.users = Array.from(userMap.values())
      }
    }

    return NextResponse.json(results)
  } catch (err: any) {
    console.error('Sync GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Upsert data into Supabase tables based on entity type
export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  const supabase = getSupabaseServerClient()

  try {
    const body = await request.json()
    const { entity, items } = body

    if (!entity || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid payload: entity and items array required' },
        { status: 400 }
      )
    }

    if (entity === 'stretches') {
      const rows = items.map((s: any, idx: number) => {
        const rawNum = parseInt(String(s.id).replace(/\D/g, ''), 10)
        const numId = !isNaN(rawNum) && rawNum > 0 && rawNum <= 2147483647 ? rawNum : idx + 100
        return {
          id: numId,
          title: s.title,
          category: s.category || 'Height Growth',
          tag: s.tag || 'Axial Traction',
          target_zone: s.targetZone || 'Lumbar Decompression',
          duration_seconds: Math.round(Number(s.durationSeconds) || 60),
          intensity: s.intensity || 'Beginner',
          clinical_benefit: s.clinicalBenefit || '',
          instructions: s.instructions || [],
          contraindications: s.contraindications || null,
          media_type: s.media_type || (s.media_url?.includes('.mp4') ? 'video' : 'image'),
          media_url: s.media_url || null,
          active: s.active !== false,
          sort_order: s.order || idx + 1,
        }
      })

      const { error } = await supabase.from('stretches').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    } else if (entity === 'categories') {
      const rows = items.map((c: any, idx: number) => ({
        id: c.id || `cat-${idx + 1}`,
        name: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        icon: c.icon || '🌱',
        description: c.description || '',
        color: c.color || '#06b6d4',
        active: c.active !== false,
        sort_order: c.order || idx + 1,
      }))

      const { error } = await supabase.from('workout_categories').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    } else if (entity === 'questions') {
      const rows = items.map((q: any, idx: number) => ({
        id: q.id || `cq-${idx + 1}`,
        category_id: q.categoryId,
        question_text: q.questionText,
        subtitle: q.subtitle || '',
        options: q.options || [],
        active: q.active !== false,
        sort_order: q.order || idx + 1,
      }))

      const { error } = await supabase.from('category_questions').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    } else if (entity === 'badges') {
      const rows = items.map((b: any, idx: number) => ({
        id: b.id || `badge-${idx + 1}`,
        title: b.title,
        description: b.description,
        icon: b.icon,
        icon_url: b.icon_url,
        category: b.category || 'stretches',
        target_metric: b.metricTrigger || 'streak_days',
        target_value: Math.round(Number(b.targetValue) || 1),
        xp_reward: Math.round(Number(b.xpReward) || 50),
        tier: b.tier || 'bronze',
        active: b.active !== false,
      }))

      const { error } = await supabase.from('achievements').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    } else if (entity === 'users') {
      const rows = items.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        gender: u.gender,
        age: u.age,
        current_height: u.currentHeight,
        father_height: u.fatherHeight,
        mother_height: u.motherHeight,
        tanner_stage: u.tannerStage,
        growth_plate_status: u.growthPlateStatus,
        predicted_height: u.predictedHeight,
        potential_gain: u.potentialGain,
        streak_days: u.streakDays,
        stretches_completed: u.stretchesCompleted,
        subscription_status: u.subscriptionTier === 'Pro Annual' ? 'pro_annual' : u.subscriptionTier === 'Pro Monthly' ? 'pro_monthly' : 'free',
      }))

      const { error } = await supabase.from('profiles').upsert(rows, { onConflict: 'id' })
      if (error) throw error
    }

    return NextResponse.json({ success: true, count: items.length })
  } catch (err: any) {
    console.error('Sync POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Delete an item from Supabase tables based on entity type and id
export async function DELETE(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  const supabase = getSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const entity = searchParams.get('entity')
  const id = searchParams.get('id')

  if (!entity || !id) {
    return NextResponse.json(
      { error: 'Missing entity or id query parameter' },
      { status: 400 }
    )
  }

  try {
    let tableName = ''
    let idColumn = 'id'
    let idValue: any = id

    switch (entity) {
      case 'stretches':
        tableName = 'stretches'
        idValue = parseInt(String(id).replace(/\D/g, ''), 10) || id
        break
      case 'categories':
        tableName = 'workout_categories'
        break
      case 'questions':
        tableName = 'category_questions'
        break
      case 'badges':
        tableName = 'achievements'
        break
      case 'users': {
        // Cascade delete all child records and auth user
        // 1. Fetch user profile to get user_id and profile id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, user_id')
          .or(`id.eq.${id},user_id.eq.${id}`)
          .maybeSingle()

        const profileId = profile?.id || id
        const authUserId = profile?.user_id || (id.length === 36 ? id : null)

        // 2. Cascade delete records from all user-related tables
        await Promise.allSettled([
          authUserId ? supabase.from('user_achievements').delete().eq('user_id', authUserId) : Promise.resolve(),
          profileId ? supabase.from('user_achievements').delete().eq('user_id', profileId) : Promise.resolve(),
          authUserId ? supabase.from('meals').delete().eq('user_id', authUserId) : Promise.resolve(),
          profileId ? supabase.from('meals').delete().eq('user_id', profileId) : Promise.resolve(),
          authUserId ? supabase.from('sleep_logs').delete().eq('user_id', authUserId) : Promise.resolve(),
          profileId ? supabase.from('sleep_logs').delete().eq('user_id', profileId) : Promise.resolve(),
          authUserId ? supabase.from('daily_logs').delete().eq('user_id', authUserId) : Promise.resolve(),
          profileId ? supabase.from('daily_logs').delete().eq('user_id', profileId) : Promise.resolve(),
          supabase.from('profiles').delete().or(`id.eq.${profileId}${authUserId ? `,user_id.eq.${authUserId}` : ''}`),
        ])

        // 3. Delete from Supabase Auth admin so the user is completely eradicated
        if (authUserId) {
          try {
            await supabase.auth.admin.deleteUser(authUserId)
          } catch (authErr) {
            console.warn('[Sync API] Could not delete from auth.users (user may not be an auth UUID):', authErr)
          }
        }

        return NextResponse.json({ success: true, deleted: id, purgedCascade: true })
      }
      default:
        return NextResponse.json({ error: 'Unsupported entity' }, { status: 400 })
    }

    const { error } = await supabase.from(tableName).delete().eq(idColumn, idValue)
    if (error) throw error

    return NextResponse.json({ success: true, deleted: id })
  } catch (err: any) {
    console.error('Sync DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
