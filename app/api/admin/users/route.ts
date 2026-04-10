import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, sanitizeString, validateEmail, validatePassword } from '@/lib/auth'
import { requireAdmin } from '@/lib/middleware'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const body = await request.json()
    const { email, password, role, permissions } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid input types' }, { status: 400 })
    }

    const sanitizedEmail = sanitizeString(email.toLowerCase().trim())
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const normalizedRole =
      role === UserRole.ADMIN || role === UserRole.CLIENT ? (role as UserRole) : UserRole.CLIENT

    const normalizedPermissions = Array.isArray(permissions)
      ? permissions
          .filter((permission): permission is string => typeof permission === 'string')
          .map((permission) => sanitizeString(permission))
          .filter(Boolean)
      : []

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        role: normalizedRole,
        permissions: normalizedPermissions,
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

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
