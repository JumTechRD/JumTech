import { calcularPrecioUnitarioDesdeTotal, calcularTotalItem } from "@/lib/pricing"

type InvoiceDisplayProduct = {
  precio: number
  total?: number | null
  cantidad: number
}

export function getInvoiceDisplayItems<T extends InvoiceDisplayProduct>(products: T[], _subtotal?: number) {
  return products.map((product) => {
    const quantity = product.cantidad > 0 ? product.cantidad : 1
    const displayLineTotal = product.total ?? calcularTotalItem(product.precio, product.cantidad)
    const displayUnitPrice = calcularPrecioUnitarioDesdeTotal(displayLineTotal, quantity)

    return {
      ...product,
      displayUnitPrice,
      displayLineTotal,
    }
  })
}
