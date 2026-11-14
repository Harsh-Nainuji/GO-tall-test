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

// GET: Fetch all verified clinical foods from Supabase public.meals
export async function GET(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error reading from meals table:', error.message)
      return NextResponse.json({ foods: [], error: error.message }, { status: 500 })
    }

    const foods = (data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      servingSize: m.serving_size || '100g',
      category: m.category || 'High Protein',
      calories: Number(m.calories) || 0,
      protein: Number(m.protein) || 0,
      carbs: Number(m.carbs) || 0,
      fat: Number(m.fat) || 0,
      calcium: Number(m.calcium ?? 0),
      zinc: Number(m.zinc ?? 0),
      vitaminD3: Number(m.vitamin_d3 ?? 0),
      clinicalRationale: m.clinical_rationale || '',
      active: m.active ?? true,
    }))

    return NextResponse.json({ foods, count: foods.length })
  } catch (err: any) {
    console.error('Meals GET route error:', err)
    return NextResponse.json({ foods: [], error: err.message }, { status: 500 })
  }
}

// POST: Upsert single or bulk food items into Supabase public.meals
export async function POST(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const foodsToSave = Array.isArray(body.foods)
      ? body.foods
      : body.food
      ? [body.food]
      : []

    if (foodsToSave.length === 0) {
      return NextResponse.json({ error: 'No food items provided' }, { status: 400 })
    }

    const rows = foodsToSave.map((f: any) => ({
      id: String(f.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`),
      user_id: null, // System-level verified preset food
      name: String(f.name || '').trim(),
      serving_size: String(f.servingSize || '100g').trim(),
      category: String(f.category || 'High Protein').trim(),
      calories: Math.round(Number(f.calories) || 0),
      protein: Number(f.protein) || 0,
      carbs: Number(f.carbs) || 0,
      fat: Number(f.fat) || 0,
      calcium: Math.round(Number(f.calcium) || 0),
      zinc: Number(f.zinc) || 0,
      vitamin_d3: Math.round(Number(f.vitaminD3) || 0),
      clinical_rationale: String(f.clinicalRationale || '').trim(),
      active: f.active !== false,
    }))

    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('meals')
      .upsert(rows, { onConflict: 'id' })

    if (error) {
      console.error('Error upserting into public.meals:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      upsertedCount: rows.length,
      message: `Successfully saved ${rows.length} foods to Supabase live database.`,
    })
  } catch (err: any) {
    console.error('Meals POST route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Remove a food item from Supabase public.meals by id
export async function DELETE(request: Request) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing x-admin-token header' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing food id query parameter' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { error } = await supabase.from('meals').delete().eq('id', id)

    if (error) {
      console.error('Error deleting from public.meals:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deletedId: id })
  } catch (err: any) {
    console.error('Meals DELETE route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
