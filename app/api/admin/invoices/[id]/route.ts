import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import {
  InvoiceItemRecord,
  InvoiceRecord,
  normalizeInvoiceInput,
  serializeInvoice,
} from '@/lib/admin-data'

interface Params {
  params: Promise<{ id: string }>
}

async function getInvoice(db: any, id: string) {
  const [invoice] = await db.$queryRaw<InvoiceRecord[]>`
    SELECT * FROM "Invoice"
    WHERE "id" = ${id}
    LIMIT 1
  `

  if (!invoice) return null

  const items = await db.$queryRaw<InvoiceItemRecord[]>`
    SELECT * FROM "InvoiceItem"
    WHERE "invoiceId" = ${id}
    ORDER BY "position" ASC
  `

  return serializeInvoice(invoice, items)
}

async function insertInvoiceItems(db: any, invoiceId: string, productos: ReturnType<typeof normalizeInvoiceInput>['productos']) {
  for (const producto of productos) {
    await db.$executeRaw`
      INSERT INTO "InvoiceItem" (
        "id", "invoiceId", "nombre", "descripcion", "precio", "categoria", "imagen", "cantidad", "position"
      )
      VALUES (
        ${crypto.randomUUID()}, ${invoiceId}, ${producto.nombre}, ${producto.descripcion}, ${producto.precio},
        ${producto.categoria}, ${producto.imagen}, ${producto.cantidad}, ${producto.position}
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
    const invoice = normalizeInvoiceInput(body)

    if (!invoice.numero || !invoice.cliente || !invoice.email || invoice.productos.length === 0) {
      return NextResponse.json({ error: 'Missing required invoice fields' }, { status: 400 })
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const updatedRecords = await tx.$queryRaw<InvoiceRecord[]>`
        UPDATE "Invoice"
        SET
          "numero" = ${invoice.numero},
          "cliente" = ${invoice.cliente},
          "email" = ${invoice.email},
          "telefono" = ${invoice.telefono},
          "direccion" = ${invoice.direccion},
          "fecha" = ${invoice.fecha},
          "vencimiento" = ${invoice.vencimiento},
          "subtotal" = ${invoice.subtotal},
          "impuestos" = ${invoice.impuestos},
          "total" = ${invoice.total},
          "estado" = ${invoice.estado},
          "notas" = ${invoice.notas},
          "updatedAt" = ${new Date()}
        WHERE "id" = ${id}
        RETURNING *
      `

      if (updatedRecords.length === 0) return null

      await tx.$executeRaw`
        DELETE FROM "InvoiceItem"
        WHERE "invoiceId" = ${id}
      `
      await insertInvoiceItems(tx, id, invoice.productos)
      return getInvoice(tx, id)
    })

    if (!updatedInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ invoice: updatedInvoice }, { status: 200 })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const deletedInvoices = await prisma.$queryRaw<InvoiceRecord[]>`
      DELETE FROM "Invoice"
      WHERE "id" = ${id}
      RETURNING *
    `

    if (deletedInvoices.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
