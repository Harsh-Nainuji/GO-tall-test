// In-memory sliding-window rate limiter for Edge/Node Next.js API routes

interface RateLimitRecord {
  timestamps: number[]
}

const ipMap = new Map<string, RateLimitRecord>()

// Clean up stale entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of ipMap.entries()) {
      const valid = record.timestamps.filter((t) => now - t < 60000)
      if (valid.length === 0) {
        ipMap.delete(ip)
      } else {
        record.timestamps = valid
      }
    }
  }, 10 * 60 * 1000)
}

export interface RateLimitOptions {
  limit?: number // Max requests allowed
  windowMs?: number // Time window in milliseconds (default 1 minute)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetMs: number } {
  const limit = options.limit || 10
  const windowMs = options.windowMs || 60 * 1000
  const now = Date.now()

  let record = ipMap.get(identifier)
  if (!record) {
    record = { timestamps: [] }
    ipMap.set(identifier, record)
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs)

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0]
    const resetMs = Math.max(0, windowMs - (now - oldest))
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    }
  }

  record.timestamps.push(now)
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  }
}

