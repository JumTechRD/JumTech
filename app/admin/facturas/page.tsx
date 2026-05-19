"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Receipt,
  Download,
  Trash2,
  Edit,
  LogOut,
  Search,
  Eye,
  Home,
  Calendar,
  DollarSign,
  User,
  X,
  Menu,
  FileText,
  BarChart3,
  Package,
} from "lucide-react"
import { FacturaCreator } from "@/components/factura-creator"
import { FacturaPreview } from "@/components/factura-preview"
import { AdminBottomNav } from "@/components/admin-bottom-nav"
import { ensureAdminSession, logoutAdminSession } from "@/lib/admin-session-client"
import {
  deleteAdminInvoice,
  fetchAdminClients,
  fetchAdminInvoices,
  fetchAdminProducts,
  saveAdminInvoice,
} from "@/lib/admin-api-client"
import { generateFinancialPdf } from "@/lib/pdf-documents"
import { getInvoiceDisplayItems } from "@/lib/invoice-display"
import type { ClientRecord } from "@/lib/admin-clients"

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

export default function AdminFacturasPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [clientes, setClientes] = useState<ClientRecord[]>([])
  const [showCreator, setShowCreator] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null)
  const [previewFactura, setPreviewFactura] = useState<Factura | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [fechaInicial, setFechaInicial] = useState("")
  const [fechaFinal, setFechaFinal] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadAdminPage = async () => {
      const isSessionValid = await ensureAdminSession(router)
      if (!isSessionValid) return

      setIsAuthenticated(true)

      const [productosData, clientesData] = await Promise.all([
        fetchAdminProducts<Producto[]>(),
        fetchAdminClients<ClientRecord[]>(),
      ])
      setProductos(productosData)
      setClientes(clientesData)
    }

    void loadAdminPage()
  }, [router])

  const loadInvoices = useCallback(async () => {
    const facturasData = await fetchAdminInvoices<Factura[]>({
      estado: filtroEstado === "todos" ? undefined : filtroEstado,
      q: busqueda.trim() || undefined,
      fechaInicial: fechaInicial || undefined,
      fechaFinal: fechaFinal || undefined,
    })
    setFacturas(facturasData)
  }, [filtroEstado, busqueda, fechaInicial, fechaFinal])

  useEffect(() => {
    if (!isAuthenticated) return

    const timeoutId = window.setTimeout(() => {
      void loadInvoices()
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [isAuthenticated, loadInvoices])

  const handleLogout = () => {
    void logoutAdminSession(router)
  }

  const handleSaveFactura = async (factura: Factura) => {
    try {
      await saveAdminInvoice<Factura>(factura, editingFactura?.id)
      setShowCreator(false)
      setEditingFactura(null)
      void loadInvoices()
    } catch (error) {
      alert("Error al guardar la factura")
    }
  }

  const handleDeleteFactura = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      try {
        await deleteAdminInvoice(id)
        void loadInvoices()
      } catch (error) {
        alert("Error al eliminar la factura")
      }
    }
  }

  const handleEditFactura = (factura: Factura) => {
    setEditingFactura(factura)
    setShowCreator(true)
  }

  const handleGenerarPdfFactura = async (factura: Factura) => {
    try {
      const selectedClient = factura.clientId ? clientes.find((client) => client.id === factura.clientId) : null
      const items = getInvoiceDisplayItems(factura.productos, factura.subtotal).map((producto) => ({
        name: producto.nombre,
        description: producto.descripcion,
        quantity: producto.cantidad,
        unitPriceLabel: `$${producto.displayUnitPrice.toLocaleString("es-DO")}`,
        lineTotalLabel: `$${producto.displayLineTotal.toLocaleString("es-DO")}`,
      }))

      await generateFinancialPdf({
        fileName: `Factura_${factura.numero}_${factura.cliente.replace(/\s+/g, "_")}.pdf`,
        title: "FACTURA",
        referenceLabel: "Número",
        referenceValue: factura.numero,
        dateLabel: "Fecha",
        dateValue: new Date(factura.fecha).toLocaleDateString("es-DO"),
        customerName: selectedClient?.name || factura.cliente,
        customerEmail: selectedClient?.email || factura.email || undefined,
        customerPhone: selectedClient?.phone || factura.telefono || undefined,
        customerCompanyName: selectedClient?.companyName || undefined,
        customerIdentification: selectedClient?.identification || undefined,
        customerAddress: selectedClient?.address || factura.direccion || undefined,
        paymentMethodLabel: "Método de pago",
        paymentMethodValue: factura.paymentMethod === "efectivo" ? "Efectivo" : "Transferencia",
        items,
        subtotalLabel: "Subtotal",
        subtotalValue: `$${factura.subtotal.toLocaleString("es-DO")}`,
        totalLabel: "TOTAL",
        totalValue: `$${factura.total.toLocaleString("es-DO")}`,
        notes: factura.notas,
        footerText: "Gracias por su preferencia - JumTech RD | Soluciones Tecnológicas",
      })
    } catch (error) {
      console.error("Error generando PDF de factura:", error)
      alert("❌ Error al generar el PDF. Por favor intenta nuevamente.")
    }
  }

  const handlePreviewFactura = (factura: Factura) => {
    setPreviewFactura(factura)
    setShowPreview(true)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
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

  const facturasFiltradas = facturas

  const getTotalFacturado = () => {
    return facturas.reduce((sum, factura) => sum + factura.total, 0)
  }

  const getFacturasPorEstado = (estado: string) => {
    return facturas.filter((factura) => factura.estado === estado).length
  }

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-x-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/images/logo-nuevo-transparente.png"
              alt="JumTech RD Logo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <span className="text-base font-bold text-white">JumTech RD</span>
              <Badge className="ml-2 bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs hidden sm:inline-flex">Admin</Badge>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Home className="h-4 w-4" />Ver Sitio
            </Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
              Dashboard
            </Link>
            <Link href="/admin/productos" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Package className="h-4 w-4" />
              Productos
            </Link>
            <Link href="/admin/clientes" className="text-gray-300 hover:text-white transition-colors text-sm">
              Clientes
            </Link>
            <Link href="/admin/cotizaciones" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <FileText className="h-4 w-4" />Cotizaciones
            </Link>
            <Link href="/admin/facturas" className="text-purple-400 font-semibold text-sm flex items-center gap-1">
              <Receipt className="h-4 w-4" />Facturas
            </Link>
            <Link href="/admin/reportes" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />Reportes
            </Link>
            <Link href="/admin/usuarios" className="text-gray-300 hover:text-white transition-colors text-sm">
              Usuarios
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-slate-200 hover:text-white hover:bg-white/10 text-sm">
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-3 bg-black/90 backdrop-blur-xl border-t border-gray-800/50">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />Ver Sitio
              </Link>
              <Link
                href="/admin/dashboard"
                className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/clientes"
                className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Clientes
              </Link>
              <Link
                href="/admin/cotizaciones"
                className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />Cotizaciones
              </Link>
              <Link
                href="/admin/facturas"
                className="text-purple-400 font-semibold py-2 px-3 rounded-lg bg-white/5 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Receipt className="h-4 w-4" />Facturas
              </Link>
              <Link
                href="/admin/reportes"
                className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />Reportes
              </Link>
              <Link
                href="/admin/usuarios"
                className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Usuarios
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="text-gray-300 hover:text-white justify-start px-3"
              >
                <LogOut className="h-4 w-4 mr-2" />Cerrar Sesion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-24 lg:pb-16 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-6 pt-4">
            <Badge className="mb-3 bg-purple-600/20 text-purple-400 border-purple-600/30">Gestion de Facturas</Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Facturas</h1>
            <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto">Crea, gestiona y descarga facturas</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Total Facturas</p>
                    <p className="text-xl sm:text-2xl font-bold text-white">{facturas.length}</p>
                  </div>
                  <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Total Facturado</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">${getTotalFacturado().toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Pendientes</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-400">{getFacturasPorEstado("pendiente")}</p>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm">Pagadas</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-400">{getFacturasPorEstado("pagada")}</p>
                  </div>
                  <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                aria-label="Filtrar facturas por estado"
                className="w-full px-3 py-2 bg-slate-800/90 border border-gray-600 rounded-lg text-white text-sm min-w-0 [&>option]:bg-slate-800 [&>option]:text-white"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fecha inicial</label>
                <input
                  type="date"
                  value={fechaInicial}
                  onChange={(e) => setFechaInicial(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fecha final</label>
                <input
                  type="date"
                  value={fechaFinal}
                  onChange={(e) => setFechaFinal(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFiltroEstado("todos")
                setBusqueda("")
                setFechaInicial("")
                setFechaFinal("")
              }}
              className="border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-white/10"
            >
              Limpiar filtros
            </Button>
            <Button onClick={() => setShowCreator(true)} className="bg-purple-600 hover:bg-purple-700 w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </div>

          {/* Facturas List */}
          <div className="grid grid-cols-1 gap-6">
            {facturasFiltradas.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
                <CardContent className="p-12 text-center">
                  <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {facturas.length === 0 ? "No hay facturas" : "No se encontraron facturas"}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {facturas.length === 0
                      ? "Crea tu primera factura para comenzar"
                      : "Intenta cambiar los filtros de búsqueda"}
                  </p>
                  {facturas.length === 0 && (
                    <Button onClick={() => setShowCreator(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Factura
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              facturasFiltradas.map((factura) => (
                <Card
                  key={factura.id}
                  className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center space-x-4">
                        <div className="p-3 bg-purple-600/20 rounded-lg">
                          <Receipt className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="flex items-center break-words text-white">Factura #{factura.numero}</CardTitle>
                          <p className="text-gray-400 mt-1 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {factura.cliente}
                          </p>
                          <p className="break-all text-gray-500 text-sm">{factura.email || "-"}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <Badge className={getEstadoColor(factura.estado)}>{factura.estado}</Badge>
                        <p className="text-xl sm:text-2xl font-bold text-purple-400 mt-2">${factura.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                          Emisión: {new Date(factura.fecha).toLocaleDateString()}
                        </div>
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                        Vencimiento: {new Date(factura.vencimiento).toLocaleDateString()}
                      </div>
                        <div className="flex items-center text-gray-300">
                          <Receipt className="h-4 w-4 mr-2 text-purple-400" />
                          {factura.productos.length} productos
                        </div>
                        <div className="flex items-center text-gray-300">
                          <DollarSign className="h-4 w-4 mr-2 text-purple-400" />
                          Pago: {factura.paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"}
                        </div>
                      </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewFactura(factura)}
                        className="flex-1 border-sky-600 text-sky-400 hover:bg-sky-600/10 sm:flex-none"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Vista Previa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditFactura(factura)}
                        className="flex-1 border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 sm:flex-none"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 sm:flex-none"
                        onClick={() => handleGenerarPdfFactura(factura)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFactura(factura.id)}
                        className="flex-1 border-red-600 text-red-400 hover:bg-red-600/10 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Factura Creator Modal */}
      {showCreator && (
        <FacturaCreator
          isOpen={showCreator}
          onClose={() => {
            setShowCreator(false)
            setEditingFactura(null)
          }}
          onSave={handleSaveFactura}
          editingFactura={editingFactura}
          productos={productos}
        />
      )}

      {/* Preview Modal */}
      {showPreview && previewFactura && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-2 sm:items-center sm:p-4">
          <div className="relative max-w-5xl w-full max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-h-[90vh]">
            <Button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="overflow-x-auto">
              <FacturaPreview factura={previewFactura} />
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  )
}
