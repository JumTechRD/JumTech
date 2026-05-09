"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CotizacionCreator } from "@/components/cotizacion-creator"
import { AdminBottomNav } from "@/components/admin-bottom-nav"
import { deleteAdminQuote, fetchAdminClients, fetchAdminQuotes, saveAdminQuote } from "@/lib/admin-api-client"
import { generateFinancialPdf } from "@/lib/pdf-documents"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  User,
  DollarSign,
  FileText,
  Clock,
  LogOut,
  Home,
  Receipt,
  BarChart3,
  Package,
} from "lucide-react"
import { ensureAdminSession, logoutAdminSession } from "@/lib/admin-session-client"
import type { ClientRecord } from "@/lib/admin-clients"

interface ProductoEnCotizacion {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  cantidad: number
  esManual?: boolean
  moneda?: "USD" | "RD$"
  porcentajeExtra?: number
}

interface Cotizacion {
  id: string
  numeroFactura?: string
  cliente: string
  email: string
  telefono: string
  clientId?: string | null
  tipoServicio?: string
  urgencia?: string
  descripcionProyecto?: string
  ubicacionProyecto?: string
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

export default function CotizacionesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [showCreator, setShowCreator] = useState(false)
  const [editingCotizacion, setEditingCotizacion] = useState<Cotizacion | null>(null)
  const [clientes, setClientes] = useState<ClientRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const router = useRouter()

  useEffect(() => {
    const loadAdminPage = async () => {
      const isSessionValid = await ensureAdminSession(router)
      if (!isSessionValid) return

      setIsAuthenticated(true)

      const [quotesData, clientsData] = await Promise.all([
        fetchAdminQuotes<Cotizacion[]>(),
        fetchAdminClients<ClientRecord[]>(),
      ])
      setCotizaciones(quotesData)
      setClientes(clientsData)
    }

    void loadAdminPage()
  }, [router])

  const handleLogout = () => {
    void logoutAdminSession(router)
  }

  const handleNewCotizacion = () => {
    setEditingCotizacion(null)
    setShowCreator(true)
  }

  const handleEditCotizacion = (cotizacion: Cotizacion) => {
    setEditingCotizacion(cotizacion)
    setShowCreator(true)
  }

  const handleSaveCotizacion = async (cotizacion: Cotizacion) => {
    try {
      const savedCotizacion = await saveAdminQuote<Cotizacion>(cotizacion, editingCotizacion?.id)
      setCotizaciones((currentCotizaciones) =>
        editingCotizacion
          ? currentCotizaciones.map((c) => (c.id === savedCotizacion.id ? savedCotizacion : c))
          : [savedCotizacion, ...currentCotizaciones],
      )
      setShowCreator(false)
      setEditingCotizacion(null)
    } catch (error) {
      alert("Error al guardar la cotización")
    }
  }

  const handleDeleteCotizacion = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta cotización?")) {
      try {
        await deleteAdminQuote(id)
        setCotizaciones((currentCotizaciones) => currentCotizaciones.filter((c) => c.id !== id))
      } catch (error) {
        alert("Error al eliminar la cotización")
      }
    }
  }

  const handleChangeEstado = async (id: string, nuevoEstado: Cotizacion["estado"]) => {
    const cotizacion = cotizaciones.find((c) => c.id === id)
    if (!cotizacion) return

    try {
      const savedCotizacion = await saveAdminQuote<Cotizacion>({ ...cotizacion, estado: nuevoEstado }, id)
      setCotizaciones((currentCotizaciones) =>
        currentCotizaciones.map((c) => (c.id === id ? savedCotizacion : c)),
      )
    } catch (error) {
      alert("Error al cambiar el estado de la cotización")
    }
  }

  const generarPDFCotizacion = async (cotizacion: Cotizacion) => {
    try {
      const numeroCotizacion =
        cotizacion.numeroFactura || `COT-${new Date(cotizacion.fecha).getFullYear()}-${cotizacion.id.slice(-4)}`
      const tasaCambio = 58
      const selectedClient = cotizacion.clientId ? clientes.find((client) => client.id === cotizacion.clientId) : null
      const items = cotizacion.productos.map((producto) => {
        const monedaOrigen = producto.moneda || cotizacion.monedaPrincipal || "RD$"
        const precioBase = monedaOrigen === "USD" ? producto.precio * tasaCambio : producto.precio
        const precioConExtra = precioBase * producto.cantidad * (1 + (producto.porcentajeExtra || 0) / 100)

        return {
          name: producto.nombre,
          description: producto.descripcion,
          quantity: producto.cantidad,
          unitPriceLabel: `${cotizacion.monedaPrincipal || "RD$"} ${precioBase.toLocaleString("es-DO")}`,
          lineTotalLabel: `${cotizacion.monedaPrincipal || "RD$"} ${precioConExtra.toLocaleString("es-DO")}`,
        }
      })

      const subtotal = cotizacion.subtotal || cotizacion.total
      await generateFinancialPdf({
        fileName: `Cotizacion-${numeroCotizacion}-${cotizacion.cliente.replace(/\s+/g, "-")}.pdf`,
        title: "COTIZACIÓN",
        referenceLabel: "Cotización",
        referenceValue: numeroCotizacion,
        dateLabel: "Fecha",
        dateValue: new Date(cotizacion.fecha).toLocaleDateString("es-DO"),
        customerName: selectedClient?.name || cotizacion.cliente,
        customerEmail: selectedClient?.email || cotizacion.email,
        customerPhone: selectedClient?.phone || cotizacion.telefono || undefined,
        customerCompanyName: selectedClient?.companyName || undefined,
        customerIdentification: selectedClient?.identification || undefined,
        customerAddress: selectedClient?.address || undefined,
        items,
        subtotalLabel: "Subtotal",
        subtotalValue: `${cotizacion.monedaPrincipal || "RD$"} ${subtotal.toLocaleString("es-DO")}`,
        totalLabel: "TOTAL",
        totalValue: `${cotizacion.monedaPrincipal || "RD$"} ${subtotal.toLocaleString("es-DO")}`,
        notes: cotizacion.notas,
        validityNote: "Esta cotización es válida por 15 días.",
        footerText: "Gracias por su confianza - JumTech RD | Soluciones Tecnológicas",
      })

      alert("✅ PDF generado exitosamente!")
    } catch (error) {
      console.error("Error generando PDF:", error)
      alert("❌ Error al generar el PDF. Por favor intenta nuevamente.")
    }
  }

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
    const matchesSearch =
      cotizacion.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === "todos" || cotizacion.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
      case "enviada":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30"
      case "aprobada":
        return "bg-green-600/20 text-green-400 border-green-600/30"
      case "rechazada":
        return "bg-red-600/20 text-red-400 border-red-600/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
    }
  }

  const getTotalCotizaciones = () => cotizaciones.length
  const getTotalPendientes = () => cotizaciones.filter((c) => c.estado === "pendiente").length
  const getTotalAprobadas = () => cotizaciones.filter((c) => c.estado === "aprobada").length
  const getMontoTotal = () => cotizaciones.reduce((sum, c) => sum + c.total, 0)

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-x-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl"></div>
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
              <Badge className="ml-2 bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs hidden sm:inline-flex">Admin</Badge>
            </div>
          </div>
          {/* Desktop links */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
              <Home className="h-4 w-4" />Ver Sitio
            </Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
            <Link href="/admin/productos" className="text-gray-300 hover:text-white text-sm">Productos</Link>
            <Link href="/admin/clientes" className="text-gray-300 hover:text-white text-sm">Clientes</Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white text-sm">Facturas</Link>
            <Link href="/admin/reportes" className="text-gray-300 hover:text-white text-sm">Reportes</Link>
            <Link href="/admin/usuarios" className="text-gray-300 hover:text-white text-sm">Usuarios</Link>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white text-sm">
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          </div>
          {/* Mobile: solo logout */}
          <div className="flex lg:hidden">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 p-2">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-16 pb-24 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-6 pt-4">
            <Badge className="mb-3 bg-blue-600/20 text-blue-400 border-blue-600/30">Gestión de Cotizaciones</Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Cotizaciones</h1>
            <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto">Administra y genera cotizaciones</p>
          </div>

          {/* Estadísticas — 2 cols mobile, 4 desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Cotizaciones</p>
                    <p className="text-2xl font-bold text-white">{getTotalCotizaciones()}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-400">{getTotalPendientes()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Aprobadas</p>
                    <p className="text-2xl font-bold text-green-400">{getTotalAprobadas()}</p>
                  </div>
                  <User className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Monto Total</p>
                    <p className="text-2xl font-bold text-blue-400">${getMontoTotal().toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros + botón nueva */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-gray-600 text-white placeholder-gray-400 text-sm"
                />
              </div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                aria-label="Filtrar cotizaciones por estado"
                className="w-full px-3 py-2 bg-slate-800/90 border border-gray-600 rounded-lg text-white text-sm min-w-0 [&>option]:bg-slate-800 [&>option]:text-white"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="enviada">Enviada</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
            <Button onClick={handleNewCotizacion} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cotización
            </Button>
          </div>

          {/* Lista de Cotizaciones */}
          <div className="space-y-4">
            {cotizacionesFiltradas.length === 0 ? (
              <Card className="bg-white/5 border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay cotizaciones</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm || filterEstado !== "todos"
                      ? "No se encontraron cotizaciones con los filtros aplicados"
                      : "Comienza creando tu primera cotización"}
                  </p>
                  <Button onClick={handleNewCotizacion} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cotización
                  </Button>
                </CardContent>
              </Card>
            ) : (
              cotizacionesFiltradas.map((cotizacion) => (
                <Card
                  key={cotizacion.id}
                  className="bg-white/5 border-gray-700/50 hover:border-blue-500/50 transition-all"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{cotizacion.cliente}</h3>
                        <p className="text-gray-400 text-xs">{cotizacion.email}</p>
                        {cotizacion.telefono && <p className="text-gray-400 text-xs">{cotizacion.telefono}</p>}
                        {cotizacion.tipoServicio && <p className="text-blue-300 text-xs mt-1">{cotizacion.tipoServicio}</p>}
                        {cotizacion.urgencia && <p className="text-amber-300 text-xs">{cotizacion.urgencia}</p>}
                      </div>
                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <Badge className={getEstadoColor(cotizacion.estado)}>{cotizacion.estado}</Badge>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-400">
                            {cotizacion.monedaPrincipal || "RD$"} {cotizacion.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(cotizacion.fecha).toLocaleDateString("es-DO")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>{cotizacion.productos.length}</strong> productos • Subtotal:{" "}
                        <strong>
                          {cotizacion.monedaPrincipal || "RD$"} {cotizacion.subtotal.toLocaleString()}
                        </strong>
                      </p>
                      {cotizacion.descripcionProyecto && (
                        <p className="text-xs text-gray-400 mb-2 break-words">
                          {cotizacion.descripcionProyecto}
                        </p>
                      )}
                      {cotizacion.ubicacionProyecto && (
                        <p className="text-xs text-gray-500 mb-2">{cotizacion.ubicacionProyecto}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {cotizacion.productos.slice(0, 3).map((producto) => (
                          <Badge
                            key={producto.id}
                            className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs"
                          >
                            {producto.nombre} ({producto.cantidad})
                          </Badge>
                        ))}
                        {cotizacion.productos.length > 3 && (
                          <Badge className="bg-gray-600/20 text-gray-400 border-gray-600/30 text-xs">
                            +{cotizacion.productos.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <select
                        value={cotizacion.estado}
                        onChange={(e) => handleChangeEstado(cotizacion.id, e.target.value as Cotizacion["estado"])}
                        aria-label={`Cambiar estado de cotizacion ${cotizacion.id}`}
                        className="w-full px-2 py-2 bg-slate-800/90 border border-gray-600 rounded text-white text-xs sm:flex-1 sm:mr-2 [&>option]:bg-slate-800 [&>option]:text-white"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                      <div className="grid grid-cols-3 gap-1 sm:flex sm:items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generarPDFCotizacion(cotizacion)}
                          className="border-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-2"
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">PDF</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCotizacion(cotizacion)}
                          className="border-gray-600 text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 px-2"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Editar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCotizacion(cotizacion.id)}
                          className="border-gray-600 text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 px-2"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Creación/Edición */}
      <CotizacionCreator
        isOpen={showCreator}
        onClose={() => {
          setShowCreator(false)
          setEditingCotizacion(null)
        }}
        onSave={handleSaveCotizacion}
        editingCotizacion={editingCotizacion}
      />
      
      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  )
}
