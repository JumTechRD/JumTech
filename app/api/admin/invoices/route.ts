import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { validateEmail } from '@/lib/auth'
import {
  type InvoiceItemRecord,
  normalizeInvoiceInput,
  type InvoiceRecord,
  serializeInvoice,
} from '@/lib/admin-data'
import { getInvoiceById, getInvoiceBySourceQuoteId, insertInvoiceItems } from '@/lib/admin-invoice-service'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const estado = request.nextUrl.searchParams.get('estado')?.trim()
    const q = request.nextUrl.searchParams.get('q')?.trim()
    const fechaInicial = request.nextUrl.searchParams.get('fechaInicial')?.trim()
    const fechaFinal = request.nextUrl.searchParams.get('fechaFinal')?.trim()

    const whereClauses = []

    if (estado && estado !== 'todos') {
      whereClauses.push(Prisma.sql`"estado" = ${estado}`)
    }

    if (q) {
      const like = `%${q}%`
      whereClauses.push(
        Prisma.sql`(
          "cliente" ILIKE ${like}
          OR "numero" ILIKE ${like}
          OR "email" ILIKE ${like}
        )`,
      )
    }

    if (fechaInicial) {
      whereClauses.push(Prisma.sql`"fecha"::date >= ${fechaInicial}`)
    }

    if (fechaFinal) {
      whereClauses.push(Prisma.sql`"fecha"::date <= ${fechaFinal}`)
    }

    const invoices =
      whereClauses.length > 0
        ? await prisma.$queryRaw<InvoiceRecord[]>(Prisma.sql`
            SELECT * FROM "Invoice"
            WHERE ${Prisma.join(whereClauses, " AND ")}
            ORDER BY "fecha" DESC
          `)
        : await prisma.$queryRaw<InvoiceRecord[]>`
            SELECT * FROM "Invoice"
            ORDER BY "fecha" DESC
          `

    const invoiceIds = invoices.map((invoice) => invoice.id)
    const items =
      invoiceIds.length > 0
        ? await prisma.$queryRaw<InvoiceItemRecord[]>(
            Prisma.sql`
              SELECT * FROM "InvoiceItem"
              WHERE "invoiceId" IN (${Prisma.join(invoiceIds)})
              ORDER BY "position" ASC
            `,
          )
        : []

    const itemsByInvoice = new Map<string, InvoiceItemRecord[]>()
    for (const item of items) {
      itemsByInvoice.set(item.invoiceId, [...(itemsByInvoice.get(item.invoiceId) || []), item])
    }

    return NextResponse.json(
      { invoices: invoices.map((invoice) => serializeInvoice(invoice, itemsByInvoice.get(invoice.id) || [])) },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const body = (await request.json()) as Record<string, unknown>
    const invoice = normalizeInvoiceInput(body)

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

    if (invoice.sourceQuoteId) {
      const existingInvoice = await getInvoiceBySourceQuoteId(prisma, invoice.sourceQuoteId)
      if (existingInvoice) {
        return NextResponse.json({ invoice: existingInvoice }, { status: 200 })
      }
    }

    const createdInvoice = await prisma.$transaction(async (tx) => {
      const [record] = await tx.$queryRaw<InvoiceRecord[]>`
        INSERT INTO "Invoice" (
          "id", "numero", "cliente", "email", "telefono", "direccion", "clientId", "sourceQuoteId",
          "paymentMethod", "fecha", "vencimiento", "subtotal", "impuestos", "total", "estado", "notas", "updatedAt"
        )
        VALUES (
          ${crypto.randomUUID()}, ${invoice.numero}, ${invoice.cliente}, ${invoice.email}, ${invoice.telefono},
          ${invoice.direccion}, ${invoice.clientId}, ${invoice.sourceQuoteId}, ${invoice.paymentMethod},
          ${invoice.fecha}, ${invoice.vencimiento}, ${invoice.subtotal}, ${invoice.impuestos},
          ${invoice.total}, ${invoice.estado}, ${invoice.notas}, ${new Date()}
        )
        RETURNING *
      `

      await insertInvoiceItems(tx, record.id, invoice.productos)
      return getInvoiceById(tx, record.id)
    })

    return NextResponse.json({ invoice: createdInvoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
