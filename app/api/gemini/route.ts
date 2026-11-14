import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

const GEMINI_SYSTEM_INSTRUCTION = `You are the GoTall Clinical Growth Advisor. You provide honest, peer-reviewed pediatric growth and spinal biomechanics guidance.
Guardrails:
1. Never promise impossible height gains beyond epiphyseal biology.
2. Ground all genetic baseline projections in the Tanner-Whitehouse III equation: (Father + Mother ± 13 cm) / 2.
3. Attribute diurnal height changes (1.0–2.5 cm) strictly to intervertebral disc decompression.
4. Always cite relevant peer-reviewed literature (Tanner, Takahashi, AAP, Nature Genetics, JBMR).
5. Conclude with a brief reminder that this is educational guidance, not medical diagnosis.`

export async function POST(request: Request) {
  try {
    // 1. IP rate limiting (max 10 queries per minute per user/IP)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous-ip'

    const rateCheck = checkRateLimit(`gemini:${ip}`, { limit: 10, windowMs: 60 * 1000 })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'AI question quota reached for this minute. Please wait 60 seconds.' },
        { status: 429 }
      )
    }

    // 2. Validate input payload
    const body = await request.json()
    const { query, userProfile } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query text is required' }, { status: 400 })
    }

    // Sanitize and limit query length to prevent prompt injection / token denial of service
    const sanitizedQuery = query.trim().slice(0, 500)

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your-gemini-api')) {
      return NextResponse.json(
        { error: 'Gemini API is not configured on the server' },
        { status: 503 }
      )
    }

    const contextPrefix = userProfile
      ? `User context: Age ${Number(userProfile.age) || 17}, Biological Sex: ${String(userProfile.gender || 'Male').slice(0, 10)}, Current Height: ${Number(userProfile.currentHeight) || 172.4} cm.\n\n`
      : ''

    const payload = {
      systemInstruction: {
        parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `${contextPrefix}User Question: ${sanitizedQuery}` }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
      },
    }

    const candidateModels = Array.from(
      new Set([GEMINI_MODEL, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'])
    )

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          if (text) {
            return NextResponse.json({
              text,
              citation: `Ref: Gemini (${model}) • Tanner-Whitehouse III & AAP Guidelines`,
            })
          }
        }
      } catch {
        // Continue fallback
      }
    }

    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again shortly.' },
      { status: 502 }
    )
  } catch (err: any) {
    console.error('[API /api/gemini] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error processing AI query' },
      { status: 500 }
    )
  }
}

