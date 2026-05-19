export type CurrencyCode = "USD" | "RD$"

export const DEFAULT_EXCHANGE_RATE = 58
export const PROFIT_PERCENTAGE_OPTIONS = [0, 20, 30, 40] as const

function toFiniteNumber(value: number | null | undefined, fallback = 0) {
  return Number.isFinite(value) ? Number(value) : fallback
}

export function normalizarMoneda(value?: string | null): CurrencyCode {
  return value === "USD" ? "USD" : "RD$"
}

export function convertirPrecio(
  precio: number,
  monedaOrigen?: string | null,
  monedaDestino?: string | null,
  tasaCambio = DEFAULT_EXCHANGE_RATE,
) {
  const origen = normalizarMoneda(monedaOrigen)
  const destino = normalizarMoneda(monedaDestino)
  const precioSeguro = toFiniteNumber(precio)
  const tasaSegura = toFiniteNumber(tasaCambio, DEFAULT_EXCHANGE_RATE)

  if (origen === destino) return precioSeguro
  if (origen === "USD" && destino === "RD$") return precioSeguro * tasaSegura
  return tasaSegura > 0 ? precioSeguro / tasaSegura : precioSeguro
}

export function calcularPrecioFinalUnitario(precioBaseUnitario: number, porcentajeGanancia?: number | null) {
  const precioBaseSeguro = toFiniteNumber(precioBaseUnitario)
  const gananciaSegura = toFiniteNumber(porcentajeGanancia)

  return precioBaseSeguro * (1 + gananciaSegura / 100)
}

export function calcularTotalItem(precioFinalUnitario: number, cantidad: number) {
  const cantidadSegura = Math.max(0, Math.trunc(toFiniteNumber(cantidad)))

  return toFiniteNumber(precioFinalUnitario) * cantidadSegura
}

export function calcularPrecioUnitarioDesdeTotal(totalItem: number, cantidad: number) {
  const cantidadSegura = Math.max(1, Math.trunc(toFiniteNumber(cantidad, 1)))

  return toFiniteNumber(totalItem) / cantidadSegura
}

export function calcularPrecioBaseDesdeFinal(precioFinalUnitario: number, porcentajeGanancia?: number | null) {
  const gananciaSegura = toFiniteNumber(porcentajeGanancia)
  const factor = 1 + gananciaSegura / 100

  return factor > 0 ? toFiniteNumber(precioFinalUnitario) / factor : toFiniteNumber(precioFinalUnitario)
}

export function calcularItemConGanancia({
  precio,
  cantidad,
  porcentajeGanancia,
  monedaOrigen,
  monedaDestino,
  tasaCambio = DEFAULT_EXCHANGE_RATE,
}: {
  precio: number
  cantidad: number
  porcentajeGanancia?: number | null
  monedaOrigen?: string | null
  monedaDestino?: string | null
  tasaCambio?: number
}) {
  const precioBaseUnitario = convertirPrecio(precio, monedaOrigen, monedaDestino, tasaCambio)
  const precioFinalUnitario = calcularPrecioFinalUnitario(precioBaseUnitario, porcentajeGanancia)
  const totalItem = calcularTotalItem(precioFinalUnitario, cantidad)

  return {
    precioBaseUnitario,
    precioFinalUnitario,
    totalItem,
  }
}
