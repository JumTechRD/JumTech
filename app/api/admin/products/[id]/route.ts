import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { normalizeProductInput, ProductRecord, serializeProduct } from '@/lib/admin-data'

function buildProductData(product: ReturnType<typeof normalizeProductInput>) {
  return {
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    categoria: product.categoria,
    imagen: product.imagen ?? undefined,
    stock: product.stock,
    rating: product.rating,
    especificaciones: product.especificaciones,
    activo: product.activo,
    precioCompra: product.precioCompra ?? undefined,
    margenGanancia: product.margenGanancia ?? undefined,
    proveedor: product.proveedor ?? undefined,
    codigoBarras: product.codigoBarras ?? undefined,
    sku: product.sku ?? undefined,
    peso: product.peso ?? undefined,
    dimensiones: product.dimensiones ?? undefined,
    garantia: product.garantia ?? undefined,
    ubicacion: product.ubicacion ?? undefined,
    stockMinimo: product.stockMinimo ?? undefined,
    stockMaximo: product.stockMaximo ?? undefined,
    vendido: product.vendido,
    ultimaVenta: product.ultimaVenta ?? undefined,
  }
}

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  let productData: ReturnType<typeof normalizeProductInput> | null = null

  try {
    const { id } = await context.params
    const body = (await request.json()) as Record<string, unknown>
    productData = normalizeProductInput(body)

    if (!productData.nombre || !productData.descripcion || !productData.categoria) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: buildProductData(productData),
    })

    return NextResponse.json({ product: serializeProduct(updatedProduct as ProductRecord) }, { status: 200 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    console.error('Error updating product:', { error, product: productData })
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
