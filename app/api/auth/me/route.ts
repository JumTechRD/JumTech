import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  return NextResponse.json({ user: auth.user }, { status: 200 })
}
