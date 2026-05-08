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
  return {
    numero: toStringValue(body.numero),
    cliente: toStringValue(body.cliente),
    email: toStringValue(body.email),
    telefono: toStringValue(body.telefono),
    direccion: toStringValue(body.direccion),
    fecha: toDateValue(body.fecha),
    vencimiento: toDateValue(body.vencimiento),
    subtotal: toNumberValue(body.subtotal),
    impuestos: toNumberValue(body.impuestos),
    total: toNumberValue(body.total),
    estado: toStringValue(body.estado, "pendiente"),
    notas: toOptionalString(body.notas),
    productos: normalizeInvoiceItems(body.productos),
  }
}

function normalizeInvoiceItems(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    return {
      nombre: toStringValue(record.nombre),
      descripcion: toStringValue(record.descripcion),
      precio: toNumberValue(record.precio),
      categoria: toStringValue(record.categoria),
      imagen: toOptionalString(record.imagen),
      cantidad: Math.max(1, toIntValue(record.cantidad, 1)),
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
    fecha: toIso(invoice.fecha),
    vencimiento: toIso(invoice.vencimiento),
    productos: items
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.productId || item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
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
    cliente: toStringValue(body.cliente),
    email: toStringValue(body.email),
    telefono: toStringValue(body.telefono),
    fecha: toDateValue(body.fecha),
    subtotal: toNumberValue(body.subtotal),
    impuestos: toNumberValue(body.impuestos),
    total: toNumberValue(body.total),
    estado: toStringValue(body.estado, "pendiente"),
    notas: toOptionalString(body.notas),
    monedaPrincipal: toOptionalString(body.monedaPrincipal),
    itbisActivo: toBooleanValue(body.itbisActivo, true),
    porcentajeItbis: toOptionalNumber(body.porcentajeItbis),
    productos: normalizeAdminQuoteItems(body.productos),
  }
}

function normalizeAdminQuoteItems(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    return {
      nombre: toStringValue(record.nombre),
      descripcion: toStringValue(record.descripcion),
      precio: toNumberValue(record.precio),
      categoria: toStringValue(record.categoria),
      cantidad: Math.max(1, toIntValue(record.cantidad, 1)),
      esManual: toBooleanValue(record.esManual, false),
      moneda: toOptionalString(record.moneda),
      porcentajeExtra: toOptionalNumber(record.porcentajeExtra),
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
