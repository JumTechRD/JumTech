import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import {
  AdminQuoteItemRecord,
  AdminQuoteRecord,
  normalizeAdminQuoteInput,
  serializeAdminQuote,
} from '@/lib/admin-data'

interface Params {
  params: Promise<{ id: string }>
}

async function getAdminQuote(db: any, id: string) {
  const [quote] = await db.$queryRaw<AdminQuoteRecord[]>`
    SELECT * FROM "AdminQuote"
    WHERE "id" = ${id}
    LIMIT 1
  `

  if (!quote) return null

  const items = await db.$queryRaw<AdminQuoteItemRecord[]>`
    SELECT * FROM "AdminQuoteItem"
    WHERE "adminQuoteId" = ${id}
    ORDER BY "position" ASC
  `

  return serializeAdminQuote(quote, items)
}

async function insertAdminQuoteItems(
  db: any,
  adminQuoteId: string,
  productos: ReturnType<typeof normalizeAdminQuoteInput>['productos'],
) {
  for (const producto of productos) {
    await db.$executeRaw`
      INSERT INTO "AdminQuoteItem" (
        "id", "adminQuoteId", "nombre", "descripcion", "precio", "categoria", "cantidad",
        "esManual", "moneda", "porcentajeExtra", "position"
      )
      VALUES (
        ${crypto.randomUUID()}, ${adminQuoteId}, ${producto.nombre}, ${producto.descripcion}, ${producto.precio},
        ${producto.categoria}, ${producto.cantidad}, ${producto.esManual}, ${producto.moneda},
        ${producto.porcentajeExtra}, ${producto.position}
      )
    `
  }
}

export async function PUT(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const body = (await request.json()) as Record<string, unknown>
    const quote = normalizeAdminQuoteInput(body)

    if (!quote.cliente || !quote.email || quote.productos.length === 0) {
      return NextResponse.json({ error: 'Missing required quote fields' }, { status: 400 })
    }

    const updatedQuote = await prisma.$transaction(async (tx) => {
      const updatedRecords = await tx.$queryRaw<AdminQuoteRecord[]>`
        UPDATE "AdminQuote"
        SET
          "numeroFactura" = ${quote.numeroFactura},
          "cliente" = ${quote.cliente},
          "email" = ${quote.email},
          "telefono" = ${quote.telefono},
          "fecha" = ${quote.fecha},
          "subtotal" = ${quote.subtotal},
          "impuestos" = ${quote.impuestos},
          "total" = ${quote.total},
          "estado" = ${quote.estado},
          "notas" = ${quote.notas},
          "monedaPrincipal" = ${quote.monedaPrincipal},
          "itbisActivo" = ${quote.itbisActivo},
          "porcentajeItbis" = ${quote.porcentajeItbis},
          "updatedAt" = ${new Date()}
        WHERE "id" = ${id}
        RETURNING *
      `

      if (updatedRecords.length === 0) return null

      await tx.$executeRaw`
        DELETE FROM "AdminQuoteItem"
        WHERE "adminQuoteId" = ${id}
      `
      await insertAdminQuoteItems(tx, id, quote.productos)
      return getAdminQuote(tx, id)
    })

    if (!updatedQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json({ quote: updatedQuote }, { status: 200 })
  } catch (error) {
    console.error('Error updating admin quote:', error)
    return NextResponse.json({ error: 'Failed to update admin quote' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const deletedQuotes = await prisma.$queryRaw<AdminQuoteRecord[]>`
      DELETE FROM "AdminQuote"
      WHERE "id" = ${id}
      RETURNING *
    `

    if (deletedQuotes.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting admin quote:', error)
    return NextResponse.json({ error: 'Failed to delete admin quote' }, { status: 500 })
  }
}
