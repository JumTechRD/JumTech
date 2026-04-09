import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const AUTH_COOKIE_NAME = 'admin_session'

export async function verifyAuth(request: NextRequest) {
  try {
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return { user: null, error: 'No token provided' }
    }

    const verified = await verifyToken(token)
    return { user: verified.payload as any, error: null }
  } catch (error) {
    return { user: null, error: 'Invalid token' }
  }
}

export async function requireAdmin(request: NextRequest) {
  const { user, error } = await verifyAuth(request)

  if (error || !user) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  if (user.role !== 'ADMIN') {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      ),
    }
  }

  return { isAuthorized: true, user }
}
