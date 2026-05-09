import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { normalizeProductInput, ProductRecord, serializeProduct } from '@/lib/admin-data'

type NormalizedProductInput = ReturnType<typeof normalizeProductInput>

function buildProductData(product: NormalizedProductInput): Prisma.ProductCreateInput {
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
    fechaCreacion: product.fechaCreacion,
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

function logCreateProductError(error: unknown, productData: NormalizedProductInput | null) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('Error creating product: prisma-known-request-error', {
      code: error.code,
      meta: error.meta,
      productData,
    })
    return
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('Error creating product: prisma-validation-error', {
      message: error.message,
      productData,
    })
    return
  }

  console.error('Error creating product: unknown-error', {
    error,
    productData,
  })
}

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

  let productData: NormalizedProductInput | null = null

  try {
    const body = (await request.json()) as Record<string, unknown>
    productData = normalizeProductInput(body)

    if (!productData.nombre || !productData.descripcion || !productData.categoria) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 })
    }

    const createdProduct = await prisma.product.create({
      data: buildProductData(productData),
    })

    return NextResponse.json({ product: serializeProduct(createdProduct as ProductRecord) }, { status: 201 })
  } catch (error) {
    logCreateProductError(error, productData)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
