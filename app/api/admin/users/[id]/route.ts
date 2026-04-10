import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, sanitizeString, validatePassword } from '@/lib/auth'
import { requireAdmin } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const { role, permissions, password } = body

    const normalizedRole =
      role === UserRole.ADMIN || role === UserRole.CLIENT ? (role as UserRole) : undefined

    const normalizedPermissions = Array.isArray(permissions)
      ? permissions
          .filter((permission): permission is string => typeof permission === 'string')
          .map((permission) => sanitizeString(permission))
          .filter(Boolean)
      : undefined

    let normalizedPassword: string | undefined
    if (typeof password === 'string' && password.trim().length > 0) {
      if (!validatePassword(password)) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
      }
      normalizedPassword = await hashPassword(password)
    }

    if (!normalizedRole && !normalizedPermissions && !normalizedPassword) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        role: normalizedRole,
        permissions: normalizedPermissions,
        password: normalizedPassword,
      },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const { id } = await context.params

    if (auth.user.userId === id) {
      return NextResponse.json({ error: 'You cannot delete your own user' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
