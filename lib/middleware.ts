import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return { user: null, error: 'No token provided' }
    }

    const verified = await jwtVerify(token, JWT_SECRET)
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
