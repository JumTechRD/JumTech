import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import {
  AdminQuoteItemRecord,
  AdminQuoteRecord,
  normalizeAdminQuoteInput,
  serializeAdminQuote,
} from '@/lib/admin-data'

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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const quotes = await prisma.$queryRaw<AdminQuoteRecord[]>`
      SELECT * FROM "AdminQuote"
      ORDER BY "fecha" DESC
    `

    const quoteIds = quotes.map((quote) => quote.id)
    const items =
      quoteIds.length > 0
        ? await prisma.$queryRaw<AdminQuoteItemRecord[]>(
            Prisma.sql`
              SELECT * FROM "AdminQuoteItem"
              WHERE "adminQuoteId" IN (${Prisma.join(quoteIds)})
              ORDER BY "position" ASC
            `,
          )
        : []

    const itemsByQuote = new Map<string, AdminQuoteItemRecord[]>()
    for (const item of items) {
      itemsByQuote.set(item.adminQuoteId, [...(itemsByQuote.get(item.adminQuoteId) || []), item])
    }

    return NextResponse.json(
      { quotes: quotes.map((quote) => serializeAdminQuote(quote, itemsByQuote.get(quote.id) || [])) },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching admin quotes:', error)
    return NextResponse.json({ error: 'Failed to fetch admin quotes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const body = (await request.json()) as Record<string, unknown>
    const quote = normalizeAdminQuoteInput(body)

    if (!quote.cliente || !quote.email || quote.productos.length === 0) {
      return NextResponse.json({ error: 'Missing required quote fields' }, { status: 400 })
    }

    if (quote.clientId) {
      const client = await prisma.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "Client"
        WHERE "id" = ${quote.clientId}
        LIMIT 1
      `
      if (client.length === 0) {
        return NextResponse.json({ error: 'Selected client not found' }, { status: 404 })
      }
    }

    const createdQuote = await prisma.$transaction(async (tx) => {
      const [record] = await tx.$queryRaw<AdminQuoteRecord[]>`
        INSERT INTO "AdminQuote" (
          "id", "numeroFactura", "cliente", "email", "telefono", "clientId", "tipoServicio", "urgencia",
          "descripcionProyecto", "ubicacionProyecto", "fecha", "subtotal", "impuestos", "total", "estado",
          "notas", "monedaPrincipal", "itbisActivo", "porcentajeItbis", "updatedAt"
        )
        VALUES (
          ${crypto.randomUUID()}, ${quote.numeroFactura}, ${quote.cliente}, ${quote.email}, ${quote.telefono},
          ${quote.clientId}, ${quote.tipoServicio}, ${quote.urgencia}, ${quote.descripcionProyecto},
          ${quote.ubicacionProyecto}, ${quote.fecha}, ${quote.subtotal}, ${quote.impuestos}, ${quote.total},
          ${quote.estado}, ${quote.notas}, ${quote.monedaPrincipal}, ${quote.itbisActivo},
          ${quote.porcentajeItbis}, ${new Date()}
        )
        RETURNING *
      `

      await insertAdminQuoteItems(tx, record.id, quote.productos)
      return getAdminQuote(tx, record.id)
    })

    return NextResponse.json({ quote: createdQuote }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin quote:', error)
    return NextResponse.json({ error: 'Failed to create admin quote' }, { status: 500 })
  }
}
