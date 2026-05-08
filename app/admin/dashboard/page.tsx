"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  LogOut,
  FileText,
  BarChart3,
  Receipt,
  Home,
  Users,
} from "lucide-react"
import { ProductoManager } from "@/components/producto-manager"
import { FacturaCreator } from "@/components/factura-creator"
import { AdminBottomNav } from "@/components/admin-bottom-nav"
import { ensureAdminSession, logoutAdminSession } from "@/lib/admin-session-client"
import {
  deleteAdminInvoice,
  deleteAdminProduct,
  fetchAdminInvoices,
  fetchAdminProducts,
  fetchAdminQuotes,
  saveAdminInvoice,
  saveAdminProduct,
} from "@/lib/admin-api-client"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen: string
  stock: number
  rating: number
  especificaciones: string[]
  activo: boolean
  fechaCreacion: string
  fechaActualizacion: string
  precioCompra?: number
  margenGanancia?: number
  proveedor?: string
  codigoBarras?: string
  sku?: string
  peso?: number
  dimensiones?: {
    largo: number
    ancho: number
    alto: number
  }
  garantia?: number
  ubicacion?: string
  stockMinimo?: number
  stockMaximo?: number
  vendido?: number
  ultimaVenta?: string
}

interface ProductoEnFactura {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen?: string
  stock?: number
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

interface Cotizacion {
  id: string
  numeroFactura?: string
  cliente: string
  email: string
  telefono: string
  fecha: string
  productos: any[]
  subtotal: number
  impuestos: number
  total: number
  estado: "pendiente" | "enviada" | "aprobada" | "rechazada"
  notas?: string
  monedaPrincipal?: "USD" | "RD$"
  itbisActivo?: boolean
  porcentajeItbis?: number
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [productos, setProductos] = useState<Producto[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [showProductManager, setShowProductManager] = useState(false)
  const [showFacturaCreator, setShowFacturaCreator] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [editingFactura, setEditingFactura] = useState<Factura | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadAdminPage = async () => {
      const isSessionValid = await ensureAdminSession(router)
      if (!isSessionValid) return

      setIsAuthenticated(true)

      const [productosData, facturasData, cotizacionesData] = await Promise.all([
        fetchAdminProducts<Producto[]>(),
        fetchAdminInvoices<Factura[]>(),
        fetchAdminQuotes<Cotizacion[]>(),
      ])
      setProductos(productosData)
      setFacturas(facturasData)
      setCotizaciones(cotizacionesData)
    }

    void loadAdminPage()
  }, [router])

  const handleLogout = () => {
    void logoutAdminSession(router)
  }

  const handleSaveProduct = async (producto: Producto) => {
    try {
      const savedProduct = await saveAdminProduct<Producto>(producto, editingProduct?.id)
      setProductos((currentProducts) =>
        editingProduct
          ? currentProducts.map((p) => (p.id === savedProduct.id ? savedProduct : p))
          : [savedProduct, ...currentProducts],
      )
      setShowProductManager(false)
      setEditingProduct(null)
    } catch (error) {
      alert("Error al guardar el producto")
    }
  }

  const handleSaveFactura = async (factura: Factura) => {
    try {
      const savedFactura = await saveAdminInvoice<Factura>(factura, editingFactura?.id)
      setFacturas((currentFacturas) =>
        editingFactura
          ? currentFacturas.map((f) => (f.id === savedFactura.id ? savedFactura : f))
          : [savedFactura, ...currentFacturas],
      )
      setShowFacturaCreator(false)
      setEditingFactura(null)
    } catch (error) {
      alert("Error al guardar la factura")
    }
  }

  const handleEditProduct = (producto: Producto) => {
    setEditingProduct(producto)
    setShowProductManager(true)
  }

  const handleEditFactura = (factura: Factura) => {
    setEditingFactura(factura)
    setShowFacturaCreator(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteAdminProduct(id)
        setProductos((currentProducts) => currentProducts.filter((p) => p.id !== id))
      } catch (error) {
        alert("Error al eliminar el producto")
      }
    }
  }

  const handleDeleteFactura = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      try {
        await deleteAdminInvoice(id)
        setFacturas((currentFacturas) => currentFacturas.filter((f) => f.id !== id))
      } catch (error) {
        alert("Error al eliminar la factura")
      }
    }
  }

  const getTotalValue = () => {
    return productos.reduce((sum, producto) => sum + producto.precio * producto.stock, 0)
  }

  const getLowStockProducts = () => {
    return productos.filter((producto) => producto.stock <= 5).length
  }

  const getTotalFacturado = () => {
    return facturas.reduce((sum, factura) => sum + factura.total, 0)
  }

  const getFacturasPendientes = () => {
    return facturas.filter((factura) => factura.estado === "pendiente").length
  }

  const getTotalCotizaciones = () => {
    return cotizaciones.length
  }

  const getCotizacionesPendientes = () => {
    return cotizaciones.filter((cot) => cot.estado === "pendiente").length
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

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/logo-nuevo.jpeg"
              alt="JumTech RD Logo"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <div>
              <span className="text-xl font-bold text-white">JumTech RD</span>
              <Badge className="ml-2 bg-red-600/20 text-red-400 border-red-600/30 text-xs">Admin</Badge>
            </div>
          </div>
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Home className="h-4 w-4" />Ver Sitio
            </Link>
            <Link href="/admin/cotizaciones" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <FileText className="h-4 w-4" />Cotizaciones
            </Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Receipt className="h-4 w-4" />Facturas
            </Link>
            <Link href="/admin/reportes" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />Reportes
            </Link>
            <Link href="/admin/usuarios" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Users className="h-4 w-4" />Usuarios
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white text-sm">
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          </div>
          {/* Mobile logout */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 p-2">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-24 md:pb-16 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">Panel de Administración</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Dashboard Principal</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Gestiona productos, cotizaciones, facturas y el inventario de tu tienda
            </p>
          </div>

          {/* Quick Actions — 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center" onClick={() => setShowProductManager(true)}>
                <div className="p-4 bg-red-600/20 rounded-full w-fit mx-auto mb-4">
                  <Plus className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Agregar Producto</h3>
                <p className="text-gray-400">Añadir nuevo producto al inventario</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Link href="/admin/cotizaciones">
                  <div className="p-4 bg-blue-600/20 rounded-full w-fit mx-auto mb-4">
                    <FileText className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Nueva Cotización</h3>
                  <p className="text-gray-400">Crear cotización para cliente</p>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center" onClick={() => setShowFacturaCreator(true)}>
                <div className="p-4 bg-purple-600/20 rounded-full w-fit mx-auto mb-4">
                  <Receipt className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Nueva Factura</h3>
                <p className="text-gray-400">Crear factura profesional</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-green-500/50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Link href="/admin/reportes" className="block">
                  <div className="p-4 bg-green-600/20 rounded-full w-fit mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ver Reportes</h3>
                  <p className="text-gray-400">Análisis de ventas y productos</p>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600/20 rounded-lg mr-4">
                    <Package className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Productos</p>
                    <p className="text-2xl font-bold text-white">{productos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-600/20 rounded-lg mr-4">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Facturado</p>
                    <p className="text-2xl font-bold text-white">${getTotalFacturado().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-600/20 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Facturas Pendientes</p>
                    <p className="text-2xl font-bold text-white">{getFacturasPendientes()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600/20 rounded-lg mr-4">
                    <Receipt className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Facturas</p>
                    <p className="text-2xl font-bold text-white">{facturas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-600/20 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Cotizaciones</p>
                    <p className="text-2xl font-bold text-white">{getTotalCotizaciones()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de Actividad Reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Facturas Recientes */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Facturas Recientes</h2>
                <Button
                  onClick={() => setShowFacturaCreator(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva
                </Button>
              </div>

              <div className="space-y-4">
                {facturas.slice(0, 3).map((factura) => (
                  <Card
                    key={factura.id}
                    className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-600/20 rounded-lg">
                            <Receipt className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">#{factura.numero}</h3>
                            <p className="text-gray-400 text-sm">{factura.cliente}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getEstadoColor(factura.estado)}>{factura.estado}</Badge>
                          <p className="text-green-400 font-semibold">${factura.total.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {facturas.length === 0 && (
                  <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
                    <CardContent className="p-8 text-center">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No hay facturas</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Cotizaciones Recientes */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Cotizaciones Recientes</h2>
                <Button asChild className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Link href="/admin/cotizaciones">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {cotizaciones.slice(0, 3).map((cotizacion) => (
                  <Card
                    key={cotizacion.id}
                    className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-600/20 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {cotizacion.numeroFactura || `COT-${cotizacion.id.slice(-4)}`}
                            </h3>
                            <p className="text-gray-400 text-sm">{cotizacion.cliente}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getEstadoColor(cotizacion.estado)}>{cotizacion.estado}</Badge>
                          <p className="text-blue-400 font-semibold">${cotizacion.total.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {cotizaciones.length === 0 && (
                  <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No hay cotizaciones</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Products Management */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Gestión de Productos</h2>
            <Button onClick={() => setShowProductManager(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>

          {/* Products List */}
          <div className="grid grid-cols-1 gap-6">
            {productos.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay productos</h3>
                  <p className="text-gray-400 mb-6">Comienza agregando tu primer producto al inventario</p>
                  <Button onClick={() => setShowProductManager(true)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              productos.slice(0, 5).map((producto) => (
                <Card
                  key={producto.id}
                  className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={producto.imagen || "/placeholder.svg"}
                            alt={producto.nombre}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{producto.nombre}</h3>
                          <p className="text-gray-400">{producto.descripcion}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                              {producto.categoria}
                            </Badge>
                            <span className="text-green-400 font-semibold">${producto.precio.toLocaleString()}</span>
                            <span className="text-gray-400">Stock: {producto.stock}</span>
                            {producto.stock <= 5 && (
                              <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                                Stock Bajo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(producto)}
                          className="border-gray-600 text-gray-300 hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(producto.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Enlaces rápidos */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/admin/cotizaciones">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Todas las Cotizaciones
                </Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/admin/facturas">
                  <Receipt className="h-4 w-4 mr-2" />
                  Ver Todas las Facturas
                </Link>
              </Button>
              <Button asChild className="bg-gray-600 hover:bg-gray-700">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Ver Sitio Web
                </Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/admin/usuarios">
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Usuarios
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-black/90 border-t border-gray-800/50 flex justify-around py-2 z-50">
        <Link href="/admin/dashboard" className="flex flex-col items-center text-red-400 text-xs gap-1">
          <Home className="h-5 w-5" /><span>Inicio</span>
        </Link>
        <Link href="/admin/cotizaciones" className="flex flex-col items-center text-gray-400 hover:text-white text-xs gap-1">
          <FileText className="h-5 w-5" /><span>Cotizaciones</span>
        </Link>
        <Link href="/admin/facturas" className="flex flex-col items-center text-gray-400 hover:text-white text-xs gap-1">
          <Receipt className="h-5 w-5" /><span>Facturas</span>
        </Link>
        <Link href="/admin/reportes" className="flex flex-col items-center text-gray-400 hover:text-white text-xs gap-1">
          <BarChart3 className="h-5 w-5" /><span>Reportes</span>
        </Link>
        <Link href="/admin/usuarios" className="flex flex-col items-center text-gray-400 hover:text-white text-xs gap-1">
          <Users className="h-5 w-5" /><span>Usuarios</span>
        </Link>
      </div>

      {/* Product Manager Modal */}
      {showProductManager && (
        <ProductoManager
          isOpen={showProductManager}
          onClose={() => {
            setShowProductManager(false)
            setEditingProduct(null)
          }}
          onSave={handleSaveProduct}
          editingProduct={editingProduct}
        />
      )}

      {/* Factura Creator Modal */}
      {showFacturaCreator && (
        <FacturaCreator
          isOpen={showFacturaCreator}
          onClose={() => {
            setShowFacturaCreator(false)
            setEditingFactura(null)
          }}
          onSave={handleSaveFactura}
          editingFactura={editingFactura}
          productos={productos}
        />
      )}
      
      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  )
}
