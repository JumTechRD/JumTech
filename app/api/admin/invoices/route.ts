import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import {
  InvoiceItemRecord,
  InvoiceRecord,
  normalizeInvoiceInput,
  serializeInvoice,
} from '@/lib/admin-data'

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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.isAuthorized) return auth.response

  try {
    const invoices = await prisma.$queryRaw<InvoiceRecord[]>`
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

    if (!invoice.numero || !invoice.cliente || !invoice.email || invoice.productos.length === 0) {
      return NextResponse.json({ error: 'Missing required invoice fields' }, { status: 400 })
    }

    const createdInvoice = await prisma.$transaction(async (tx) => {
      const [record] = await tx.$queryRaw<InvoiceRecord[]>`
        INSERT INTO "Invoice" (
          "id", "numero", "cliente", "email", "telefono", "direccion", "fecha", "vencimiento",
          "subtotal", "impuestos", "total", "estado", "notas", "updatedAt"
        )
        VALUES (
          ${crypto.randomUUID()}, ${invoice.numero}, ${invoice.cliente}, ${invoice.email}, ${invoice.telefono},
          ${invoice.direccion}, ${invoice.fecha}, ${invoice.vencimiento}, ${invoice.subtotal},
          ${invoice.impuestos}, ${invoice.total}, ${invoice.estado}, ${invoice.notas}, ${new Date()}
        )
        RETURNING *
      `

      await insertInvoiceItems(tx, record.id, invoice.productos)
      return getInvoice(tx, record.id)
    })

    return NextResponse.json({ invoice: createdInvoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
