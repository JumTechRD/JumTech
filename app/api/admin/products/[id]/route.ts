import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { normalizeProductInput, ProductRecord, serializeProduct } from '@/lib/admin-data'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const body = (await request.json()) as Record<string, unknown>
    const product = normalizeProductInput(body)

    if (!product.nombre || !product.descripcion || !product.categoria) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 })
    }

    const [updatedProduct] = await prisma.$queryRaw<ProductRecord[]>`
      UPDATE "Product"
      SET
        "nombre" = ${product.nombre},
        "descripcion" = ${product.descripcion},
        "precio" = ${product.precio},
        "categoria" = ${product.categoria},
        "imagen" = ${product.imagen},
        "stock" = ${product.stock},
        "rating" = ${product.rating},
        "especificaciones" = ${product.especificaciones},
        "activo" = ${product.activo},
        "fechaActualizacion" = ${new Date()},
        "precioCompra" = ${product.precioCompra},
        "margenGanancia" = ${product.margenGanancia},
        "proveedor" = ${product.proveedor},
        "codigoBarras" = ${product.codigoBarras},
        "sku" = ${product.sku},
        "peso" = ${product.peso},
        "dimensiones" = ${product.dimensiones ? JSON.stringify(product.dimensiones) : null}::jsonb,
        "garantia" = ${product.garantia},
        "ubicacion" = ${product.ubicacion},
        "stockMinimo" = ${product.stockMinimo},
        "stockMaximo" = ${product.stockMaximo},
        "vendido" = ${product.vendido},
        "ultimaVenta" = ${product.ultimaVenta}
      WHERE "id" = ${id}
      RETURNING *
    `

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: serializeProduct(updatedProduct) }, { status: 200 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const deletedProducts = await prisma.$queryRaw<ProductRecord[]>`
      DELETE FROM "Product"
      WHERE "id" = ${id}
      RETURNING *
    `

    if (deletedProducts.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
