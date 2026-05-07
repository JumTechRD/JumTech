"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import jsPDF from "jspdf"
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
import { ensureAdminSession, logoutAdminSession } from "@/lib/admin-session-client"

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
    const loadAdminPage = async () => {
      const isSessionValid = await ensureAdminSession(router)
      if (!isSessionValid) return

      setIsAuthenticated(true)

      // Cargar cotizaciones desde localStorage
      const cotizacionesGuardadas = localStorage.getItem("cotizaciones")
      if (cotizacionesGuardadas) {
        setCotizaciones(JSON.parse(cotizacionesGuardadas))
      }
    }

    void loadAdminPage()
  }, [router])

  const handleLogout = () => {
    void logoutAdminSession(router)
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
    const formatearMonto = (monto: number) =>
      monto.toLocaleString("es-DO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })

    const cargarImagenComoDataUrl = (src: string) =>
      new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("No se pudo obtener el contexto del canvas"))
            return
          }

          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL("image/png"))
        }
        img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`))
        img.src = src
      })

    try {
      const numeroCotizacion =
        cotizacion.numeroFactura || `COT-${new Date(cotizacion.fecha).getFullYear()}-${cotizacion.id.slice(-4)}`

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      const red: [number, number, number] = [190, 16, 24]
      const darkText: [number, number, number] = [20, 20, 20]
      const grayText: [number, number, number] = [90, 90, 90]
      const lightGray: [number, number, number] = [245, 245, 245]
      const lineGray: [number, number, number] = [215, 215, 215]
      const contentWidth = pageWidth - margin * 2
      const monedaPrincipal = cotizacion.monedaPrincipal || "RD$"
      const itbisActivo = cotizacion.itbisActivo !== false
      const porcentajeItbis = cotizacion.porcentajeItbis || 18

      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageWidth, pageHeight, "F")

      // Encabezado rojo principal
      doc.setFillColor(...red)
      doc.rect(0, 0, pageWidth, 38, "F")

      // Caja de logo
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, 6, 40, 24, 2, 2, "F")
      let logoDataUrl: string | null = null
      try {
        logoDataUrl = await cargarImagenComoDataUrl("/logopdf.png")
      } catch (logoError) {
        console.warn("No se pudo cargar logopdf.png para el PDF:", logoError)
      }

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", margin + 1.5, 7.5, 37, 21.5, undefined, "FAST")
      } else {
        doc.setTextColor(35, 35, 35)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("JUMTECH RD", margin + 4, 20)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.text("Soluciones Tecnológicas", margin + 4, 26)
      }

      // Datos de empresa
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Jumtech RD", margin + 46, 15)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.5)
      doc.text("Soluciones Tecnológicas Integrales", margin + 46, 20)
      doc.text("Email: jumtechRD@gmail.com", margin + 46, 25)

      // Título principal
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("COTIZACIÓN", pageWidth - margin, 21, { align: "right" })

      let yPosition = 48
      doc.setTextColor(...darkText)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("Cotización:", margin, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(numeroCotizacion, margin + 24, yPosition)
      doc.setFont("helvetica", "bold")
      doc.text("Fecha:", pageWidth - margin - 42, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(new Date(cotizacion.fecha).toLocaleDateString("es-DO"), pageWidth - margin - 25, yPosition)

      yPosition += 8
      doc.setFont("helvetica", "bold")
      doc.text("CLIENTE:", margin, yPosition)
      yPosition += 6
      doc.setFont("helvetica", "bold")
      doc.text(cotizacion.cliente, margin, yPosition)
      yPosition += 5
      doc.setFont("helvetica", "normal")
      doc.text(`Email: ${cotizacion.email}`, margin, yPosition)
      yPosition += 5
      doc.text(`Tel: ${cotizacion.telefono || "No especificado"}`, margin, yPosition)

      yPosition += 10
      const tableTop = yPosition
      const colDescWidth = 110
      const colCantWidth = 20
      const colPrecioWidth = 25
      const colTotalWidth = contentWidth - colDescWidth - colCantWidth - colPrecioWidth

      doc.setFillColor(...lightGray)
      doc.rect(margin, tableTop, contentWidth, 8, "F")
      doc.setDrawColor(...lineGray)
      doc.rect(margin, tableTop, contentWidth, 8)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(...darkText)
      doc.text("DESCRIPCIÓN", margin + 2, tableTop + 5.5)
      doc.text("CANT.", margin + colDescWidth + 2, tableTop + 5.5)
      doc.text("PRECIO", margin + colDescWidth + colCantWidth + 2, tableTop + 5.5)
      doc.text("TOTAL", margin + colDescWidth + colCantWidth + colPrecioWidth + 2, tableTop + 5.5)

      yPosition = tableTop + 8
      const bottomLimit = pageHeight - 65

      for (let index = 0; index < cotizacion.productos.length; index++) {
        const producto = cotizacion.productos[index]
        const subtotalProducto = producto.precio * producto.cantidad
        const porcentajeExtra = (producto.porcentajeExtra || 0) / 100
        const totalConExtra = subtotalProducto * (1 + porcentajeExtra)

        if (yPosition > bottomLimit) {
          doc.addPage()
          yPosition = margin
          doc.setFillColor(...lightGray)
          doc.rect(margin, yPosition, contentWidth, 8, "F")
          doc.setDrawColor(...lineGray)
          doc.rect(margin, yPosition, contentWidth, 8)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(10)
          doc.text("DESCRIPCIÓN", margin + 2, yPosition + 5.5)
          doc.text("CANT.", margin + colDescWidth + 2, yPosition + 5.5)
          doc.text("PRECIO", margin + colDescWidth + colCantWidth + 2, yPosition + 5.5)
          doc.text("TOTAL", margin + colDescWidth + colCantWidth + colPrecioWidth + 2, yPosition + 5.5)
          yPosition += 8
        }

        const rowHeight = 14
        if (index % 2 !== 0) {
          doc.setFillColor(252, 252, 252)
          doc.rect(margin, yPosition, contentWidth, rowHeight, "F")
        }

        doc.setDrawColor(...lineGray)
        doc.rect(margin, yPosition, contentWidth, rowHeight)
        doc.line(margin + colDescWidth, yPosition, margin + colDescWidth, yPosition + rowHeight)
        doc.line(
          margin + colDescWidth + colCantWidth,
          yPosition,
          margin + colDescWidth + colCantWidth,
          yPosition + rowHeight,
        )
        doc.line(
          margin + colDescWidth + colCantWidth + colPrecioWidth,
          yPosition,
          margin + colDescWidth + colCantWidth + colPrecioWidth,
          yPosition + rowHeight,
        )

        const descripcion = doc.splitTextToSize(producto.nombre, colDescWidth - 4)
        const descripcionSecundaria = doc.splitTextToSize(producto.descripcion || "", colDescWidth - 4)

        doc.setTextColor(...darkText)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text(descripcion[0] || producto.nombre, margin + 2, yPosition + 5)

        if (descripcionSecundaria[0]) {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(8)
          doc.setTextColor(...grayText)
          doc.text(descripcionSecundaria[0], margin + 2, yPosition + 10)
        }

        doc.setTextColor(...darkText)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.text(`${producto.cantidad}`, margin + colDescWidth + 10, yPosition + 8, { align: "center" })
        doc.text(formatearMonto(producto.precio), margin + colDescWidth + colCantWidth + colPrecioWidth - 2, yPosition + 8, {
          align: "right",
        })
        doc.text(`${monedaPrincipal} ${formatearMonto(totalConExtra)}`, margin + contentWidth - 2, yPosition + 8, {
          align: "right",
        })

        yPosition += rowHeight
      }

      yPosition += 6
      const totalsXLabel = pageWidth - margin - 45
      const totalsXValue = pageWidth - margin

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.setTextColor(...darkText)
      doc.text("Subtotal:", totalsXLabel, yPosition, { align: "right" })
      doc.text(`${monedaPrincipal} ${formatearMonto(cotizacion.subtotal)}`, totalsXValue, yPosition, { align: "right" })
      yPosition += 7

      doc.text(`ITBIS (${itbisActivo ? `${porcentajeItbis}%` : "0%"}):`, totalsXLabel, yPosition, { align: "right" })
      doc.text(`${monedaPrincipal} ${formatearMonto(itbisActivo ? cotizacion.impuestos : 0)}`, totalsXValue, yPosition, {
        align: "right",
      })
      yPosition += 8

      doc.setFont("helvetica", "bold")
      doc.setTextColor(...red)
      doc.setFontSize(14)
      doc.text("TOTAL:", totalsXLabel, yPosition, { align: "right" })
      doc.text(`${monedaPrincipal} ${formatearMonto(cotizacion.total)}`, totalsXValue, yPosition, { align: "right" })

      yPosition += 11
      doc.setFillColor(236, 236, 236)
      doc.rect(margin, yPosition, contentWidth, 18, "F")
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...darkText)
      doc.setFontSize(10)
      doc.text("NOTAS:", margin + 2, yPosition + 6)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      const notasTexto = cotizacion.notas?.trim() || "Sin notas adicionales."
      const notasLineas = doc.splitTextToSize(notasTexto, contentWidth - 6)
      doc.text(notasLineas[0] || "Sin notas adicionales.", margin + 2, yPosition + 12)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(150, 40, 40)
      doc.text("Gracias por su confianza - Jumtech RD | Soluciones Tecnológicas", pageWidth / 2, pageHeight - 10, {
        align: "center",
      })

      // Descargar el PDF
      const fileName = `Cotizacion-${numeroCotizacion}-${cotizacion.cliente.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
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
            <Link href="/admin/usuarios" className="text-gray-300 hover:text-white text-sm">Usuarios</Link>
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
                aria-label="Filtrar cotizaciones por estado"
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
                        aria-label={`Cambiar estado de cotizacion ${cotizacion.id}`}
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
