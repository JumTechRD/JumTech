import { NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'admin_session'

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 })
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
