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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  User,
  DollarSign,
  FileText,
  Clock,
  LogOut,
  Home,
  Receipt,
  BarChart3,
} from "lucide-react"

interface ProductoEnCotizacion {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  cantidad: number
  esManual?: boolean
  moneda?: "USD" | "RD$"
}

interface Cotizacion {
  id: string
  numeroFactura?: string
  cliente: string
  email: string
  telefono: string
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
}

export default function CotizacionesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [showCreator, setShowCreator] = useState(false)
  const [editingCotizacion, setEditingCotizacion] = useState<Cotizacion | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth !== "true") {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(true)

    // Cargar cotizaciones desde localStorage
    const cotizacionesGuardadas = localStorage.getItem("cotizaciones")
    if (cotizacionesGuardadas) {
      setCotizaciones(JSON.parse(cotizacionesGuardadas))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
  }

  const saveCotizaciones = (nuevasCotizaciones: Cotizacion[]) => {
    setCotizaciones(nuevasCotizaciones)
    localStorage.setItem("cotizaciones", JSON.stringify(nuevasCotizaciones))
  }

  const handleNewCotizacion = () => {
    setEditingCotizacion(null)
    setShowCreator(true)
  }

  const handleEditCotizacion = (cotizacion: Cotizacion) => {
    setEditingCotizacion(cotizacion)
    setShowCreator(true)
  }

  const handleSaveCotizacion = (cotizacion: Cotizacion) => {
    if (editingCotizacion) {
      // Actualizar cotización existente
      const nuevasCotizaciones = cotizaciones.map((c) => (c.id === cotizacion.id ? cotizacion : c))
      saveCotizaciones(nuevasCotizaciones)
    } else {
      // Nueva cotización
      saveCotizaciones([...cotizaciones, cotizacion])
    }
    setShowCreator(false)
    setEditingCotizacion(null)
  }

  const handleDeleteCotizacion = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta cotización?")) {
      const nuevasCotizaciones = cotizaciones.filter((c) => c.id !== id)
      saveCotizaciones(nuevasCotizaciones)
    }
  }

  const handleChangeEstado = (id: string, nuevoEstado: Cotizacion["estado"]) => {
    const nuevasCotizaciones = cotizaciones.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
    saveCotizaciones(nuevasCotizaciones)
  }

  const generarPDFCotizacion = async (cotizacion: Cotizacion) => {
    try {
      // Importar jsPDF dinámicamente
      const jsPDF = (await import("jspdf")).default
      const doc = new jsPDF("landscape") // Formato horizontal

      // Configuración de colores
      const primaryColor = [220, 38, 38] // Red-600
      const textColor = [31, 41, 55] // Gray-800
      const lightGray = [156, 163, 175] // Gray-400
      const darkGray = [75, 85, 99] // Gray-600

      // Header con fondo rojo
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 297, 35, "F") // Ajustado para landscape

      // Logo placeholder
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, 8, 25, 20, 2, 2, "F")
      doc.setTextColor(...primaryColor)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("LOGO", 20, 20)

      // Información de la empresa
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("JumTech RD", 50, 18)

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Soluciones Tecnológicas Integrales", 50, 25)
      doc.text("Email: jumtechRD@gmail.com", 50, 30)

      // Título COTIZACIÓN
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("COTIZACIÓN", 200, 20)

      // Información del cliente y cotización
      doc.setTextColor(...textColor)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      const numeroCotizacion =
        cotizacion.numeroFactura || `COT-${new Date(cotizacion.fecha).getFullYear()}-${cotizacion.id.slice(-4)}`
      doc.text(`Cotización: ${numeroCotizacion}`, 20, 50)
      doc.text(`Fecha: ${new Date(cotizacion.fecha).toLocaleDateString("es-DO")}`, 20, 57)

      // Cliente
      doc.text("CLIENTE:", 150, 50)
      doc.setFont("helvetica", "normal")
      doc.text(cotizacion.cliente, 150, 57)
      doc.text(`Email: ${cotizacion.email}`, 150, 64)
      if (cotizacion.telefono) {
        doc.text(`Tel: ${cotizacion.telefono}`, 150, 71)
      }

      // Tabla de productos - Header
      let yPosition = 85
      doc.setFillColor(248, 250, 252)
      doc.rect(20, yPosition, 257, 10, "F")

      doc.setTextColor(...darkGray)
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      doc.text("DESCRIPCIÓN", 25, yPosition + 7)
      doc.text("CANT.", 180, yPosition + 7)
      doc.text("PRECIO", 210, yPosition + 7)
      doc.text("TOTAL", 250, yPosition + 7)

      // Productos
      yPosition += 15
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...textColor)

      cotizacion.productos.forEach((producto, index) => {
        // Verificar si necesitamos nueva página
        if (yPosition > 180) {
          doc.addPage("landscape")
          yPosition = 30

          // Repetir header en nueva página
          doc.setFillColor(248, 250, 252)
          doc.rect(20, yPosition, 257, 10, "F")
          doc.setTextColor(...darkGray)
          doc.setFontSize(9)
          doc.setFont("helvetica", "bold")
          doc.text("DESCRIPCIÓN", 25, yPosition + 7)
          doc.text("CANT.", 180, yPosition + 7)
          doc.text("PRECIO", 210, yPosition + 7)
          doc.text("TOTAL", 250, yPosition + 7)
          yPosition += 15
        }

        const total = producto.precio * producto.cantidad

        // Alternar color de fondo
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(20, yPosition - 2, 257, 12, "F")
        }

        // Nombre del producto
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...textColor)
        const nombreCorto = producto.nombre.length > 45 ? producto.nombre.substring(0, 45) + "..." : producto.nombre
        doc.text(nombreCorto, 25, yPosition + 3)

        // Descripción
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...lightGray)
        const descripcionCorta =
          producto.descripcion.length > 60 ? producto.descripcion.substring(0, 60) + "..." : producto.descripcion
        doc.text(descripcionCorta, 25, yPosition + 7)

        // Cantidad, precio y total
        doc.setFontSize(9)
        doc.setTextColor(...textColor)
        doc.setFont("helvetica", "normal")
        doc.text(producto.cantidad.toString(), 185, yPosition + 5)
        doc.text(`$${producto.precio.toLocaleString()}`, 215, yPosition + 5)
        doc.text(`$${total.toLocaleString()}`, 255, yPosition + 5)

        yPosition += 15
      })

      // Totales
      yPosition += 10
      doc.setDrawColor(...lightGray)
      doc.line(180, yPosition, 277, yPosition)

      yPosition += 10
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...textColor)

      doc.text("Subtotal:", 210, yPosition)
      doc.text(`$${cotizacion.subtotal.toLocaleString()}`, 255, yPosition)

      if (cotizacion.itbisActivo !== false) {
        yPosition += 8
        const porcentaje = cotizacion.porcentajeItbis || 18
        doc.text(`ITBIS (${porcentaje}%):`, 210, yPosition)
        doc.text(`$${cotizacion.impuestos.toLocaleString()}`, 255, yPosition)
      }

      yPosition += 8
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(...primaryColor)
      doc.text("TOTAL:", 210, yPosition)
      doc.text(`$${cotizacion.total.toLocaleString()}`, 255, yPosition)

      // Notas
      if (cotizacion.notas) {
        yPosition += 20
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...textColor)
        doc.text("NOTAS:", 20, yPosition)

        doc.setFont("helvetica", "normal")
        yPosition += 8
        const notasLines = doc.splitTextToSize(cotizacion.notas, 250)
        doc.text(notasLines, 20, yPosition)
      }

      // Footer
      doc.setFontSize(7)
      doc.setTextColor(...lightGray)
      const footerText = "Gracias por su confianza - JumTech RD | Soluciones Tecnológicas"
      doc.text(footerText, 148 - doc.getTextWidth(footerText) / 2, 200)

      // Descargar el PDF
      const fileName = `Cotizacion-${numeroCotizacion}-${cotizacion.cliente.replace(/\s+/g, "-")}.pdf`
      doc.save(fileName)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
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
              src="/images/logo-nuevo.jpeg"
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
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
              <Home className="h-4 w-4" />Ver Sitio
            </Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white text-sm">Facturas</Link>
            <Link href="/admin/reportes" className="text-gray-300 hover:text-white text-sm">Reportes</Link>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white text-sm">
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          </div>
          {/* Mobile: solo logout */}
          <div className="flex md:hidden">
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
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Sistema de Cotizaciones</h1>
            <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto">
              Administra y genera cotizaciones profesionales
            </p>
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
            <div className="flex gap-2">
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
                className="px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white text-sm min-w-0"
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
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{cotizacion.cliente}</h3>
                        <p className="text-gray-400 text-xs">{cotizacion.email}</p>
                        {cotizacion.telefono && <p className="text-gray-400 text-xs">{cotizacion.telefono}</p>}
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
                        {cotizacion.itbisActivo !== false && (
                          <>
                            {" "}
                            • ITBIS ({cotizacion.porcentajeItbis || 18}%):{" "}
                            <strong>
                              {cotizacion.monedaPrincipal || "RD$"} {cotizacion.impuestos.toLocaleString()}
                            </strong>
                          </>
                        )}
                        {cotizacion.itbisActivo === false && <span className="text-green-400"> • ITBIS: Exento</span>}
                      </p>
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

                    <div className="flex items-center justify-between">
                      <select
                        value={cotizacion.estado}
                        onChange={(e) => handleChangeEstado(cotizacion.id, e.target.value as Cotizacion["estado"])}
                        className="px-2 py-1 bg-white/5 border border-gray-600 rounded text-white text-xs flex-1 mr-2"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                      </select>
                      <div className="flex items-center gap-1">
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

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-black/90 border-t border-gray-800/50 flex justify-around py-2 z-50">
        <Link href="/admin/dashboard" className="flex flex-col items-center text-gray-400 hover:text-white text-xs gap-1">
          <Home className="h-5 w-5" /><span>Inicio</span>
        </Link>
        <Link href="/admin/cotizaciones" className="flex flex-col items-center text-blue-400 text-xs gap-1">
          <FileText className="h-5 w-5" /><span>Cotizaciones</span>
        </Link>
        <Link href="/admin/facturas" className="flex flex-col items-center text-gray-400 hover:text-white text-xs gap-1">
          <Receipt className="h-5 w-5" /><span>Facturas</span>
        </Link>
        <Link href="/admin/reportes" className="flex flex-col items-center text-gray-400 hover:text-white text-xs gap-1">
          <BarChart3 className="h-5 w-5" /><span>Reportes</span>
        </Link>
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
