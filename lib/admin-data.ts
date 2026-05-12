import {
  calcularPrecioFinalUnitario,
  calcularPrecioUnitarioDesdeTotal,
  calcularTotalItem,
} from "@/lib/pricing"

type Nullable<T> = T | null

export interface ProductRecord {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen: Nullable<string>
  stock: number
  rating: number
  especificaciones: string[]
  activo: boolean
  fechaCreacion: Date | string
  fechaActualizacion: Date | string
  precioCompra: Nullable<number>
  margenGanancia: Nullable<number>
  proveedor: Nullable<string>
  codigoBarras: Nullable<string>
  sku: Nullable<string>
  peso: Nullable<number>
  dimensiones: Nullable<Record<string, unknown>>
  garantia: Nullable<number>
  ubicacion: Nullable<string>
  stockMinimo: Nullable<number>
  stockMaximo: Nullable<number>
  vendido: number
  ultimaVenta: Nullable<Date | string>
}

export interface InvoiceRecord {
  id: string
  numero: string
  cliente: string
  email: string
  telefono: string
  direccion: string
  clientId: Nullable<string>
  sourceQuoteId: Nullable<string>
  paymentMethod: string
  fecha: Date | string
  vencimiento: Date | string
  subtotal: number
  impuestos: number
  total: number
  estado: string
  notas: Nullable<string>
}

export interface InvoiceItemRecord {
  id: string
  invoiceId: string
  productId: Nullable<string>
  nombre: string
  descripcion: string
  precio: number
  total: Nullable<number>
  profitPercentage: Nullable<number>
  categoria: string
  imagen: Nullable<string>
  cantidad: number
  position: number
}

export interface AdminQuoteRecord {
  id: string
  numeroFactura: Nullable<string>
  cliente: string
  email: string
  telefono: string
  clientId: Nullable<string>
  tipoServicio: Nullable<string>
  urgencia: Nullable<string>
  descripcionProyecto: Nullable<string>
  ubicacionProyecto: Nullable<string>
  generatedInvoice?: Nullable<{
    id: string
    numero: string
  }>
  fecha: Date | string
  subtotal: number
  impuestos: number
  total: number
  estado: string
  notas: Nullable<string>
  monedaPrincipal: Nullable<string>
  itbisActivo: boolean
  porcentajeItbis: Nullable<number>
}

export interface AdminQuoteItemRecord {
  id: string
  adminQuoteId: string
  productId: Nullable<string>
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  cantidad: number
  esManual: boolean
  moneda: Nullable<string>
  porcentajeExtra: Nullable<number>
  position: number
}

function toStringValue(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim()
  if (value === null || value === undefined) return fallback
  return String(value).trim()
}

function toOptionalString(value: unknown) {
  const stringValue = toStringValue(value)
  return stringValue.length > 0 ? stringValue : null
}

function toNumberValue(value: unknown, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function toOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const numberValue = toNumberValue(value, Number.NaN)
  return Number.isFinite(numberValue) ? numberValue : null
}

function toIntValue(value: unknown, fallback = 0) {
  const numberValue = Math.trunc(toNumberValue(value, fallback))
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function toOptionalInt(value: unknown) {
  const numberValue = toOptionalNumber(value)
  return numberValue === null ? null : Math.trunc(numberValue)
}

function toBooleanValue(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    if (value === "true") return true
    if (value === "false") return false
  }
  return fallback
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null)
}

function normalizeQuoteStatus(value: unknown) {
  const status = toStringValue(value, "pendiente").toLowerCase()
  return status === "aprobado" ? "aprobada" : status
}

function toDateValue(value: unknown, fallback = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return fallback
}

function toOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  return toDateValue(value)
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => toStringValue(item)).filter(Boolean)
}

function toDimensions(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null

  const dimensions = value as Record<string, unknown>
  const largo = toOptionalNumber(dimensions.largo)
  const ancho = toOptionalNumber(dimensions.ancho)
  const alto = toOptionalNumber(dimensions.alto)

  if (largo === null || ancho === null || alto === null) return null
  return { largo, ancho, alto }
}

export function normalizeProductInput(body: Record<string, unknown>) {
  return {
    nombre: toStringValue(body.nombre),
    descripcion: toStringValue(body.descripcion),
    precio: toNumberValue(body.precio),
    categoria: toStringValue(body.categoria),
    imagen: toOptionalString(body.imagen),
    stock: toIntValue(body.stock),
    rating: toNumberValue(body.rating, 4),
    especificaciones: toStringArray(body.especificaciones),
    activo: toBooleanValue(body.activo, true),
    fechaCreacion: toDateValue(body.fechaCreacion),
    precioCompra: toOptionalNumber(body.precioCompra),
    margenGanancia: toOptionalNumber(body.margenGanancia),
    proveedor: toOptionalString(body.proveedor),
    codigoBarras: toOptionalString(body.codigoBarras),
    sku: toOptionalString(body.sku),
    peso: toOptionalNumber(body.peso),
    dimensiones: toDimensions(body.dimensiones),
    garantia: toOptionalInt(body.garantia),
    ubicacion: toOptionalString(body.ubicacion),
    stockMinimo: toOptionalInt(body.stockMinimo),
    stockMaximo: toOptionalInt(body.stockMaximo),
    vendido: toIntValue(body.vendido),
    ultimaVenta: toOptionalDate(body.ultimaVenta),
  }
}

export function serializeProduct(product: ProductRecord) {
  return {
    ...product,
    imagen: product.imagen || "/placeholder.svg",
    especificaciones: product.especificaciones || [],
    dimensiones: product.dimensiones || undefined,
    fechaCreacion: toIso(product.fechaCreacion),
    fechaActualizacion: toIso(product.fechaActualizacion),
    ultimaVenta: product.ultimaVenta ? toIso(product.ultimaVenta) : undefined,
  }
}

export function normalizeInvoiceInput(body: Record<string, unknown>) {
  const paymentMethod = toStringValue(firstDefined(body.paymentMethod, body.metodoPago), "transferencia").toLowerCase()
  return {
    numero: toStringValue(firstDefined(body.numero, body.number)),
    cliente: toStringValue(firstDefined(body.cliente, body.clientName, body.customerName)),
    email: toStringValue(firstDefined(body.email, body.customerEmail)),
    telefono: toStringValue(firstDefined(body.telefono, body.phone, body.customerPhone)),
    direccion: toStringValue(firstDefined(body.direccion, body.address, body.customerAddress)),
    clientId: toOptionalString(body.clientId),
    sourceQuoteId: toOptionalString(body.sourceQuoteId),
    paymentMethod: paymentMethod === "efectivo" ? "efectivo" : "transferencia",
    fecha: toDateValue(firstDefined(body.fecha, body.date)),
    vencimiento: toDateValue(firstDefined(body.vencimiento, body.dueDate)),
    subtotal: toNumberValue(body.subtotal),
    impuestos: toNumberValue(body.impuestos),
    total: toNumberValue(body.total),
    estado: toStringValue(firstDefined(body.estado, body.status), "pendiente").toLowerCase(),
    notas: toOptionalString(firstDefined(body.notas, body.notes)),
    productos: normalizeInvoiceItems(firstDefined(body.productos, body.items)),
  }
}

function normalizeInvoiceItems(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    const cantidad = Math.max(1, toIntValue(firstDefined(record.cantidad, record.quantity), 1))
    const profitPercentage = toOptionalNumber(record.profitPercentage ?? record.porcentajeExtra) ?? 0
    const explicitTotal = toOptionalNumber(firstDefined(record.total, record.lineTotal))
    const explicitFinalUnitPrice = toOptionalNumber(
      firstDefined(record.finalUnitPrice, record.precioFinalUnitario, record.finalPrice),
    )
    const basePrice = toOptionalNumber(firstDefined(record.basePrice, record.precioBase, record.costPrice, record.costoInterno))
    const unitPriceInput = toNumberValue(firstDefined(record.precio, record.unitPrice, record.price))
    const precio =
      explicitTotal !== null
        ? calcularPrecioUnitarioDesdeTotal(explicitTotal, cantidad)
        : explicitFinalUnitPrice !== null
          ? explicitFinalUnitPrice
          : basePrice !== null || profitPercentage > 0
            ? calcularPrecioFinalUnitario(basePrice ?? unitPriceInput, profitPercentage)
            : unitPriceInput
    const total = explicitTotal ?? calcularTotalItem(precio, cantidad)

    return {
      nombre: toStringValue(firstDefined(record.nombre, record.name)),
      descripcion: toStringValue(firstDefined(record.descripcion, record.description)),
      precio,
      total,
      profitPercentage,
      categoria: toStringValue(firstDefined(record.categoria, record.category)),
      imagen: toOptionalString(firstDefined(record.imagen, record.image)),
      cantidad,
      position: index,
    }
  })
}

export function serializeInvoice(invoice: InvoiceRecord, items: InvoiceItemRecord[]) {
  return {
    id: invoice.id,
    numero: invoice.numero,
    cliente: invoice.cliente,
    email: invoice.email,
    telefono: invoice.telefono,
    direccion: invoice.direccion,
    clientId: invoice.clientId || undefined,
    sourceQuoteId: invoice.sourceQuoteId || undefined,
    paymentMethod: invoice.paymentMethod || "transferencia",
    fecha: toIso(invoice.fecha),
    vencimiento: toIso(invoice.vencimiento),
    productos: items
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.productId || item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        total: item.total ?? calcularTotalItem(item.precio, item.cantidad),
        profitPercentage: item.profitPercentage || 0,
        categoria: item.categoria,
        imagen: item.imagen || undefined,
        cantidad: item.cantidad,
      })),
    subtotal: invoice.subtotal,
    impuestos: invoice.impuestos,
    total: invoice.total,
    estado: invoice.estado,
    notas: invoice.notas || undefined,
  }
}

export function normalizeAdminQuoteInput(body: Record<string, unknown>) {
  return {
    numeroFactura: toOptionalString(body.numeroFactura),
    cliente: toStringValue(firstDefined(body.cliente, body.clientName, body.customerName)),
    email: toStringValue(firstDefined(body.email, body.customerEmail)),
    telefono: toStringValue(firstDefined(body.telefono, body.phone, body.customerPhone)),
    clientId: toOptionalString(body.clientId),
    tipoServicio: toOptionalString(body.tipoServicio),
    urgencia: toOptionalString(body.urgencia),
    descripcionProyecto: toOptionalString(body.descripcionProyecto),
    ubicacionProyecto: toOptionalString(body.ubicacionProyecto),
    fecha: toDateValue(body.fecha),
    subtotal: toNumberValue(body.subtotal),
    impuestos: toNumberValue(body.impuestos),
    total: toNumberValue(body.total),
    estado: normalizeQuoteStatus(firstDefined(body.estado, body.status)),
    notas: toOptionalString(firstDefined(body.notas, body.notes)),
    monedaPrincipal: toOptionalString(body.monedaPrincipal),
    itbisActivo: toBooleanValue(body.itbisActivo, true),
    porcentajeItbis: toOptionalNumber(body.porcentajeItbis),
    productos: normalizeAdminQuoteItems(firstDefined(body.productos, body.items)),
  }
}

function normalizeAdminQuoteItems(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    return {
      nombre: toStringValue(firstDefined(record.nombre, record.name)),
      descripcion: toStringValue(firstDefined(record.descripcion, record.description)),
      precio: toNumberValue(firstDefined(record.precio, record.unitPrice, record.price)),
      categoria: toStringValue(firstDefined(record.categoria, record.category)),
      cantidad: Math.max(1, toIntValue(firstDefined(record.cantidad, record.quantity), 1)),
      esManual: toBooleanValue(record.esManual, false),
      moneda: toOptionalString(record.moneda),
      porcentajeExtra: toOptionalNumber(firstDefined(record.porcentajeExtra, record.profitPercentage)),
      total: toOptionalNumber(firstDefined(record.total, record.lineTotal)),
      position: index,
    }
  })
}

export function serializeAdminQuote(quote: AdminQuoteRecord, items: AdminQuoteItemRecord[]) {
  return {
    id: quote.id,
    numeroFactura: quote.numeroFactura || undefined,
    cliente: quote.cliente,
    email: quote.email,
    telefono: quote.telefono,
    clientId: quote.clientId || undefined,
    tipoServicio: quote.tipoServicio || undefined,
    urgencia: quote.urgencia || undefined,
    descripcionProyecto: quote.descripcionProyecto || undefined,
    ubicacionProyecto: quote.ubicacionProyecto || undefined,
    fecha: toIso(quote.fecha),
    productos: items
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.productId || item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        categoria: item.categoria,
        cantidad: item.cantidad,
        esManual: item.esManual,
        moneda: item.moneda || undefined,
        porcentajeExtra: item.porcentajeExtra || 0,
      })),
    subtotal: quote.subtotal,
    impuestos: quote.impuestos,
    total: quote.total,
    estado: quote.estado,
    notas: quote.notas || undefined,
    monedaPrincipal: quote.monedaPrincipal || undefined,
    itbisActivo: quote.itbisActivo,
    porcentajeItbis: quote.porcentajeItbis || undefined,
  }
}
