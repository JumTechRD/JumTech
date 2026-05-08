"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Trash2, Save, Calculator, User, Package, Download, Edit3, Edit, Settings } from "lucide-react"
import { fetchAdminClients, fetchAdminProducts } from "@/lib/admin-api-client"
import { ClientSelector } from "@/components/client-selector"
import type { ClientRecord } from "@/lib/admin-clients"
import { generateFinancialPdf } from "@/lib/pdf-documents"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  activo?: boolean
}

interface ProductoEnCotizacion extends Producto {
  cantidad: number
  esManual?: boolean
  moneda?: "USD" | "RD$"
  porcentajeExtra?: number // Nuevo campo para el porcentaje extra
}

interface Cotizacion {
  id: string
  numeroFactura?: string
  cliente: string
  email: string
  telefono: string
  clientId?: string | null
  fecha: string
  productos: ProductoEnCotizacion[]
  subtotal: number
  impuestos: number
  total: number
  estado: "pendiente" | "enviada" | "aprobada" | "rechazada"
  notas?: string
  monedaPrincipal?: "USD" | "RD$"
  itbisActivo?: boolean
  porcentajeItbis?: number
  companyName?: string
  identification?: string
  address?: string
}

interface CotizacionCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cotizacion: Cotizacion) => void
  editingCotizacion?: Cotizacion | null
}

const productosDisponiblesInicial: Producto[] = [
  {
    id: "1",
    nombre: "Mantenimiento Básico PC",
    descripcion: "Limpieza, optimización y actualización básica del sistema operativo",
    precio: 50,
    categoria: "Mantenimiento",
  },
  {
    id: "2",
    nombre: "Mantenimiento Completo PC",
    descripcion: "Limpieza profunda, optimización, respaldo de datos y reparaciones menores",
    precio: 100,
    categoria: "Mantenimiento",
  },
  {
    id: "3",
    nombre: "Cámara IP 4K",
    descripcion: "Cámara de seguridad IP 4K con visión nocturna y detección de movimiento",
    precio: 200,
    categoria: "Seguridad",
  },
  {
    id: "4",
    nombre: "Sistema NVR 8 canales",
    descripcion: "Sistema de grabación para 8 cámaras con disco duro de 1TB incluido",
    precio: 500,
    categoria: "Seguridad",
  },
  {
    id: "5",
    nombre: "Instalación Cableado Cat6",
    descripcion: "Instalación de punto de red Cat6 certificado con conectores RJ45",
    precio: 25,
    categoria: "Redes",
  },
  {
    id: "6",
    nombre: "Configuración Router Empresarial",
    descripcion: "Configuración y optimización de router empresarial con seguridad avanzada",
    precio: 150,
    categoria: "Redes",
  },
  {
    id: "7",
    nombre: "Desarrollo Web Básico",
    descripcion: "Sitio web básico hasta 5 páginas con diseño responsivo",
    precio: 800,
    categoria: "Desarrollo",
  },
  {
    id: "8",
    nombre: "Sistema ERP Personalizado",
    descripcion: "Sistema ERP adaptado a las necesidades específicas del cliente",
    precio: 5000,
    categoria: "Desarrollo",
  },
  {
    id: "9",
    nombre: "Auditoría de Seguridad",
    descripcion: "Evaluación completa de seguridad informática con reporte detallado",
    precio: 300,
    categoria: "Ciberseguridad",
  },
  {
    id: "10",
    nombre: "Implementación Firewall",
    descripcion: "Instalación y configuración de firewall empresarial con políticas de seguridad",
    precio: 400,
    categoria: "Ciberseguridad",
  },
]

export function CotizacionCreator({ isOpen, onClose, onSave, editingCotizacion }: CotizacionCreatorProps) {
  const [numeroFactura, setNumeroFactura] = useState("")
  const [cliente, setCliente] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [notas, setNotas] = useState("")
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoEnCotizacion[]>([])
  const [showProductos, setShowProductos] = useState(false)
  const [showProductoManual, setShowProductoManual] = useState(false)
  const [showEditProducto, setShowEditProducto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<ProductoEnCotizacion | null>(null)
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([])
  const [clientes, setClientes] = useState<ClientRecord[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [monedaPrincipal, setMonedaPrincipal] = useState<"USD" | "RD$">("RD$")
  const [tasaCambio, setTasaCambio] = useState(58) // Tasa USD a RD$
  const [itbisActivo, setItbisActivo] = useState(false)
  const [porcentajeItbis, setPorcentajeItbis] = useState(0)
  const [clientId, setClientId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [identification, setIdentification] = useState("")
  const [address, setAddress] = useState("")

  // Estados para producto manual
  const [nombreManual, setNombreManual] = useState("")
  const [descripcionManual, setDescripcionManual] = useState("")
  const [precioManual, setPrecioManual] = useState("")
  const [categoriaManual, setCategoriaManual] = useState("")
  const [monedaManual, setMonedaManual] = useState<"USD" | "RD$">("RD$")

  // Estados para editar producto
  const [nombreEdit, setNombreEdit] = useState("")
  const [descripcionEdit, setDescripcionEdit] = useState("")
  const [precioEdit, setPrecioEdit] = useState("")
  const [categoriaEdit, setCategoriaEdit] = useState("")
  const [monedaEdit, setMonedaEdit] = useState<"USD" | "RD$">("RD$")
  const [cantidadEdit, setCantidadEdit] = useState(1)
  const [porcentajeExtraEdit, setPorcentajeExtraEdit] = useState(0)

  useEffect(() => {
    let isMounted = true

    const cargarDatos = async () => {
      try {
        const [productosData, clientsData] = await Promise.all([
          fetchAdminProducts<Producto[]>(),
          fetchAdminClients<ClientRecord[]>(),
        ])
        const productosActivos = productosData.filter((p) => p.activo !== false)
        if (isMounted) {
          setProductosDisponibles([...productosActivos, ...productosDisponiblesInicial])
          setClientes(clientsData)
        }
      } catch (error) {
        if (isMounted) {
          setProductosDisponibles(productosDisponiblesInicial)
          setClientes([])
        }
      }
    }

    void cargarDatos()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (editingCotizacion) {
      setNumeroFactura(editingCotizacion.numeroFactura || "")
      setCliente(editingCotizacion.cliente)
      setEmail(editingCotizacion.email)
      setTelefono(editingCotizacion.telefono)
      setNotas(editingCotizacion.notas || "")
      setProductosSeleccionados(
        editingCotizacion.productos.map((p) => ({
          ...p,
          porcentajeExtra: p.porcentajeExtra || 0,
        })),
      )
      setMonedaPrincipal(editingCotizacion.monedaPrincipal || "RD$")
      setItbisActivo(false)
      setPorcentajeItbis(0)
      setClientId(editingCotizacion.clientId || null)
      setCompanyName(editingCotizacion.companyName || "")
      setIdentification(editingCotizacion.identification || "")
      setAddress(editingCotizacion.address || "")
    } else {
      // Reset form y generar número automático
      const now = new Date()
      const numeroAuto = `COT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(Date.now()).slice(-4)}`
      setNumeroFactura(numeroAuto)
      setCliente("")
      setEmail("")
      setTelefono("")
      setNotas("")
      setProductosSeleccionados([])
      setMonedaPrincipal("RD$")
      setItbisActivo(false)
      setPorcentajeItbis(0)
      setClientId(null)
      setCompanyName("")
      setIdentification("")
      setAddress("")
    }
  }, [editingCotizacion])

  useEffect(() => {
    if (!clientId) return

    const selectedClient = clientes.find((client) => client.id === clientId)
    if (!selectedClient) return

    setCompanyName(selectedClient.companyName || "")
    setIdentification(selectedClient.identification || "")
    setAddress(selectedClient.address || "")
  }, [clientId, clientes])

  const convertirPrecio = (precio: number, monedaOrigen: "USD" | "RD$", monedaDestino: "USD" | "RD$") => {
    if (monedaOrigen === monedaDestino) return precio
    if (monedaOrigen === "USD" && monedaDestino === "RD$") return precio * tasaCambio
    if (monedaOrigen === "RD$" && monedaDestino === "USD") return precio / tasaCambio
    return precio
  }

  const formatearMonto = (monto: number) => {
    return monto.toLocaleString("es-DO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-DO")
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
    setCompanyName(client.companyName || "")
    setIdentification(client.identification || "")
    setAddress(client.address || "")
  }

  const generarPDF = async () => {
    if (!cliente || !email || productosSeleccionados.length === 0) {
      alert("Por favor completa todos los campos antes de generar el PDF")
      return
    }

    setIsGeneratingPDF(true)

    try {
      const items = productosSeleccionados.map((producto) => {
        const precioEnMonedaPrincipal = convertirPrecio(producto.precio, producto.moneda || "RD$", monedaPrincipal)
        const totalConExtra =
          precioEnMonedaPrincipal * producto.cantidad * (1 + (producto.porcentajeExtra || 0) / 100)

        return {
          name: producto.nombre,
          description: producto.descripcion,
          quantity: producto.cantidad,
          unitPriceLabel: `${monedaPrincipal} ${formatearMonto(precioEnMonedaPrincipal)}`,
          lineTotalLabel: `${monedaPrincipal} ${formatearMonto(totalConExtra)}`,
        }
      })

      const subtotal = calcularSubtotal()
      const fileName = `Cotizacion-${numeroFactura}-${cliente.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
      await generateFinancialPdf({
        fileName,
        title: "COTIZACIÓN",
        referenceLabel: "Cotización",
        referenceValue: numeroFactura,
        dateLabel: "Fecha",
        dateValue: formatearFecha(new Date()),
        customerName: cliente,
        customerEmail: email,
        customerPhone: telefono || "No especificado",
        customerCompanyName: companyName || undefined,
        customerIdentification: identification || undefined,
        customerAddress: address || undefined,
        items,
        subtotalLabel: "Subtotal",
        subtotalValue: `${monedaPrincipal} ${formatearMonto(subtotal)}`,
        totalLabel: "TOTAL",
        totalValue: `${monedaPrincipal} ${formatearMonto(subtotal)}`,
        notes: notas,
        validityNote: "Esta cotización es válida por 15 días.",
        footerText: "Gracias por su confianza - Jumtech RD | Soluciones Tecnológicas",
      })

      alert("✅ Cotización generada exitosamente!")
    } catch (error) {
      console.error("Error generando PDF:", error)
      alert("❌ Error al generar el PDF. Por favor intenta nuevamente.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!isOpen) return null

  const agregarProducto = (producto: Producto) => {
    const existingProduct = productosSeleccionados.find((p) => p.id === producto.id)
    if (existingProduct) {
      setProductosSeleccionados(
        productosSeleccionados.map((p) => (p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p)),
      )
    } else {
      setProductosSeleccionados([
        ...productosSeleccionados,
        { ...producto, cantidad: 1, moneda: "RD$", porcentajeExtra: 0 },
      ])
    }
    setShowProductos(false)
  }

  const agregarProductoManual = () => {
    if (!nombreManual || !precioManual || isNaN(Number(precioManual))) {
      alert("Por favor completa el nombre y precio del producto")
      return
    }

    const productoManual: ProductoEnCotizacion = {
      id: `manual_${Date.now()}`,
      nombre: nombreManual,
      descripcion: descripcionManual || "Producto personalizado",
      precio: Number.parseFloat(precioManual),
      categoria: categoriaManual || "Personalizado",
      cantidad: 1,
      esManual: true,
      moneda: monedaManual,
      porcentajeExtra: 0,
    }

    setProductosSeleccionados([...productosSeleccionados, productoManual])

    // Limpiar formulario
    setNombreManual("")
    setDescripcionManual("")
    setPrecioManual("")
    setCategoriaManual("")
    setMonedaManual("RD$")
    setShowProductoManual(false)
  }

  const iniciarEditarProducto = (producto: ProductoEnCotizacion) => {
    setProductoEditando(producto)
    setNombreEdit(producto.nombre)
    setDescripcionEdit(producto.descripcion)
    setPrecioEdit(producto.precio.toString())
    setCategoriaEdit(producto.categoria)
    setMonedaEdit(producto.moneda || "RD$")
    setCantidadEdit(producto.cantidad)
    setPorcentajeExtraEdit(producto.porcentajeExtra || 0)
    setShowEditProducto(true)
  }

  const guardarProductoEditado = () => {
    if (!nombreEdit || !precioEdit || isNaN(Number(precioEdit)) || !productoEditando) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const productoActualizado: ProductoEnCotizacion = {
      ...productoEditando,
      nombre: nombreEdit,
      descripcion: descripcionEdit,
      precio: Number.parseFloat(precioEdit),
      categoria: categoriaEdit,
      moneda: monedaEdit,
      cantidad: cantidadEdit,
      porcentajeExtra: porcentajeExtraEdit,
    }

    setProductosSeleccionados(
      productosSeleccionados.map((p) => (p.id === productoEditando.id ? productoActualizado : p)),
    )

    // Limpiar y cerrar
    setProductoEditando(null)
    setShowEditProducto(false)
    setNombreEdit("")
    setDescripcionEdit("")
    setPrecioEdit("")
    setCategoriaEdit("")
    setMonedaEdit("RD$")
    setCantidadEdit(1)
    setPorcentajeExtraEdit(0)
  }

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarProducto(id)
      return
    }
    setProductosSeleccionados(productosSeleccionados.map((p) => (p.id === id ? { ...p, cantidad } : p)))
  }

  const actualizarPrecio = (id: string, nuevoPrecio: number) => {
    if (nuevoPrecio < 0) return
    setProductosSeleccionados(productosSeleccionados.map((p) => (p.id === id ? { ...p, precio: nuevoPrecio } : p)))
  }

  const actualizarMoneda = (id: string, nuevaMoneda: "USD" | "RD$") => {
    setProductosSeleccionados(productosSeleccionados.map((p) => (p.id === id ? { ...p, moneda: nuevaMoneda } : p)))
  }

  const actualizarPorcentajeExtra = (id: string, porcentaje: number) => {
    setProductosSeleccionados(
      productosSeleccionados.map((p) => (p.id === id ? { ...p, porcentajeExtra: porcentaje } : p)),
    )
  }

  const eliminarProducto = (id: string) => {
    setProductosSeleccionados(productosSeleccionados.filter((p) => p.id !== id))
  }

  const calcularSubtotal = () => {
    return productosSeleccionados.reduce((sum, producto) => {
      const precioEnMonedaPrincipal = convertirPrecio(producto.precio, producto.moneda || "RD$", monedaPrincipal)
      const subtotalProducto = precioEnMonedaPrincipal * producto.cantidad
      const porcentajeExtra = (producto.porcentajeExtra || 0) / 100
      const totalConExtra = subtotalProducto * (1 + porcentajeExtra)
      return sum + totalConExtra
    }, 0)
  }

  const calcularImpuestos = () => {
    return 0
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularImpuestos()
  }

  const handleSave = () => {
    if (!cliente || !email || productosSeleccionados.length === 0) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const cotizacion: Cotizacion = {
      id: editingCotizacion?.id || Date.now().toString(),
      numeroFactura,
      cliente,
      email,
      telefono,
      clientId,
      fecha: editingCotizacion?.fecha || new Date().toISOString(),
      productos: productosSeleccionados,
      subtotal: calcularSubtotal(),
      impuestos: 0,
      total: calcularTotal(),
      estado: editingCotizacion?.estado || "pendiente",
      notas,
      monedaPrincipal,
      itbisActivo: false,
      porcentajeItbis: 0,
      companyName: companyName || undefined,
      identification: identification || undefined,
      address: address || undefined,
    }

    onSave(cotizacion)
  }

  // Actualizar la función calcularSubtotalBase para mostrar el subtotal sin extra
  const calcularSubtotalBase = () => {
    return productosSeleccionados.reduce((sum, producto) => {
      const precioEnMonedaPrincipal = convertirPrecio(producto.precio, producto.moneda || "RD$", monedaPrincipal)
      return sum + precioEnMonedaPrincipal * producto.cantidad
    }, 0)
  }

  // Actualizar la función calcularTotalExtra para mostrar solo el monto extra
  const calcularTotalExtra = () => {
    return productosSeleccionados.reduce((sum, producto) => {
      const precioEnMonedaPrincipal = convertirPrecio(producto.precio, producto.moneda || "RD$", monedaPrincipal)
      const subtotalProducto = precioEnMonedaPrincipal * producto.cantidad
      const porcentajeExtra = (producto.porcentajeExtra || 0) / 100
      const montoExtra = subtotalProducto * porcentajeExtra
      return sum + montoExtra
    }, 0)
  }

  // Reemplazar la sección de Resumen con el nuevo formato:
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
          <div className="text-center">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">
              {editingCotizacion ? "Editar Cotización" : "Nueva Cotización"}
            </Badge>
            <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-2">Crear Cotización</CardTitle>
            <p className="text-gray-300">Completa los datos del cliente y selecciona los productos</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Número de Factura */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-400" />
              Información de Cotización
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Número de Cotización/Factura</label>
              <input
                type="text"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="COT-2024-001"
              />
            </div>
          </div>

          {/* Configuración de Moneda */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-green-400" />
              Configuración Financiera
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Moneda Principal</label>
                <select
                  value={monedaPrincipal}
                  onChange={(e) => setMonedaPrincipal(e.target.value as "USD" | "RD$")}
                  className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="RD$">Pesos Dominicanos (RD$)</option>
                  <option value="USD">Dólares Americanos (USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tasa de Cambio (USD → RD$)</label>
                <input
                  type="number"
                  value={tasaCambio}
                  onChange={(e) => setTasaCambio(Number.parseFloat(e.target.value) || 58)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="58.00"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <p>
                1 USD = {tasaCambio} RD$ | 1 RD$ = {(1 / tasaCambio).toFixed(4)} USD
              </p>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-red-400" />
              Información del Cliente
            </h3>
            <div className="mb-4">
              <ClientSelector
                clients={clientes}
                selectedClientId={clientId}
                onSelect={handleSelectClient}
                label="Cliente reutilizable"
                description="Busca y selecciona un cliente para completar nombre, correo, teléfono y datos fiscales."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="cliente@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="+1 (809) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Identificación</label>
                <input
                  type="text"
                  value={identification}
                  onChange={(e) => setIdentification(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="RNC, cédula o ID"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Dirección del cliente"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Notas Adicionales</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Notas especiales, términos, condiciones, etc..."
              />
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Package className="h-5 w-5 mr-2 text-red-400" />
                Productos y Servicios
              </h3>
              <div className="flex gap-2">
                <Button onClick={() => setShowProductos(true)} className="bg-red-600 hover:bg-red-700" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Catálogo
                </Button>
                <Button onClick={() => setShowProductoManual(true)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Manual
                </Button>
              </div>
            </div>

            {productosSeleccionados.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No hay productos seleccionados</p>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => setShowProductos(true)} className="bg-red-600 hover:bg-red-700" size="sm">
                    Agregar del Catálogo
                  </Button>
                  <Button
                    onClick={() => setShowProductoManual(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Crear Producto Manual
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {productosSeleccionados.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{producto.nombre}</h4>
                      </div>
                      <p className="text-sm text-gray-400">{producto.descripcion}</p>
                      <Badge className="mt-1 bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs">
                        {producto.categoria}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Cantidad */}
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

                      {/* Porcentaje Extra */}
                      <div className="text-center">
                        <label className="text-xs text-gray-400 block mb-1">% Extra</label>
                        <select
                          value={producto.porcentajeExtra || 0}
                          onChange={(e) => actualizarPorcentajeExtra(producto.id, Number.parseInt(e.target.value))}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                        >
                          <option value={0}>0%</option>
                          <option value={20}>20%</option>
                          <option value={30}>30%</option>
                          <option value={40}>40%</option>
                        </select>
                      </div>

                      {/* Precio y Moneda */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <select
                            value={producto.moneda || "RD$"}
                            onChange={(e) => actualizarMoneda(producto.id, e.target.value as "USD" | "RD$")}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          >
                            <option value="RD$">RD$</option>
                            <option value="USD">USD</option>
                          </select>
                          {producto.esManual ? (
                            <input
                              type="number"
                              value={producto.precio}
                              onChange={(e) => actualizarPrecio(producto.id, Number.parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm text-right"
                              min="0"
                              step="0.01"
                            />
                          ) : (
                            <span className="text-white font-medium text-sm">{producto.precio.toLocaleString()}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          Subtotal: {producto.moneda || "RD$"} {(producto.precio * producto.cantidad).toLocaleString()}
                        </p>
                        {(producto.porcentajeExtra || 0) > 0 && (
                          <p className="text-xs text-orange-400">
                            +{producto.porcentajeExtra}%: {producto.moneda || "RD$"}{" "}
                            {(
                              producto.precio *
                              producto.cantidad *
                              ((producto.porcentajeExtra || 0) / 100)
                            ).toLocaleString()}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-green-400">
                          Total: {producto.moneda || "RD$"}{" "}
                          {(
                            producto.precio *
                            producto.cantidad *
                            (1 + (producto.porcentajeExtra || 0) / 100)
                          ).toLocaleString()}
                        </p>
                        {producto.moneda !== monedaPrincipal && (
                          <p className="text-xs text-blue-400">
                            ≈ {monedaPrincipal}{" "}
                            {convertirPrecio(
                              producto.precio * producto.cantidad * (1 + (producto.porcentajeExtra || 0) / 100),
                              producto.moneda || "RD$",
                              monedaPrincipal,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Botón Editar */}
                      <button
                        onClick={() => iniciarEditarProducto(producto)}
                        className="text-blue-400 hover:text-blue-300 p-2"
                        title="Editar producto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

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

          {/* Resumen */}
          {productosSeleccionados.length > 0 && (
            <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-red-400" />
                Resumen de Cotización ({monedaPrincipal})
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal Base:</span>
                  <span>
                    {monedaPrincipal} {calcularSubtotalBase().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal con Extra:</span>
                  <span>
                    {monedaPrincipal} {calcularSubtotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-orange-400">
                  <span>Total del Extra:</span>
                  <span>
                    {monedaPrincipal} {calcularTotalExtra().toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total a Cobrar:</span>
                    <span>
                      {monedaPrincipal} {calcularTotal().toLocaleString()}
                    </span>
                  </div>
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
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={!cliente || !email || productosSeleccionados.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingCotizacion ? "Actualizar" : "Guardar"} Cotización
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Productos del Catálogo */}
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
              <CardTitle className="text-xl font-bold text-white">Seleccionar del Catálogo</CardTitle>
              <p className="text-gray-300">Productos disponibles en inventario</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productosDisponibles.map((producto) => (
                  <Card
                    key={producto.id}
                    className="bg-white/5 border-gray-700/50 hover:border-red-500/50 transition-all cursor-pointer"
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
                        <span className="text-lg font-bold text-red-400">RD$ {producto.precio.toLocaleString()}</span>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Producto Manual */}
      {showProductoManual && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50">
            <CardHeader className="relative">
              <button
                onClick={() => setShowProductoManual(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <CardTitle className="text-xl font-bold text-white">Crear Producto Manual</CardTitle>
              <p className="text-gray-300">Para productos de suplidores o personalizados</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Producto *</label>
                <input
                  type="text"
                  value={nombreManual}
                  onChange={(e) => setNombreManual(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Laptop HP Pavilion (Suplidor)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={descripcionManual}
                  onChange={(e) => setDescripcionManual(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descripción detallada del producto..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Moneda *</label>
                  <select
                    value={monedaManual}
                    onChange={(e) => setMonedaManual(e.target.value as "USD" | "RD$")}
                    className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RD$">RD$</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio *</label>
                  <input
                    type="number"
                    value={precioManual}
                    onChange={(e) => setPrecioManual(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                  <input
                    type="text"
                    value={categoriaManual}
                    onChange={(e) => setCategoriaManual(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Suplidor, Personalizado"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowProductoManual(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={agregarProductoManual}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!nombreManual || !precioManual}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Editar Producto */}
      {showEditProducto && productoEditando && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50">
            <CardHeader className="relative">
              <button
                onClick={() => setShowEditProducto(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <CardTitle className="text-xl font-bold text-white">Editar Producto</CardTitle>
              <p className="text-gray-300">Modifica los datos del producto seleccionado</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Producto *</label>
                <input
                  type="text"
                  value={nombreEdit}
                  onChange={(e) => setNombreEdit(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={descripcionEdit}
                  onChange={(e) => setDescripcionEdit(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descripción del producto..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cantidad *</label>
                  <input
                    type="number"
                    value={cantidadEdit}
                    onChange={(e) => setCantidadEdit(Number.parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">% Extra</label>
                  <select
                    value={porcentajeExtraEdit}
                    onChange={(e) => setPorcentajeExtraEdit(Number.parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>0%</option>
                    <option value={20}>20%</option>
                    <option value={30}>30%</option>
                    <option value={40}>40%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Moneda *</label>
                  <select
                    value={monedaEdit}
                    onChange={(e) => setMonedaEdit(e.target.value as "USD" | "RD$")}
                    className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RD$">RD$</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio *</label>
                  <input
                    type="number"
                    value={precioEdit}
                    onChange={(e) => setPrecioEdit(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                  <input
                    type="text"
                    value={categoriaEdit}
                    onChange={(e) => setCategoriaEdit(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Categoría"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditProducto(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={guardarProductoEditado}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!nombreEdit || !precioEdit}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
