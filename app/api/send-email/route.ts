import { NextResponse } from 'next/server'
import {
  sendEmail,
  sendWelcomeEmail,
  sendGrowthReportEmail,
  testResendConnection,
} from '@/lib/resend'
import { checkRateLimit } from '@/lib/rate-limit'
import { verifyServerRequest } from '@/lib/security-auth'

// Email format validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export async function POST(request: Request) {
  try {
    // 1. IP extraction & rate limiting (max 5 requests per minute)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous-ip'

    const rateCheck = checkRateLimit(`email:${ip}`, { limit: 5, windowMs: 60 * 1000 })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before attempting to send another email.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
      )
    }

    // 2. Authentication check
    const auth = await verifyServerRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid authentication token or admin key required' },
        { status: 401 }
      )
    }

    // 3. Payload validation
    const body = await request.json()
    const { action, to, name, targetHeight, predictedGain, metrics, subject, html } = body

    if (action === 'test-connection') {
      if (!auth.isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
      }
      const result = await testResendConnection()
      return NextResponse.json(result)
    }

    // Validate recipient email address
    if (to) {
      const recipient = typeof to === 'string' ? to.trim() : to[0]
      if (!EMAIL_REGEX.test(recipient)) {
        return NextResponse.json({ error: 'Invalid recipient email format' }, { status: 400 })
      }
    }

    if (action === 'welcome') {
      if (!to || !name) {
        return NextResponse.json({ error: 'Missing recipient email or recipient name' }, { status: 400 })
      }

      // Sanitize name input
      const sanitizedName = String(name).slice(0, 80).replace(/[<>{}]/g, '')

      const result = await sendWelcomeEmail(
        to,
        sanitizedName,
        Math.min(250, Math.max(100, Number(targetHeight) || 178)),
        Math.min(30, Math.max(0, Number(predictedGain) || 5.4))
      )
      return NextResponse.json(result)
    }

    if (action === 'growth-report') {
      if (!to || !name) {
        return NextResponse.json({ error: 'Missing recipient email or recipient name' }, { status: 400 })
      }

      const sanitizedName = String(name).slice(0, 80).replace(/[<>{}]/g, '')

      const result = await sendGrowthReportEmail(
        to,
        sanitizedName,
        metrics || {
          streakDays: 7,
          stretchesCompleted: 14,
          avgSleep: 8.5,
          proteinHitRate: '92%',
        }
      )
      return NextResponse.json(result)
    }

    // Generic custom email - restricted ONLY to verified Admins to prevent open relay abuse
    if (to && subject && html) {
      if (!auth.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Custom email dispatch requires administrator permissions' },
          { status: 403 }
        )
      }

      const sanitizedSubject = String(subject).slice(0, 150).replace(/[\r\n]/g, '')
      const result = await sendEmail({ to, subject: sanitizedSubject, html })
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid email request action' }, { status: 400 })
  } catch (err: any) {
    // Hide internal system errors from response
    console.error('[API /api/send-email] Internal error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the request.' },
      { status: 500 }
    )
  }
}
