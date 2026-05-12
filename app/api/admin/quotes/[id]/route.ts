import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import {
  AdminQuoteItemRecord,
  AdminQuoteRecord,
  normalizeAdminQuoteInput,
  serializeAdminQuote,
} from '@/lib/admin-data'
import { createInvoiceFromQuote } from '@/lib/admin-invoice-service'

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

function mergeQuoteFields(
  existingQuote: AdminQuoteRecord,
  quote: ReturnType<typeof normalizeAdminQuoteInput>,
) {
  return {
    numeroFactura: quote.numeroFactura ?? existingQuote.numeroFactura,
    cliente: quote.cliente || existingQuote.cliente,
    email: quote.email || existingQuote.email,
    telefono: quote.telefono || existingQuote.telefono,
    clientId: quote.clientId ?? existingQuote.clientId,
    tipoServicio: quote.tipoServicio ?? existingQuote.tipoServicio,
    urgencia: quote.urgencia ?? existingQuote.urgencia,
    descripcionProyecto: quote.descripcionProyecto ?? existingQuote.descripcionProyecto,
    ubicacionProyecto: quote.ubicacionProyecto ?? existingQuote.ubicacionProyecto,
    fecha: quote.fecha,
    subtotal: quote.subtotal,
    impuestos: quote.impuestos,
    total: quote.total,
    estado: quote.estado,
    notas: quote.notas ?? existingQuote.notas,
    monedaPrincipal: quote.monedaPrincipal ?? existingQuote.monedaPrincipal,
    itbisActivo: quote.itbisActivo,
    porcentajeItbis: quote.porcentajeItbis ?? existingQuote.porcentajeItbis,
  }
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

    const updatedQuote = await prisma.$transaction(async (tx) => {
      const [existingQuote] = await tx.$queryRaw<AdminQuoteRecord[]>`
        SELECT * FROM "AdminQuote"
        WHERE "id" = ${id}
        LIMIT 1
      `

      if (!existingQuote) return null

      const mergedQuote = mergeQuoteFields(existingQuote, quote)

      const updatedRecords = await tx.$queryRaw<AdminQuoteRecord[]>`
        UPDATE "AdminQuote"
        SET
          "numeroFactura" = ${mergedQuote.numeroFactura},
          "cliente" = ${mergedQuote.cliente},
          "email" = ${mergedQuote.email},
          "telefono" = ${mergedQuote.telefono},
          "clientId" = ${mergedQuote.clientId},
          "tipoServicio" = ${mergedQuote.tipoServicio},
          "urgencia" = ${mergedQuote.urgencia},
          "descripcionProyecto" = ${mergedQuote.descripcionProyecto},
          "ubicacionProyecto" = ${mergedQuote.ubicacionProyecto},
          "fecha" = ${mergedQuote.fecha},
          "subtotal" = ${mergedQuote.subtotal},
          "impuestos" = ${mergedQuote.impuestos},
          "total" = ${mergedQuote.total},
          "estado" = ${mergedQuote.estado},
          "notas" = ${mergedQuote.notas},
          "monedaPrincipal" = ${mergedQuote.monedaPrincipal},
          "itbisActivo" = ${mergedQuote.itbisActivo},
          "porcentajeItbis" = ${mergedQuote.porcentajeItbis},
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

      if (mergedQuote.estado === "aprobada") {
        const [clientRow] =
          mergedQuote.clientId
            ? await tx.$queryRaw<{ address: string | null }[]>`
                SELECT "address"
                FROM "Client"
                WHERE "id" = ${mergedQuote.clientId}
                LIMIT 1
              `
            : []

        try {
          const generatedInvoice = await createInvoiceFromQuote(tx, {
            id: existingQuote.id,
            numeroFactura: mergedQuote.numeroFactura,
            cliente: mergedQuote.cliente,
            email: mergedQuote.email,
            telefono: mergedQuote.telefono,
            clientId: mergedQuote.clientId,
            direccion: clientRow?.address || "",
            notas: mergedQuote.notas,
            subtotal: mergedQuote.subtotal,
            total: mergedQuote.total,
            impuestos: mergedQuote.impuestos,
            monedaPrincipal: mergedQuote.monedaPrincipal,
            productos: quote.productos,
          })

          if (!generatedInvoice) {
            throw new Error(`Invoice generation returned empty result for quote ${id}`)
          }
        } catch (invoiceError) {
          console.error("Error creating invoice from approved quote:", {
            quoteId: id,
            invoiceError,
          })
          throw invoiceError
        }
      }

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
