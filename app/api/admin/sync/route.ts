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

    // Users CRM / Profiles
    if (!entity || entity === 'users') {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        results.users = data.map((u: any) => ({
          id: u.id || u.user_id,
          name: u.name || 'Anonymous User',
          email: u.email || 'user@gotall.app',
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
          subscriptionTier: u.subscription_status === 'pro_annual' ? 'Pro Annual' : u.subscription_status === 'pro_monthly' ? 'Pro Monthly' : 'Free',
          joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-01-01',
          lastActive: 'Today',
          recentActivity: 'Synced profile',
        }))
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
        const numId = parseInt(String(s.id).replace(/\D/g, ''), 10)
        return {
          id: isNaN(numId) || numId <= 0 ? idx + 100 : numId,
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
      case 'users':
        tableName = 'profiles'
        break
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
