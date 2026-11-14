// Resend Email Integration for GoTall Biometric Suite
// Uses the official Resend REST API for high reliability across Edge and Node runtimes

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Core function to send transactional emails via Resend REST API
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'GoTall Growth Suite <onboarding@resend.dev>',
  replyTo = 'support@gotall.app',
}: SendEmailOptions): Promise<EmailResult> {
  const recipients = Array.isArray(to) ? to : [to]

  if (!RESEND_API_KEY || RESEND_API_KEY.includes('placeholder')) {
    console.warn('Resend API Key is missing or invalid')
    return { success: false, error: 'Missing Resend API Key' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        reply_to: replyTo,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend API returned error:', data)
      return {
        success: false,
        error: data.message || `Resend error (${res.status})`,
      }
    }

    return {
      success: true,
      id: data.id,
    }
  } catch (err: any) {
    console.error('Failed to dispatch email via Resend:', err)
    return {
      success: false,
      error: err.message || 'Network error communicating with Resend',
    }
  }
}

/**
 * 1. Welcome & Growth Target Confirmation Email
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  targetHeight: number,
  predictedGain: number
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; margin: 0; padding: 40px 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 32px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); }
          .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 24px; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .tagline { color: #94a3b8; font-size: 13px; margin-top: 4px; }
          .metric-box { background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
          .metric-val { font-size: 36px; font-weight: 900; color: #38bdf8; }
          .metric-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #cbd5e1; letter-spacing: 0.05em; margin-top: 4px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; margin-top: 20px; }
          .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GOTALL</div>
            <div class="tagline">Clinical Biometric Growth & Posture Suite</div>
          </div>
          <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #ffffff;">Welcome to GoTall, ${name}!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Your biometric profile has been successfully initialized. Based on your Tanner-Whitehouse 3 skeletal modeling, your personalized growth roadmap is now active.
          </p>

          <div class="metric-box">
            <div class="metric-val">+${predictedGain.toFixed(1)} cm</div>
            <div class="metric-label">Estimated Potential Gain &bull; Target: ${targetHeight.toFixed(1)} cm</div>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
            To achieve optimal intervertebral disc rehydration and somatotropin pulse synchrony, make sure to log your daily stretches, sleep window, and clinical nutrition in the app.
          </p>

          <div style="text-align: center;">
            <a href="https://gotall.app" class="btn">Open GoTall App</a>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} GoTall Biometrics. Designed for adolescent growth plate optimization and spinal posture health.
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Your Personalized GoTall Target: +${predictedGain.toFixed(1)} cm Stature Projection`,
    html,
  })
}

/**
 * 2. Weekly Growth Report Email
 */
export async function sendGrowthReportEmail(
  to: string,
  name: string,
  metrics: {
    streakDays: number
    stretchesCompleted: number
    avgSleep: number
    proteinHitRate: string
  }
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <h2 style="color: #38bdf8; margin: 0 0 8px 0;">Weekly Biometric Summary for ${name}</h2>
          <p style="color: #94a3b8; font-size: 13px;">Here is your clinical compliance report for the past 7 days:</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0;">
            <div style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 24px; font-weight: 800; color: #f59e0b;">${metrics.streakDays} Days</div>
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Active Streak</div>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 24px; font-weight: 800; color: #10b981;">${metrics.stretchesCompleted}</div>
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Stretches Done</div>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 24px; font-weight: 800; color: #6366f1;">${metrics.avgSleep} hrs</div>
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Avg Sleep Window</div>
            </div>
            <div style="background: rgba(255,255,255,0.04); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 24px; font-weight: 800; color: #ec4899;">${metrics.proteinHitRate}</div>
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Protein Target Hit</div>
            </div>
          </div>

          <p style="color: #cbd5e1; font-size: 13px;">Keep up the discipline! Consistency during adolescence is the single greatest determinant of reaching your biological height ceiling.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `GoTall Weekly Progress: ${metrics.streakDays}-Day Traction Streak`,
    html,
  })
}

/**
 * Quick ping test to verify the Resend API connection status
 */
export async function testResendConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch('https://api.resend.com/api-keys', {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    })
    if (res.ok) {
      return { ok: true, message: 'Resend API Key is active and verified.' }
    }
    return { ok: false, message: `Resend status: ${res.statusText}` }
  } catch (e: any) {
    return { ok: false, message: e.message }
  }
}
