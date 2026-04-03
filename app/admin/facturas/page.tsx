"use client"

import { useState, useEffect } from "react"
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
  Filter,
  Eye,
  Home,
  Calendar,
  DollarSign,
  User,
  X,
  Menu,
  FileText,
  BarChart3,
} from "lucide-react"
import { FacturaCreator } from "@/components/factura-creator"
import { FacturaPreview } from "@/components/factura-preview"
import { AdminBottomNav } from "@/components/admin-bottom-nav"

interface ProductoEnFactura {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen?: string
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

export default function AdminFacturasPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [productos, setProductos] = useState<ProductoEnFactura[]>([])
  const [showCreator, setShowCreator] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null)
  const [previewFactura, setPreviewFactura] = useState<Factura | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth !== "true") {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(true)

    // Cargar facturas y productos
    const savedFacturas = localStorage.getItem("facturas")
    if (savedFacturas) {
      setFacturas(JSON.parse(savedFacturas))
    }

    const savedProductos = localStorage.getItem("productos")
    if (savedProductos) {
      setProductos(JSON.parse(savedProductos))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
  }

  const handleSaveFactura = (factura: Factura) => {
    let updatedFacturas
    if (editingFactura) {
      updatedFacturas = facturas.map((f) => (f.id === factura.id ? factura : f))
    } else {
      updatedFacturas = [...facturas, factura]
    }
    setFacturas(updatedFacturas)
    localStorage.setItem("facturas", JSON.stringify(updatedFacturas))
    setShowCreator(false)
    setEditingFactura(null)
  }

  const handleDeleteFactura = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      const updatedFacturas = facturas.filter((f) => f.id !== id)
      setFacturas(updatedFacturas)
      localStorage.setItem("facturas", JSON.stringify(updatedFacturas))
    }
  }

  const handleEditFactura = (factura: Factura) => {
    setEditingFactura(factura)
    setShowCreator(true)
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

  const facturasFiltradas = facturas.filter((factura) => {
    const matchEstado = filtroEstado === "todos" || factura.estado === filtroEstado
    const matchBusqueda =
      factura.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      factura.numero.includes(busqueda) ||
      factura.email.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
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
              src="/images/logo-nuevo.jpeg"
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
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Home className="h-4 w-4" />Ver Sitio
            </Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
              Dashboard
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
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white text-sm">
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
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
      <div className="pt-20 pb-16 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-6 pt-4">
            <Badge className="mb-3 bg-purple-600/20 text-purple-400 border-purple-600/30">Gestion de Facturas</Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Sistema de Facturacion</h1>
            <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto">
              Crea, gestiona y descarga facturas profesionales
            </p>
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
            <div className="flex gap-2">
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
                className="px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white text-sm min-w-0"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
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
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-600/20 rounded-lg">
                          <Receipt className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white flex items-center">Factura #{factura.numero}</CardTitle>
                          <p className="text-gray-400 mt-1 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {factura.cliente}
                          </p>
                          <p className="text-gray-500 text-sm">{factura.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getEstadoColor(factura.estado)}>{factura.estado}</Badge>
                        <p className="text-2xl font-bold text-purple-400 mt-2">${factura.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewFactura(factura)}
                        className="border-gray-600 text-gray-300 hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Vista Previa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditFactura(factura)}
                        className="border-gray-600 text-gray-300 hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteFactura(factura.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <Button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
            <FacturaPreview factura={previewFactura} />
          </div>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  )
}
