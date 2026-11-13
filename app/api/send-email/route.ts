import { NextResponse } from 'next/server'
import {
  sendEmail,
  sendWelcomeEmail,
  sendGrowthReportEmail,
  testResendConnection,
} from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, to, name, targetHeight, predictedGain, metrics, subject, html } = body

    if (action === 'test-connection') {
      const result = await testResendConnection()
      return NextResponse.json(result)
    }

    if (action === 'welcome') {
      if (!to || !name) {
        return NextResponse.json({ error: 'Missing to or name' }, { status: 400 })
      }
      const result = await sendWelcomeEmail(
        to,
        name,
        targetHeight || 178,
        predictedGain || 5.4
      )
      return NextResponse.json(result)
    }

    if (action === 'growth-report') {
      if (!to || !name) {
        return NextResponse.json({ error: 'Missing to or name' }, { status: 400 })
      }
      const result = await sendGrowthReportEmail(
        to,
        name,
        metrics || {
          streakDays: 7,
          stretchesCompleted: 14,
          avgSleep: 8.5,
          proteinHitRate: '92%',
        }
      )
      return NextResponse.json(result)
    }

    // Generic custom email
    if (to && subject && html) {
      const result = await sendEmail({ to, subject, html })
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid email request action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
