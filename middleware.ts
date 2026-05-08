import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const AUTH_COOKIE_NAME = 'admin_session'
const LOGIN_PATH = '/admin/login'

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = LOGIN_PATH
  loginUrl.search = ''
  return NextResponse.redirect(loginUrl)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === LOGIN_PATH) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return redirectToLogin(request)
  }

  try {
    const { payload } = await verifyToken(token)

    if (payload.role !== 'ADMIN') {
      return redirectToLogin(request)
    }

    return NextResponse.next()
  } catch {
    return redirectToLogin(request)
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
