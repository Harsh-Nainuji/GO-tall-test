import { getSupabaseClient } from './supabase'

/**
 * Validates whether an incoming Request is authenticated as an admin or valid user
 */
export async function verifyServerRequest(request: Request): Promise<{
  authenticated: boolean
  userId?: string
  role?: string
  isAdmin: boolean
  error?: string
}> {
  const authHeader = request.headers.get('authorization') || ''
  const adminSecretHeader = request.headers.get('x-admin-secret') || ''
  const expectedAdminSecret = process.env.ADMIN_ACCESS_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  // 1. Direct admin secret header match (if configured)
  if (expectedAdminSecret && adminSecretHeader && adminSecretHeader === expectedAdminSecret) {
    return {
      authenticated: true,
      isAdmin: true,
      role: 'admin',
    }
  }

  // 2. Bearer token validation via Supabase Auth
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      return { authenticated: false, isAdmin: false, error: 'Empty bearer token' }
    }

    try {
      const client = getSupabaseClient()
      const { data: { user }, error } = await client.auth.getUser(token)

      if (error || !user) {
        return { authenticated: false, isAdmin: false, error: 'Invalid or expired session token' }
      }

      // Check if user is an admin
      const userRole = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role || 'user'
      const isAdmin = userRole === 'admin' || user.email === process.env.ADMIN_EMAIL

      return {
        authenticated: true,
        userId: user.id,
        role: userRole,
        isAdmin,
      }
    } catch (err: any) {
      return { authenticated: false, isAdmin: false, error: 'Failed validating auth token' }
    }
  }

  return {
    authenticated: false,
    isAdmin: false,
    error: 'Missing Authorization header or admin key',
  }
}

