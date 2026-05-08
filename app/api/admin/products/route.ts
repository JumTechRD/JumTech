import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { normalizeProductInput, ProductRecord, serializeProduct } from '@/lib/admin-data'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const products = await prisma.$queryRaw<ProductRecord[]>`
      SELECT * FROM "Product"
      ORDER BY "fechaCreacion" DESC
    `

    return NextResponse.json({ products: products.map(serializeProduct) }, { status: 200 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const body = (await request.json()) as Record<string, unknown>
    const product = normalizeProductInput(body)

    if (!product.nombre || !product.descripcion || !product.categoria) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 })
    }

    const now = new Date()
    const [createdProduct] = await prisma.$queryRaw<ProductRecord[]>`
      INSERT INTO "Product" (
        "id", "nombre", "descripcion", "precio", "categoria", "imagen", "stock", "rating",
        "especificaciones", "activo", "fechaCreacion", "fechaActualizacion", "precioCompra",
        "margenGanancia", "proveedor", "codigoBarras", "sku", "peso", "dimensiones",
        "garantia", "ubicacion", "stockMinimo", "stockMaximo", "vendido", "ultimaVenta"
      )
      VALUES (
        ${crypto.randomUUID()}, ${product.nombre}, ${product.descripcion}, ${product.precio}, ${product.categoria},
        ${product.imagen}, ${product.stock}, ${product.rating}, ${product.especificaciones}, ${product.activo},
        ${product.fechaCreacion}, ${now}, ${product.precioCompra}, ${product.margenGanancia},
        ${product.proveedor}, ${product.codigoBarras}, ${product.sku}, ${product.peso},
        ${product.dimensiones ? JSON.stringify(product.dimensiones) : null}::jsonb, ${product.garantia},
        ${product.ubicacion}, ${product.stockMinimo}, ${product.stockMaximo}, ${product.vendido}, ${product.ultimaVenta}
      )
      RETURNING *
    `

    return NextResponse.json({ product: serializeProduct(createdProduct) }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
