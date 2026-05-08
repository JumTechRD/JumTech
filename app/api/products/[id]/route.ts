import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductRecord, serializeProduct } from '@/lib/admin-data'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: Params) {
  try {
    const { id } = await context.params
    const [product] = await prisma.$queryRaw<ProductRecord[]>`
      SELECT * FROM "Product"
      WHERE "id" = ${id} AND "activo" = true
      LIMIT 1
    `

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: serializeProduct(product) }, { status: 200 })
  } catch (error) {
    console.error('Error fetching public product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
