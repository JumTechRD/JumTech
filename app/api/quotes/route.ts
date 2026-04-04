import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateEmail, sanitizeString } from '@/lib/auth'
import { requireAdmin } from '@/lib/middleware'

// GET all quote requests (admin only)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const quotes = await prisma.quoteRequest.findMany({
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(quotes, { status: 200 })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}

// POST create quote request (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, serviceId } = body

    // Validation
    if (!name || !email || !phone || !message || !serviceId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof phone !== 'string' || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input types' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.trim()
    if (cleanPhone.length < 7 || cleanPhone.length > 20) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name)
    const sanitizedEmail = sanitizeString(email.toLowerCase())
    const sanitizedPhone = sanitizeString(cleanPhone)
    const sanitizedMessage = sanitizeString(message)

    const quote = await prisma.quoteRequest.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        serviceId,
      },
      include: {
        service: true,
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote request:', error)
    return NextResponse.json(
      { error: 'Failed to create quote request' },
      { status: 500 }
    )
  }
}
