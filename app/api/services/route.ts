import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { sanitizeString } from '@/lib/auth'

// GET all services (public)
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(services, { status: 200 })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST create service (admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const body = await request.json()
    const { title, description, image } = body

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    if (typeof title !== 'string' || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Title and description must be strings' },
        { status: 400 }
      )
    }

    const sanitizedTitle = sanitizeString(title)
    const sanitizedDescription = sanitizeString(description)
    const sanitizedImage = image ? sanitizeString(image) : null

    const service = await prisma.service.create({
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        image: sanitizedImage,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

// PUT update service (admin only)
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const body = await request.json()
    const { id, title, description, image } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const sanitizedTitle = sanitizeString(title)
    const sanitizedDescription = sanitizeString(description)
    const sanitizedImage = image ? sanitizeString(image) : null

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title: sanitizedTitle,
        description: sanitizedDescription,
        image: sanitizedImage,
      },
    })

    return NextResponse.json(updatedService, { status: 200 })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE service (admin only)
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) {
    return auth.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
