import { Prisma, PrismaClient } from "@prisma/client"
import type { InvoiceItemRecord, InvoiceRecord } from "@/lib/admin-data"
import { serializeInvoice } from "@/lib/admin-data"
import {
  calcularItemConGanancia,
  calcularPrecioUnitarioDesdeTotal,
  calcularTotalItem,
} from "@/lib/pricing"

type RawDb = Pick<PrismaClient, "$queryRaw" | "$executeRaw">

export type InvoiceProductInput = {
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen?: string | null
  cantidad: number
  position: number
  moneda?: string | null
  porcentajeExtra?: number | null
  profitPercentage?: number | null
  total?: number | null
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
  monedaPrincipal?: string | null
  productos: InvoiceProductInput[]
}

function buildInvoiceProductsFromQuote(quote: QuoteInvoiceSource) {
  const productsWithFinalPrices = quote.productos.map((producto) => {
    const pricing = calcularItemConGanancia({
      precio: producto.precio,
      cantidad: producto.cantidad,
      porcentajeGanancia: producto.porcentajeExtra,
      monedaOrigen: producto.moneda,
      monedaDestino: quote.monedaPrincipal,
    })
    const totalFinalItem = producto.total ?? pricing.totalItem
    const finalUnitPrice = calcularPrecioUnitarioDesdeTotal(totalFinalItem, producto.cantidad)

    return {
      ...producto,
      precio: finalUnitPrice,
      total: totalFinalItem,
      profitPercentage: producto.porcentajeExtra ?? producto.profitPercentage ?? 0,
    }
  })
  const calculatedSubtotal = productsWithFinalPrices.reduce(
    (sum, producto) => sum + (producto.total ?? calcularTotalItem(producto.precio, producto.cantidad)),
    0,
  )

  if (quote.subtotal > 0 && calculatedSubtotal > 0 && Math.abs(quote.subtotal - calculatedSubtotal) > 0.01) {
    const adjustmentFactor = quote.subtotal / calculatedSubtotal
    return productsWithFinalPrices.map((producto) => {
      const adjustedTotal = (producto.total ?? calcularTotalItem(producto.precio, producto.cantidad)) * adjustmentFactor

      return {
        ...producto,
        precio: calcularPrecioUnitarioDesdeTotal(adjustedTotal, producto.cantidad),
        total: adjustedTotal,
      }
    })
  }

  return productsWithFinalPrices
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
        "id", "invoiceId", "nombre", "descripcion", "precio", "total", "profitPercentage", "categoria", "imagen",
        "cantidad", "position"
      )
      VALUES (
        ${crypto.randomUUID()}, ${invoiceId}, ${producto.nombre}, ${producto.descripcion}, ${producto.precio},
        ${producto.total ?? calcularTotalItem(producto.precio, producto.cantidad)}, ${producto.profitPercentage ?? 0},
        ${producto.categoria}, ${producto.imagen}, ${producto.cantidad}, ${producto.position}
      )
    `
  }
}

export async function createInvoiceFromQuote(db: RawDb, quote: QuoteInvoiceSource) {
  if (!quote.id) return null

  const invoiceProducts = buildInvoiceProductsFromQuote(quote)
  const existing = await getInvoiceBySourceQuoteId(db, quote.id)
  if (existing) {
    await db.$queryRaw<InvoiceRecord[]>`
      UPDATE "Invoice"
      SET
        "cliente" = ${quote.cliente},
        "email" = ${quote.email},
        "telefono" = ${quote.telefono},
        "direccion" = ${quote.direccion || ""},
        "clientId" = ${quote.clientId},
        "subtotal" = ${quote.subtotal},
        "impuestos" = ${quote.impuestos ?? 0},
        "total" = ${quote.total},
        "notas" = ${quote.notas},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${existing.id}
      RETURNING *
    `
    await db.$executeRaw`
      DELETE FROM "InvoiceItem"
      WHERE "invoiceId" = ${existing.id}
    `
    await insertInvoiceItems(db, existing.id, invoiceProducts)
    return getInvoiceById(db, existing.id)
  }

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
    if (!existingAfterConflict) return null

    await db.$executeRaw`
      DELETE FROM "InvoiceItem"
      WHERE "invoiceId" = ${existingAfterConflict.id}
    `
    await insertInvoiceItems(db, existingAfterConflict.id, invoiceProducts)
    return getInvoiceById(db, existingAfterConflict.id)
  }

  await insertInvoiceItems(db, record.id, invoiceProducts)
  return getInvoiceById(db, record.id)
}
