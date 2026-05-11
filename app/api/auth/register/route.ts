import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validateEmail, validatePassword, sanitizeString } from '@/lib/auth'

function parseRegistration(body: unknown) {
  if (!body || typeof body !== 'object') return null

  const record = body as Record<string, unknown>
  const email = typeof record.email === 'string' ? record.email.trim().toLowerCase() : ''
  const password = typeof record.password === 'string' ? record.password : ''

  if (!email || !password) return null

  return { email, password }
}

export async function POST(request: NextRequest) {
  try {
    const credentials = parseRegistration(await request.json().catch(() => null))
    if (!credentials) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const sanitizedEmail = sanitizeString(credentials.email)

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (!validatePassword(credentials.password)) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(credentials.password)
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
      },
    })

    // Don't return password in response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}
