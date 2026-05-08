import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateEmail, sanitizeString } from '@/lib/auth'
import { requireAdmin } from '@/lib/middleware'

const serviceOptions: Record<string, { title: string; description: string }> = {
  mantenimiento: {
    title: 'Mantenimiento de Computadoras',
    description: 'Solicitud de mantenimiento de computadoras desde el formulario público',
  },
  camaras: {
    title: 'Instalación de Cámaras NVR',
    description: 'Solicitud de instalación de cámaras NVR desde el formulario público',
  },
  cableado: {
    title: 'Cableado Estructurado',
    description: 'Solicitud de cableado estructurado desde el formulario público',
  },
  desarrollo: {
    title: 'Desarrollo de Aplicaciones',
    description: 'Solicitud de desarrollo de aplicaciones desde el formulario público',
  },
  redes: {
    title: 'Gestión de Redes',
    description: 'Solicitud de gestión de redes desde el formulario público',
  },
  ciberseguridad: {
    title: 'Ciberseguridad',
    description: 'Solicitud de ciberseguridad desde el formulario público',
  },
  multiple: {
    title: 'Múltiples Servicios',
    description: 'Solicitud de múltiples servicios desde el formulario público',
  },
  otro: {
    title: 'Otro',
    description: 'Solicitud de otro servicio desde el formulario público',
  },
}

async function resolveServiceId(serviceId?: unknown, service?: unknown) {
  if (typeof serviceId === 'string' && serviceId.trim()) {
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    return existingService?.id ?? null
  }

  if (typeof service !== 'string') {
    return null
  }

  const serviceOption = serviceOptions[service]
  if (!serviceOption) {
    return null
  }

  const existingService = await prisma.service.findFirst({
    where: { title: serviceOption.title },
  })

  if (existingService) {
    return existingService.id
  }

  const createdService = await prisma.service.create({
    data: serviceOption,
  })

  return createdService.id
}

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
    const { name, email, phone, message, serviceId, service } = body

    // Validation
    if (!name || !email || !phone || !message || (!serviceId && !service)) {
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

    const resolvedServiceId = await resolveServiceId(serviceId, service)

    if (!resolvedServiceId) {
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
        serviceId: resolvedServiceId,
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
