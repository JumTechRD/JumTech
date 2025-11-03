"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Trash2, Save, Calculator, User, Package, Download, FileText } from "lucide-react"
import jsPDF from "jspdf"

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
}

interface Factura {
  id: string
  numero: string
  cliente: string
  email: string
  telefono: string
  direccion: string
  fecha: string
  vencimiento: string
  productos: ProductoEnFactura[]
  subtotal: number
  impuestos: number
  total: number
  estado: "pendiente" | "pagada" | "vencida" | "cancelada"
  notas?: string
}

interface FacturaCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (factura: Factura) => void
  editingFactura?: Factura | null
  productos: Producto[]
}

export function FacturaCreator({ isOpen, onClose, onSave, editingFactura, productos }: FacturaCreatorProps) {
  const [numero, setNumero] = useState("")
  const [cliente, setCliente] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [fecha, setFecha] = useState("")
  const [vencimiento, setVencimiento] = useState("")
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoEnFactura[]>([])
  const [estado, setEstado] = useState<"pendiente" | "pagada" | "vencida" | "cancelada">("pendiente")
  const [notas, setNotas] = useState("")
  const [showProductos, setShowProductos] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    if (editingFactura) {
      setNumero(editingFactura.numero)
      setCliente(editingFactura.cliente)
      setEmail(editingFactura.email)
      setTelefono(editingFactura.telefono)
      setDireccion(editingFactura.direccion)
      setFecha(editingFactura.fecha.split("T")[0])
      setVencimiento(editingFactura.vencimiento.split("T")[0])
      setProductosSeleccionados(editingFactura.productos)
      setEstado(editingFactura.estado)
      setNotas(editingFactura.notas || "")
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
    }
  }, [editingFactura, isOpen])

  if (!isOpen) return null

  const agregarProducto = (producto: Producto) => {
    const existingProduct = productosSeleccionados.find((p) => p.id === producto.id)
    if (existingProduct) {
      setProductosSeleccionados(
        productosSeleccionados.map((p) => (p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p)),
      )
    } else {
      setProductosSeleccionados([...productosSeleccionados, { ...producto, cantidad: 1 }])
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

  const eliminarProducto = (id: string) => {
    setProductosSeleccionados(productosSeleccionados.filter((p) => p.id !== id))
  }

  const calcularSubtotal = () => {
    return productosSeleccionados.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0)
  }

  const calcularImpuestos = () => {
    return calcularSubtotal() * 0.18 // 18% ITBIS en RD
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularImpuestos()
  }

  const generarPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      const doc = new jsPDF()

      // Configuración de colores corporativos
      const primaryColor = [211, 38, 48] // Rojo corporativo #D32630
      const secondaryColor = [47, 47, 47] // Gris oscuro corporativo #2F2F2F
      const textColor = [31, 41, 55] // Gray-800

      // Header con logo y datos de empresa
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 40, "F")

      // Logo placeholder (en un caso real cargarías la imagen)
      doc.setFillColor(255, 255, 255)
      doc.rect(15, 10, 20, 20, "F")
      doc.setTextColor(...primaryColor)
      doc.setFontSize(8)
      doc.text("LOGO", 23, 22)

      // Datos de empresa
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("JumTech RD", 45, 20)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Soluciones Tecnológicas Integrales", 45, 27)
      doc.text("Email: jumtechRD@gmail.com", 45, 33)
      doc.text("Tel: +1 (809) 984-8283", 45, 37)

      // Título FACTURA
      doc.setTextColor(...primaryColor)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURA", 150, 25)

      // Información de factura
      doc.setTextColor(...textColor)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Número: ${numero}`, 150, 35)

      // Datos del cliente
      let yPos = 60
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURAR A:", 15, yPos)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      yPos += 8
      doc.text(cliente, 15, yPos)
      yPos += 6
      if (direccion) {
        doc.text(direccion, 15, yPos)
        yPos += 6
      }
      if (telefono) {
        doc.text(`Tel: ${telefono}`, 15, yPos)
        yPos += 6
      }
      if (email) {
        doc.text(`Email: ${email}`, 15, yPos)
      }

      // Fechas
      doc.setFont("helvetica", "bold")
      doc.text("FECHA:", 150, 60)
      doc.text("VENCIMIENTO:", 150, 68)

      doc.setFont("helvetica", "normal")
      doc.text(new Date(fecha).toLocaleDateString(), 175, 60)
      doc.text(new Date(vencimiento).toLocaleDateString(), 175, 68)

      // Estado
      doc.setFont("helvetica", "bold")
      doc.text("ESTADO:", 150, 76)
      doc.setFont("helvetica", "normal")
      doc.text(estado.toUpperCase(), 175, 76)

      // Tabla de productos
      yPos = 100

      // Header de tabla
      doc.setFillColor(...secondaryColor)
      doc.rect(15, yPos - 5, 180, 10, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.text("DESCRIPCIÓN", 20, yPos)
      doc.text("CANT.", 130, yPos)
      doc.text("PRECIO", 150, yPos)
      doc.text("TOTAL", 175, yPos)

      // Productos
      doc.setTextColor(...textColor)
      doc.setFont("helvetica", "normal")
      yPos += 15

      productosSeleccionados.forEach((producto) => {
        // Nombre del producto
        doc.setFont("helvetica", "bold")
        doc.text(producto.nombre, 20, yPos)

        // Descripción
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.text(producto.descripcion, 20, yPos + 4)

        // Cantidad, precio y total
        doc.setFontSize(10)
        doc.text(producto.cantidad.toString(), 135, yPos)
        doc.text(`$${producto.precio.toLocaleString()}`, 150, yPos)
        doc.text(`$${(producto.precio * producto.cantidad).toLocaleString()}`, 175, yPos)

        yPos += 15
      })

      // Totales
      yPos += 10
      const totalsX = 140

      doc.setFont("helvetica", "normal")
      doc.text("Subtotal:", totalsX, yPos)
      doc.text(`$${calcularSubtotal().toLocaleString()}`, 175, yPos)

      yPos += 8
      doc.text("ITBIS (18%):", totalsX, yPos)
      doc.text(`$${calcularImpuestos().toLocaleString()}`, 175, yPos)

      yPos += 8
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("TOTAL:", totalsX, yPos)
      doc.text(`$${calcularTotal().toLocaleString()}`, 175, yPos)

      // Notas
      if (notas) {
        yPos += 20
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("NOTAS:", 15, yPos)

        doc.setFont("helvetica", "normal")
        const notasLines = doc.splitTextToSize(notas, 180)
        doc.text(notasLines, 15, yPos + 8)
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(8)
      doc.setTextColor(...secondaryColor)
      doc.text("Gracias por su preferencia - JumTech RD", 15, pageHeight - 20)
      doc.text("Email: jumtechRD@gmail.com | Tel: +1 (809) 984-8283", 15, pageHeight - 15)
      doc.text("República Dominicana", 15, pageHeight - 10)

      // Guardar PDF
      doc.save(`Factura_${numero}_${cliente.replace(/\s+/g, "_")}.pdf`)
    } catch (error) {
      console.error("Error generando PDF:", error)
      alert("Error al generar el PDF. Inténtalo de nuevo.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSave = () => {
    if (!cliente || !email || productosSeleccionados.length === 0) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const factura: Factura = {
      id: editingFactura?.id || Date.now().toString(),
      numero,
      cliente,
      email,
      telefono,
      direccion,
      fecha: new Date(fecha).toISOString(),
      vencimiento: new Date(vencimiento).toISOString(),
      productos: productosSeleccionados,
      subtotal: calcularSubtotal(),
      impuestos: calcularImpuestos(),
      total: calcularTotal(),
      estado,
      notas,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
          <div className="text-center">
            <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-600/30">
              {editingFactura ? "Editar Factura" : "Nueva Factura"}
            </Badge>
            <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-2">Crear Factura Profesional</CardTitle>
            <p className="text-gray-300">Completa los datos y genera una factura con PDF</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información de Factura */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-400" />
              Información de Factura
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-400" />
              Información del Cliente
            </h3>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico *</label>
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
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
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
                {productosSeleccionados.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{producto.nombre}</h4>
                      <p className="text-sm text-gray-400">{producto.descripcion}</p>
                      <Badge className="mt-1 bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                        {producto.categoria}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
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
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ${(producto.precio * producto.cantidad).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">${producto.precio} c/u</p>
                      </div>
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
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
            <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-purple-400" />
                Resumen de Factura
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>${calcularSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>ITBIS (18%):</span>
                  <span>${calcularImpuestos().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>${calcularTotal().toLocaleString()}</span>
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
              className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10 bg-transparent"
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
              disabled={!cliente || !email || productosSeleccionados.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingFactura ? "Actualizar" : "Guardar"} Factura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Productos */}
      {showProductos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50 max-h-[80vh] overflow-y-auto">
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
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-white">{producto.nombre}</h4>
                          <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                            {producto.categoria}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{producto.descripcion}</p>
                        <div className="flex justify-between items-center">
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
