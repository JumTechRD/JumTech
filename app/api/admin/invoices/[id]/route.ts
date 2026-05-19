import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { validateEmail } from '@/lib/auth'
import {
  normalizeInvoiceInput,
  type InvoiceRecord,
} from '@/lib/admin-data'
import { getInvoiceById, insertInvoiceItems } from '@/lib/admin-invoice-service'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: Params) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const { id } = await context.params
    const body = (await request.json()) as Record<string, unknown>
    const invoice = normalizeInvoiceInput(body)
    const emailWasProvided =
      Object.prototype.hasOwnProperty.call(body, "email") ||
      Object.prototype.hasOwnProperty.call(body, "customerEmail")

    if (!invoice.numero || !invoice.cliente || invoice.productos.length === 0) {
      return NextResponse.json({ error: 'Missing required invoice fields' }, { status: 400 })
    }

    if (invoice.email && !validateEmail(invoice.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (invoice.clientId) {
      const client = await prisma.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "Client"
        WHERE "id" = ${invoice.clientId}
        LIMIT 1
      `
      if (client.length === 0) {
        return NextResponse.json({ error: 'Selected client not found' }, { status: 404 })
      }
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const [existingInvoice] = await tx.$queryRaw<InvoiceRecord[]>`
        SELECT * FROM "Invoice"
        WHERE "id" = ${id}
        LIMIT 1
      `

      if (!existingInvoice) return null

      const sourceQuoteId = invoice.sourceQuoteId || existingInvoice.sourceQuoteId || null
      const paymentMethod = invoice.paymentMethod || existingInvoice.paymentMethod || "transferencia"
      const email = emailWasProvided ? invoice.email : existingInvoice.email
      const updatedRecords = await tx.$queryRaw<InvoiceRecord[]>`
        UPDATE "Invoice"
        SET
          "numero" = ${invoice.numero},
          "cliente" = ${invoice.cliente},
          "email" = ${email},
          "telefono" = ${invoice.telefono},
          "direccion" = ${invoice.direccion},
          "clientId" = ${invoice.clientId},
          "sourceQuoteId" = ${sourceQuoteId},
          "paymentMethod" = ${paymentMethod},
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
      return getInvoiceById(tx, id)
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
