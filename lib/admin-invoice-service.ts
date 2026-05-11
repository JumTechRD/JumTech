import { Prisma, PrismaClient } from "@prisma/client"
import type { InvoiceItemRecord, InvoiceRecord } from "@/lib/admin-data"
import { serializeInvoice } from "@/lib/admin-data"

type RawDb = Pick<PrismaClient, "$queryRaw" | "$executeRaw">

export type InvoiceProductInput = {
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen?: string | null
  cantidad: number
  position: number
}

export interface QuoteInvoiceSource {
  id: string
  numeroFactura?: string | null
  cliente: string
  email: string
  telefono: string
  clientId?: string | null
  direccion?: string | null
  notas?: string | null
  subtotal: number
  total: number
  impuestos?: number
  productos: InvoiceProductInput[]
}

export async function getInvoiceById(db: RawDb, id: string) {
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

export async function getInvoiceBySourceQuoteId(db: RawDb, sourceQuoteId: string) {
  const [invoice] = await db.$queryRaw<InvoiceRecord[]>`
    SELECT * FROM "Invoice"
    WHERE "sourceQuoteId" = ${sourceQuoteId}
    LIMIT 1
  `

  if (!invoice) return null

  const items = await db.$queryRaw<InvoiceItemRecord[]>`
    SELECT * FROM "InvoiceItem"
    WHERE "invoiceId" = ${invoice.id}
    ORDER BY "position" ASC
  `

  return serializeInvoice(invoice, items)
}

export async function insertInvoiceItems(db: RawDb, invoiceId: string, productos: InvoiceProductInput[]) {
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

export async function createInvoiceFromQuote(db: RawDb, quote: QuoteInvoiceSource) {
  if (!quote.id) return null

  const existing = await getInvoiceBySourceQuoteId(db, quote.id)
  if (existing) return existing

  const now = new Date()
  const vencimiento = new Date(now)
  vencimiento.setDate(vencimiento.getDate() + 30)

  const invoiceNumber = `FAC-${now.getFullYear()}-${String(Date.now()).slice(-6)}`
  const [record] = await db.$queryRaw<InvoiceRecord[]>`
    INSERT INTO "Invoice" (
      "id", "numero", "cliente", "email", "telefono", "direccion", "clientId", "sourceQuoteId",
      "paymentMethod", "fecha", "vencimiento", "subtotal", "impuestos", "total", "estado", "notas", "updatedAt"
    )
    VALUES (
      ${crypto.randomUUID()}, ${invoiceNumber}, ${quote.cliente}, ${quote.email}, ${quote.telefono},
      ${quote.direccion || ""}, ${quote.clientId}, ${quote.id}, ${"transferencia"},
      ${now}, ${vencimiento}, ${quote.subtotal}, ${quote.impuestos ?? 0}, ${quote.total}, ${"pendiente"},
      ${quote.notas}, ${now}
    )
    ON CONFLICT ("sourceQuoteId") DO NOTHING
    RETURNING *
  `

  if (!record) {
    const existingAfterConflict = await getInvoiceBySourceQuoteId(db, quote.id)
    return existingAfterConflict
  }

  await insertInvoiceItems(db, record.id, quote.productos)
  return getInvoiceById(db, record.id)
}
