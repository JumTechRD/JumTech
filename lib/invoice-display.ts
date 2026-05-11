type InvoiceDisplayProduct = {
  precio: number
  cantidad: number
}

export function getInvoiceDisplayItems<T extends InvoiceDisplayProduct>(products: T[], subtotal: number) {
  const productSubtotal = products.reduce((sum, product) => sum + product.precio * product.cantidad, 0)
  const displayFactor =
    subtotal > 0 && productSubtotal > 0 && Math.abs(subtotal - productSubtotal) > 0.01 ? subtotal / productSubtotal : 1

  return products.map((product) => {
    const quantity = product.cantidad > 0 ? product.cantidad : 1
    const displayLineTotal = product.precio * product.cantidad * displayFactor
    const displayUnitPrice = displayLineTotal / quantity

    return {
      ...product,
      displayUnitPrice,
      displayLineTotal,
    }
  })
}
