"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Trash2, Save, Calculator, User, Package, Download, FileText } from "lucide-react"
import { fetchAdminClients } from "@/lib/admin-api-client"
import { ClientSelector } from "@/components/client-selector"
import type { ClientRecord } from "@/lib/admin-clients"
import { generateFinancialPdf } from "@/lib/pdf-documents"
import {
  PROFIT_PERCENTAGE_OPTIONS,
  calcularItemConGanancia,
  calcularPrecioBaseDesdeFinal,
} from "@/lib/pricing"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen?: string
  stock?: number
}

interface ProductoEnFactura extends Producto {
  cantidad: number
  total?: number | null
  profitPercentage?: number | null
}

interface Factura {
  id: string
  numero: string
  cliente: string
  email: string
  telefono: string
  direccion: string
  clientId?: string | null
  sourceQuoteId?: string | null
  paymentMethod?: "transferencia" | "efectivo"
  fecha: string
  vencimiento: string
  productos: ProductoEnFactura[]
  subtotal: number
  impuestos: number
  total: number
  estado: "pendiente" | "pagada" | "vencida" | "cancelada"
  notas?: string
  companyName?: string
  identification?: string
}

interface FacturaCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (factura: Factura) => void
  editingFactura?: Factura | null
  productos: Producto[]
}

const formatearMonto = (monto: number) =>
  monto.toLocaleString("es-DO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidOptionalEmail(value: string) {
  const email = value.trim()
  return !email || emailRegex.test(email)
}

function normalizarProductoParaEdicion(producto: ProductoEnFactura): ProductoEnFactura {
  const profitPercentage = producto.profitPercentage || 0

  return {
    ...producto,
    precio: calcularPrecioBaseDesdeFinal(producto.precio, profitPercentage),
    profitPercentage,
    total: producto.total ?? producto.precio * producto.cantidad,
  }
}

function calcularProductoFactura(producto: ProductoEnFactura) {
  return calcularItemConGanancia({
    precio: producto.precio,
    cantidad: producto.cantidad,
    porcentajeGanancia: producto.profitPercentage,
  })
}

function prepararProductoParaGuardar(producto: ProductoEnFactura): ProductoEnFactura {
  const pricing = calcularProductoFactura(producto)

  return {
    ...producto,
    precio: pricing.precioFinalUnitario,
    total: pricing.totalItem,
    profitPercentage: producto.profitPercentage || 0,
  }
}

export function FacturaCreator({ isOpen, onClose, onSave, editingFactura, productos }: FacturaCreatorProps) {
  const [numero, setNumero] = useState("")
  const [cliente, setCliente] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [fecha, setFecha] = useState("")
  const [vencimiento, setVencimiento] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"transferencia" | "efectivo">("transferencia")
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoEnFactura[]>([])
  const [estado, setEstado] = useState<"pendiente" | "pagada" | "vencida" | "cancelada">("pendiente")
  const [notas, setNotas] = useState("")
  const [clientes, setClientes] = useState<ClientRecord[]>([])
  const [clientId, setClientId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [identification, setIdentification] = useState("")
  const [showProductos, setShowProductos] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    if (editingFactura) {
      setNumero(editingFactura.numero)
      setCliente(editingFactura.cliente)
      setEmail(editingFactura.email || "")
      setTelefono(editingFactura.telefono)
      setDireccion(editingFactura.direccion)
      setFecha(editingFactura.fecha.split("T")[0])
      setVencimiento(editingFactura.vencimiento.split("T")[0])
      setProductosSeleccionados(editingFactura.productos.map(normalizarProductoParaEdicion))
      setEstado(editingFactura.estado)
      setNotas(editingFactura.notas || "")
      setClientId(editingFactura.clientId || null)
      setCompanyName(editingFactura.companyName || "")
      setIdentification(editingFactura.identification || "")
      setPaymentMethod(editingFactura.paymentMethod || "transferencia")
    } else {
      // Reset form y generar número automático
      const now = new Date()
      const numeroFactura = `FAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(Date.now()).slice(-4)}`
      setNumero(numeroFactura)
      setCliente("")
      setEmail("")
      setTelefono("")
      setDireccion("")
      setFecha(now.toISOString().split("T")[0])

      // Vencimiento por defecto a 30 días
      const vencimientoDate = new Date(now)
      vencimientoDate.setDate(vencimientoDate.getDate() + 30)
      setVencimiento(vencimientoDate.toISOString().split("T")[0])

      setProductosSeleccionados([])
      setEstado("pendiente")
      setNotas("")
      setClientId(null)
      setCompanyName("")
      setIdentification("")
      setPaymentMethod("transferencia")
    }
  }, [editingFactura, isOpen])

  useEffect(() => {
    let isMounted = true

    const loadClients = async () => {
      try {
        const clientsData = await fetchAdminClients<ClientRecord[]>()
        if (isMounted) {
          setClientes(clientsData)
        }
      } catch (error) {
        if (isMounted) {
          setClientes([])
        }
      }
    }

    void loadClients()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!clientId) return
    const selectedClient = clientes.find((client) => client.id === clientId)
    if (!selectedClient) return

    setCompanyName(selectedClient.companyName || "")
    setIdentification(selectedClient.identification || "")
  }, [clientId, clientes])

  if (!isOpen) return null

  const agregarProducto = (producto: Producto) => {
    const existingProduct = productosSeleccionados.find((p) => p.id === producto.id)
    if (existingProduct) {
      setProductosSeleccionados(
        productosSeleccionados.map((p) => (p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p)),
      )
    } else {
      setProductosSeleccionados([...productosSeleccionados, { ...producto, cantidad: 1, profitPercentage: 0, total: producto.precio }])
    }
    setShowProductos(false)
  }

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarProducto(id)
      return
    }
    setProductosSeleccionados(productosSeleccionados.map((p) => (p.id === id ? { ...p, cantidad } : p)))
  }

  const actualizarPorcentajeGanancia = (id: string, profitPercentage: number) => {
    setProductosSeleccionados(
      productosSeleccionados.map((p) => (p.id === id ? { ...p, profitPercentage } : p)),
    )
  }

  const eliminarProducto = (id: string) => {
    setProductosSeleccionados(productosSeleccionados.filter((p) => p.id !== id))
  }

  const handleSelectClient = (client: ClientRecord | null) => {
    if (!client) {
      setClientId(null)
      return
    }

    setClientId(client.id)
    setCliente(client.name)
    setEmail(client.email)
    setTelefono(client.phone)
    setDireccion(client.address || "")
    setCompanyName(client.companyName || "")
    setIdentification(client.identification || "")
  }

  const calcularSubtotal = () => {
    return productosSeleccionados.reduce((sum, producto) => sum + calcularProductoFactura(producto).totalItem, 0)
  }

  const calcularImpuestos = () => {
    return 0
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularImpuestos()
  }

  const generarPDF = async () => {
    if (!isValidOptionalEmail(email)) {
      alert("Ingresa un correo válido o deja el campo vacío")
      return
    }

    setIsGeneratingPDF(true)

    try {
      const items = productosSeleccionados.map((producto) => {
        const pricing = calcularProductoFactura(producto)

        return {
          name: producto.nombre,
          description: producto.descripcion,
          quantity: producto.cantidad,
          unitPriceLabel: `$${formatearMonto(pricing.precioFinalUnitario)}`,
          lineTotalLabel: `$${formatearMonto(pricing.totalItem)}`,
        }
      })

      const subtotal = calcularSubtotal()
      await generateFinancialPdf({
        fileName: `Factura_${numero}_${cliente.replace(/\s+/g, "_")}.pdf`,
        title: "FACTURA",
        referenceLabel: "Número",
        referenceValue: numero,
        dateLabel: "Fecha",
        dateValue: new Date(fecha || new Date().toISOString()).toLocaleDateString("es-DO"),
        customerName: cliente,
        customerEmail: email.trim() || undefined,
        customerPhone: telefono || undefined,
        customerCompanyName: companyName || undefined,
        customerIdentification: identification || undefined,
        customerAddress: direccion || undefined,
        paymentMethodLabel: "Método de pago",
        paymentMethodValue: paymentMethod === "efectivo" ? "Efectivo" : "Transferencia",
        items,
        subtotalLabel: "Subtotal",
        subtotalValue: `$${formatearMonto(subtotal)}`,
        totalLabel: "TOTAL",
        totalValue: `$${formatearMonto(subtotal)}`,
        notes: notas,
        footerText: "Gracias por su preferencia - JumTech RD | Soluciones Tecnológicas",
      })
    } catch (error) {
      console.error("Error generando PDF:", error)
      alert("Error al generar el PDF. Inténtalo de nuevo.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSave = () => {
    if (!cliente || productosSeleccionados.length === 0) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    if (!isValidOptionalEmail(email)) {
      alert("Ingresa un correo válido o deja el campo vacío")
      return
    }

    const productosFinales = productosSeleccionados.map(prepararProductoParaGuardar)
    const subtotal = productosFinales.reduce((sum, producto) => sum + (producto.total ?? producto.precio * producto.cantidad), 0)

    const factura: Factura = {
      id: editingFactura?.id || Date.now().toString(),
      numero,
      cliente,
      email: email.trim(),
      telefono,
      direccion,
      clientId,
      sourceQuoteId: editingFactura?.sourceQuoteId || null,
      paymentMethod,
      fecha: new Date(fecha).toISOString(),
      vencimiento: new Date(vencimiento).toISOString(),
      productos: productosFinales,
      subtotal,
      impuestos: 0,
      total: subtotal,
      estado,
      notas,
      companyName: companyName || undefined,
      identification: identification || undefined,
    }

    onSave(factura)
  }

  const getEstadoColor = (estadoActual: string) => {
    switch (estadoActual) {
      case "pendiente":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
      case "pagada":
        return "bg-green-600/20 text-green-400 border-green-600/30"
      case "vencida":
        return "bg-red-600/20 text-red-400 border-red-600/30"
      case "cancelada":
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <Card className="w-full max-w-5xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50 max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-h-[90vh]">
        <CardHeader className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-600/30">
              {editingFactura ? "Editar Factura" : "Nueva Factura"}
            </Badge>
            <CardTitle className="text-xl md:text-3xl font-bold text-white mb-2">Crear Factura</CardTitle>
            <p className="text-gray-300">Completa los datos y genera una factura con PDF</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información de Factura */}
          <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-400" />
              Información de Factura
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número de Factura</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="FAC-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Emisión</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                  <option value="vencida">Vencida</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Método de pago</label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "transferencia" | "efectivo")}>
                  <SelectTrigger className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-gray-700 text-white">
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-400" />
              Información del Cliente
            </h3>
            <div className="mb-4">
              <ClientSelector
                clients={clientes}
                selectedClientId={clientId}
                onSelect={handleSelectClient}
                label="Cliente reutilizable"
                description="Busca y selecciona un cliente para autocompletar la factura o continúa de forma manual."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Empresa opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Identificación</label>
                <input
                  type="text"
                  value={identification}
                  onChange={(e) => setIdentification(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="RNC, cédula o ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="cliente@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+1 (809) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Dirección del cliente"
                />
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-700/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-400" />
                Productos y Servicios
              </h3>
              <Button onClick={() => setShowProductos(true)} className="bg-purple-600 hover:bg-purple-700" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            {productosSeleccionados.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No hay productos seleccionados</p>
                <Button
                  onClick={() => setShowProductos(true)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Agregar Primer Producto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {productosSeleccionados.map((producto) => {
                  const pricing = calcularProductoFactura(producto)

                  return (
                    <div
                      key={producto.id}
                      className="flex flex-col gap-4 p-4 bg-white/5 rounded-lg border border-gray-700/30 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="break-words font-medium text-white">{producto.nombre}</h4>
                        <p className="break-words text-sm text-gray-400">{producto.descripcion}</p>
                        <Badge className="mt-1 bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                          {producto.categoria}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center lg:space-x-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-white w-8 text-center">{producto.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-center">
                          <label className="text-xs text-gray-400 block mb-1">% Ganancia</label>
                          <select
                            value={producto.profitPercentage || 0}
                            onChange={(e) => actualizarPorcentajeGanancia(producto.id, Number.parseInt(e.target.value))}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            {PROFIT_PERCENTAGE_OPTIONS.map((percentage) => (
                              <option key={percentage} value={percentage}>
                                {percentage}%
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-white font-medium">${formatearMonto(pricing.totalItem)}</p>
                          <p className="text-sm text-gray-400">Base: ${formatearMonto(producto.precio)} c/u</p>
                          <p className="text-sm font-semibold text-green-400">
                            Final: ${formatearMonto(pricing.precioFinalUnitario)} c/u
                          </p>
                        </div>
                        <button
                          onClick={() => eliminarProducto(producto.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Notas y Términos</h3>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Términos y condiciones, notas especiales, instrucciones de pago, etc..."
            />
          </div>

          {/* Resumen */}
          {productosSeleccionados.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-purple-400" />
                Resumen de Factura
              </h3>
              <div className="space-y-3">
	                <div className="flex justify-between text-gray-300">
	                  <span>Subtotal:</span>
	                  <span>${formatearMonto(calcularSubtotal())}</span>
	                </div>
	                <div className="border-t border-gray-700 pt-3">
	                  <div className="flex justify-between text-white font-bold text-lg">
	                    <span>Total:</span>
	                    <span>${formatearMonto(calcularTotal())}</span>
	                  </div>
	                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-300">Estado:</span>
                  <Badge className={getEstadoColor(estado)}>{estado}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-white/10"
            >
              Cancelar
            </Button>
            {productosSeleccionados.length > 0 && (
              <Button
                onClick={generarPDF}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generar PDF
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!cliente || productosSeleccionados.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingFactura ? "Actualizar" : "Guardar"} Factura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Productos */}
      {showProductos && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
          <Card className="w-full max-w-4xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50 max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-h-[80vh]">
            <CardHeader className="relative">
              <button
                onClick={() => setShowProductos(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <CardTitle className="text-xl font-bold text-white">Seleccionar Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productos
                  .filter((p) => p.stock && p.stock > 0)
                  .map((producto) => (
                    <Card
                      key={producto.id}
                      className="bg-white/5 border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
                      onClick={() => agregarProducto(producto)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                          <h4 className="break-words font-medium text-white">{producto.nombre}</h4>
                          <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                            {producto.categoria}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{producto.descripcion}</p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="text-lg font-bold text-purple-400">
                              ${producto.precio.toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-400">Stock: {producto.stock}</p>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              {productos.filter((p) => p.stock && p.stock > 0).length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No hay productos disponibles</h3>
                  <p className="text-gray-400">Agrega productos desde el panel de administración</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
