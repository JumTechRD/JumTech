"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Receipt,
  TrendingUp,
  LogOut,
  Home,
  Search,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react"

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
  tipoPago?: "efectivo" | "transferencia"
  porcentajePago?: 50 | 100
  fechaPagoPendiente?: string
  montoPendiente?: number
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
  productos: any[]
  subtotal: number
  impuestos: number
  total: number
  estado: "pendiente" | "pagada" | "vencida" | "cancelada"
  notas?: string
}

export default function ReportesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroCliente, setFiltroCliente] = useState("")
  const [filtroTipoPago, setFiltroTipoPago] = useState("todos")
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth !== "true") {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(true)

    // Cargar datos desde localStorage
    const cotizacionesGuardadas = localStorage.getItem("cotizaciones")
    if (cotizacionesGuardadas) {
      setCotizaciones(JSON.parse(cotizacionesGuardadas))
    }

    const facturasGuardadas = localStorage.getItem("facturas")
    if (facturasGuardadas) {
      setFacturas(JSON.parse(facturasGuardadas))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
  }

  // Filtrar datos
  const datosFiltrados = () => {
    let cotizacionesFiltradas = cotizaciones
    let facturasFiltradas = facturas

    if (filtroFecha) {
      const fechaFiltro = new Date(filtroFecha)
      cotizacionesFiltradas = cotizacionesFiltradas.filter(
        (c) => new Date(c.fecha).toDateString() === fechaFiltro.toDateString()
      )
      facturasFiltradas = facturasFiltradas.filter(
        (f) => new Date(f.fecha).toDateString() === fechaFiltro.toDateString()
      )
    }

    if (filtroCliente) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter((c) =>
        c.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
      )
      facturasFiltradas = facturasFiltradas.filter((f) =>
        f.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
      )
    }

    if (filtroTipoPago !== "todos") {
      cotizacionesFiltradas = cotizacionesFiltradas.filter((c) => c.tipoPago === filtroTipoPago)
    }

    return { cotizacionesFiltradas, facturasFiltradas }
  }

  const { cotizacionesFiltradas, facturasFiltradas } = datosFiltrados()

  // Calcular estadísticas
  const getTotalVentas = () => {
    return facturasFiltradas.reduce((sum, f) => sum + f.total, 0)
  }

  const getTotalCotizaciones = () => {
    return cotizacionesFiltradas.reduce((sum, c) => sum + c.total, 0)
  }

  const getVentasPorMes = () => {
    const ventasPorMes: { [key: string]: number } = {}
    facturasFiltradas.forEach((f) => {
      const mes = new Date(f.fecha).toLocaleDateString("es-DO", { month: "long", year: "numeric" })
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + f.total
    })
    return ventasPorMes
  }

  const getVentasPorMetodoPago = () => {
    const ventasPorMetodo: { [key: string]: number } = {}
    cotizacionesFiltradas.forEach((c) => {
      const metodo = c.tipoPago || "efectivo"
      ventasPorMetodo[metodo] = (ventasPorMetodo[metodo] || 0) + c.total
    })
    return ventasPorMetodo
  }

  const getCuentasPorCobrar = () => {
    return cotizacionesFiltradas.filter((c) => c.porcentajePago === 50)
  }

  const getTotalCuentasPorCobrar = () => {
    return getCuentasPorCobrar().reduce((sum, c) => sum + (c.montoPendiente || 0), 0)
  }

  const exportarReportePDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default
      const doc = new jsPDF()

      // Configuración de colores corporativos
      const primaryColor = [211, 38, 48] // Rojo corporativo #D32630
      const secondaryColor = [47, 47, 47] // Gris oscuro corporativo #2F2F2F

      // Header
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 30, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("JumTech RD", 15, 20)

      doc.setFontSize(12)
      doc.text("Reporte de Ventas y Cuentas por Cobrar", 15, 25)

      // Información del reporte
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Fecha del reporte: ${new Date().toLocaleDateString("es-DO")}`, 15, 40)
      doc.text(`Período: ${filtroFecha || "Todos los períodos"}`, 15, 45)

      let yPos = 60

      // Estadísticas generales
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text("ESTADÍSTICAS GENERALES", 15, yPos)
      yPos += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Total de Ventas: RD$ ${getTotalVentas().toLocaleString()}`, 15, yPos)
      yPos += 6
      doc.text(`Total de Cotizaciones: RD$ ${getTotalCotizaciones().toLocaleString()}`, 15, yPos)
      yPos += 6
      doc.text(`Total Cuentas por Cobrar: RD$ ${getTotalCuentasPorCobrar().toLocaleString()}`, 15, yPos)
      yPos += 6
      doc.text(`Número de Facturas: ${facturasFiltradas.length}`, 15, yPos)
      yPos += 6
      doc.text(`Número de Cotizaciones: ${cotizacionesFiltradas.length}`, 15, yPos)
      yPos += 15

      // Ventas por mes
      const ventasPorMes = getVentasPorMes()
      if (Object.keys(ventasPorMes).length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("VENTAS POR MES", 15, yPos)
        yPos += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        Object.entries(ventasPorMes).forEach(([mes, total]) => {
          doc.text(`${mes}: RD$ ${total.toLocaleString()}`, 15, yPos)
          yPos += 6
        })
        yPos += 10
      }

      // Ventas por método de pago
      const ventasPorMetodo = getVentasPorMetodoPago()
      if (Object.keys(ventasPorMetodo).length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("VENTAS POR MÉTODO DE PAGO", 15, yPos)
        yPos += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        Object.entries(ventasPorMetodo).forEach(([metodo, total]) => {
          doc.text(`${metodo.toUpperCase()}: RD$ ${total.toLocaleString()}`, 15, yPos)
          yPos += 6
        })
        yPos += 10
      }

      // Cuentas por cobrar
      const cuentasPorCobrar = getCuentasPorCobrar()
      if (cuentasPorCobrar.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text("CUENTAS POR COBRAR", 15, yPos)
        yPos += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        cuentasPorCobrar.forEach((cuenta) => {
          doc.text(`${cuenta.cliente}: RD$ ${(cuenta.montoPendiente || 0).toLocaleString()}`, 15, yPos)
          if (cuenta.fechaPagoPendiente) {
            doc.text(`Vence: ${new Date(cuenta.fechaPagoPendiente).toLocaleDateString("es-DO")}`, 25, yPos + 4)
            yPos += 4
          }
          yPos += 6
        })
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(8)
      doc.setTextColor(...secondaryColor)
      doc.text("Reporte generado por JumTech RD", 15, pageHeight - 20)
      doc.text("Email: jumtechRD@gmail.com | Tel: +1 (809) 984-8283", 15, pageHeight - 15)

      // Descargar PDF
      doc.save(`Reporte_JumTech_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generando reporte:", error)
      alert("Error al generar el reporte PDF")
    }
  }

  const exportarReporteExcel = async () => {
    try {
      const XLSX = (await import("xlsx")).default

      // Crear workbook
      const workbook = XLSX.utils.book_new()

      // Hoja de estadísticas generales
      const estadisticasData = [
        ["ESTADÍSTICAS GENERALES"],
        ["Fecha del reporte", new Date().toLocaleDateString("es-DO")],
        ["Período", filtroFecha || "Todos los períodos"],
        [""],
        ["Total de Ventas", getTotalVentas()],
        ["Total de Cotizaciones", getTotalCotizaciones()],
        ["Total Cuentas por Cobrar", getTotalCuentasPorCobrar()],
        ["Número de Facturas", facturasFiltradas.length],
        ["Número de Cotizaciones", cotizacionesFiltradas.length],
      ]

      const estadisticasSheet = XLSX.utils.aoa_to_sheet(estadisticasData)
      XLSX.utils.book_append_sheet(workbook, estadisticasSheet, "Estadísticas")

      // Hoja de ventas por mes
      const ventasPorMes = getVentasPorMes()
      if (Object.keys(ventasPorMes).length > 0) {
        const ventasMesData = [
          ["VENTAS POR MES"],
          ["Mes", "Total (RD$)"],
          ...Object.entries(ventasPorMes).map(([mes, total]) => [mes, total]),
        ]

        const ventasMesSheet = XLSX.utils.aoa_to_sheet(ventasMesData)
        XLSX.utils.book_append_sheet(workbook, ventasMesSheet, "Ventas por Mes")
      }

      // Hoja de ventas por método de pago
      const ventasPorMetodo = getVentasPorMetodoPago()
      if (Object.keys(ventasPorMetodo).length > 0) {
        const ventasMetodoData = [
          ["VENTAS POR MÉTODO DE PAGO"],
          ["Método", "Total (RD$)"],
          ...Object.entries(ventasPorMetodo).map(([metodo, total]) => [metodo.toUpperCase(), total]),
        ]

        const ventasMetodoSheet = XLSX.utils.aoa_to_sheet(ventasMetodoData)
        XLSX.utils.book_append_sheet(workbook, ventasMetodoSheet, "Ventas por Método")
      }

      // Hoja de cuentas por cobrar
      const cuentasPorCobrar = getCuentasPorCobrar()
      if (cuentasPorCobrar.length > 0) {
        const cuentasData = [
          ["CUENTAS POR COBRAR"],
          ["Cliente", "Email", "Monto Pendiente (RD$)", "Fecha Vencimiento", "Porcentaje Pagado"],
          ...cuentasPorCobrar.map((cuenta) => [
            cuenta.cliente,
            cuenta.email,
            cuenta.montoPendiente || 0,
            cuenta.fechaPagoPendiente ? new Date(cuenta.fechaPagoPendiente).toLocaleDateString("es-DO") : "",
            `${cuenta.porcentajePago}%`,
          ]),
        ]

        const cuentasSheet = XLSX.utils.aoa_to_sheet(cuentasData)
        XLSX.utils.book_append_sheet(workbook, cuentasSheet, "Cuentas por Cobrar")
      }

      // Hoja de facturas detalladas
      if (facturasFiltradas.length > 0) {
        const facturasData = [
          ["FACTURAS DETALLADAS"],
          ["Número", "Cliente", "Email", "Fecha", "Vencimiento", "Total (RD$)", "Estado"],
          ...facturasFiltradas.map((f) => [
            f.numero,
            f.cliente,
            f.email,
            new Date(f.fecha).toLocaleDateString("es-DO"),
            new Date(f.vencimiento).toLocaleDateString("es-DO"),
            f.total,
            f.estado,
          ]),
        ]

        const facturasSheet = XLSX.utils.aoa_to_sheet(facturasData)
        XLSX.utils.book_append_sheet(workbook, facturasSheet, "Facturas")
      }

      // Hoja de cotizaciones detalladas
      if (cotizacionesFiltradas.length > 0) {
        const cotizacionesData = [
          ["COTIZACIONES DETALLADAS"],
          ["Número", "Cliente", "Email", "Fecha", "Total (RD$)", "Estado", "Tipo Pago", "Porcentaje Pago"],
          ...cotizacionesFiltradas.map((c) => [
            c.numeroFactura || c.id,
            c.cliente,
            c.email,
            new Date(c.fecha).toLocaleDateString("es-DO"),
            c.total,
            c.estado,
            c.tipoPago || "efectivo",
            `${c.porcentajePago || 100}%`,
          ]),
        ]

        const cotizacionesSheet = XLSX.utils.aoa_to_sheet(cotizacionesData)
        XLSX.utils.book_append_sheet(workbook, cotizacionesSheet, "Cotizaciones")
      }

      // Descargar archivo Excel
      XLSX.writeFile(workbook, `Reporte_JumTech_${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("Error generando reporte Excel:", error)
      alert("Error al generar el reporte Excel")
    }
  }

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/jumtech-logo-new.png"
              alt="JumTech RD Logo"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <div>
              <span className="text-xl font-bold text-white">JumTech RD</span>
              <Badge className="ml-2 bg-green-600/20 text-green-400 border-green-600/30 text-xs">Reportes</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              <Home className="h-4 w-4 mr-1 inline" />
              Ver Sitio
            </Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/productos" className="text-gray-300 hover:text-white transition-colors">
              Productos
            </Link>
            <Link href="/admin/cotizaciones" className="text-gray-300 hover:text-white transition-colors">
              Cotizaciones
            </Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white transition-colors">
              Facturas
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-600/20 text-green-400 border-green-600/30">Módulo de Reportes</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Reportes y Cuentas por Cobrar</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Analiza ventas, cotizaciones y gestiona cuentas por cobrar con reportes detallados
            </p>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                placeholder="Filtrar por fecha"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="pl-10 bg-white/5 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Filtrar por cliente"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className="pl-10 bg-white/5 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filtroTipoPago}
                onChange={(e) => setFiltroTipoPago(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white"
              >
                <option value="todos">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <Button onClick={exportarReportePDF} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={exportarReporteExcel} className="bg-blue-600 hover:bg-blue-700">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-600/20 rounded-lg mr-4">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Ventas</p>
                    <p className="text-2xl font-bold text-white">RD$ {getTotalVentas().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600/20 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Cotizaciones</p>
                    <p className="text-2xl font-bold text-white">RD$ {getTotalCotizaciones().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-600/20 rounded-lg mr-4">
                    <AlertCircle className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Cuentas por Cobrar</p>
                    <p className="text-2xl font-bold text-white">RD$ {getTotalCuentasPorCobrar().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600/20 rounded-lg mr-4">
                    <Receipt className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Facturas</p>
                    <p className="text-2xl font-bold text-white">{facturasFiltradas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cuentas por cobrar */}
          <div className="mb-8">
            <Card className="bg-white/5 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-400" />
                  Cuentas por Cobrar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getCuentasPorCobrar().length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No hay cuentas por cobrar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCuentasPorCobrar().map((cuenta) => (
                      <div
                        key={cuenta.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-gray-700/30"
                      >
                        <div>
                          <h4 className="font-medium text-white">{cuenta.cliente}</h4>
                          <p className="text-sm text-gray-400">{cuenta.email}</p>
                          {cuenta.fechaPagoPendiente && (
                            <p className="text-sm text-orange-400">
                              Vence: {new Date(cuenta.fechaPagoPendiente).toLocaleDateString("es-DO")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-400">
                            RD$ {(cuenta.montoPendiente || 0).toLocaleString()}
                          </p>
                          <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30 text-xs">
                            {cuenta.porcentajePago}% pagado
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ventas por mes */}
          <div className="mb-8">
            <Card className="bg-white/5 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-400" />
                  Ventas por Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(getVentasPorMes()).length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No hay datos de ventas para mostrar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(getVentasPorMes()).map(([mes, total]) => (
                      <div key={mes} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white font-medium">{mes}</span>
                        <span className="text-green-400 font-bold">RD$ {total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ventas por método de pago */}
          <div className="mb-8">
            <Card className="bg-white/5 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                  Ventas por Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(getVentasPorMetodoPago()).length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No hay datos de métodos de pago para mostrar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(getVentasPorMetodoPago()).map(([metodo, total]) => (
                      <div key={metodo} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white font-medium">{metodo.toUpperCase()}</span>
                        <span className="text-blue-400 font-bold">RD$ {total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
