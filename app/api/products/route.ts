import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductRecord, serializeProduct } from '@/lib/admin-data'

export async function GET() {
  try {
    const products = await prisma.$queryRaw<ProductRecord[]>`
      SELECT * FROM "Product"
      WHERE "activo" = true
      ORDER BY "fechaCreacion" DESC
    `

    return NextResponse.json({ products: products.map(serializeProduct) }, { status: 200 })
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
