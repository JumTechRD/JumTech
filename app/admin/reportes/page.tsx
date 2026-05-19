"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  FileText,
  Receipt,
  Home,
  LogOut,
  Download,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
} from "lucide-react"
import { AdminBottomNav } from "@/components/admin-bottom-nav"
import { ensureAdminSession, logoutAdminSession } from "@/lib/admin-session-client"
import { fetchAdminInvoices, fetchAdminProducts, fetchAdminQuotes } from "@/lib/admin-api-client"

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
  monedaPrincipal?: string
}

interface Factura {
  id: string
  numero: string
  cliente: string
  email: string
  telefono?: string
  fecha: string
  vencimiento: string
  productos: any[]
  subtotal: number
  impuestos: number
  total: number
  estado: "pendiente" | "pagada" | "vencida" | "cancelada"
}

interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: string
  stock: number
}

export default function ReportesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [tabActiva, setTabActiva] = useState<"resumen" | "cotizaciones" | "facturas">("resumen")
  const router = useRouter()

  useEffect(() => {
    const loadAdminPage = async () => {
      const isSessionValid = await ensureAdminSession(router)
      if (!isSessionValid) return

      setIsAuthenticated(true)

      const [cotizacionesData, facturasData, productosData] = await Promise.all([
        fetchAdminQuotes<Cotizacion[]>(),
        fetchAdminInvoices<Factura[]>(),
        fetchAdminProducts<Producto[]>(),
      ])
      setCotizaciones(cotizacionesData)
      setFacturas(facturasData)
      setProductos(productosData)
    }

    void loadAdminPage()
  }, [router])

  const handleLogout = () => {
    void logoutAdminSession(router)
  }

  // ── Métricas ──────────────────────────────────────────────
  const totalCotizaciones = cotizaciones.length
  const cotizacionesAprobadas = cotizaciones.filter((c) => c.estado === "aprobada").length
  const cotizacionesPendientes = cotizaciones.filter((c) => c.estado === "pendiente").length
  const montoCotizaciones = cotizaciones.reduce((s, c) => s + c.total, 0)

  const totalFacturas = facturas.length
  const facturasPagadas = facturas.filter((f) => f.estado === "pagada").length
  const facturasPendientes = facturas.filter((f) => f.estado === "pendiente").length
  const montoFacturado = facturas.reduce((s, f) => s + f.total, 0)
  const montoFacturasPagadas = facturas.filter((f) => f.estado === "pagada").reduce((s, f) => s + f.total, 0)

  // ── Exportar PDF ──────────────────────────────────────────
  const exportarPDF = async () => {
    setIsExportingPDF(true)
    try {
      const jsPDF = (await import("jspdf")).default
      const doc = new jsPDF("portrait")

      const rojo: [number, number, number] = [220, 38, 38]
      const negro: [number, number, number] = [31, 41, 55]
      const gris: [number, number, number] = [107, 114, 128]

      // Header
      doc.setFillColor(...rojo)
      doc.rect(0, 0, 210, 38, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("JumTech RD", 15, 18)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Reporte General de Actividad", 15, 26)
      doc.text(`Generado: ${new Date().toLocaleDateString("es-DO")}`, 15, 33)
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("REPORTE", 160, 22)

      // Sección Cotizaciones
      let y = 52
      doc.setTextColor(...rojo)
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.text("COTIZACIONES", 15, y)

      y += 8
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...negro)

      const datosCot = [
        ["Total cotizaciones", totalCotizaciones.toString()],
        ["Aprobadas", cotizacionesAprobadas.toString()],
        ["Pendientes", cotizacionesPendientes.toString()],
        ["Monto total", `RD$ ${montoCotizaciones.toLocaleString()}`],
      ]

      datosCot.forEach(([label, valor]) => {
        doc.setFont("helvetica", "bold")
        doc.text(label + ":", 15, y)
        doc.setFont("helvetica", "normal")
        doc.text(valor, 80, y)
        y += 7
      })

      // Tabla cotizaciones
      y += 6
      doc.setFillColor(248, 250, 252)
      doc.rect(15, y, 180, 8, "F")
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...gris)
      doc.text("Cliente", 18, y + 5.5)
      doc.text("Número", 75, y + 5.5)
      doc.text("Estado", 120, y + 5.5)
      doc.text("Total", 160, y + 5.5)
      y += 11

      cotizaciones.slice(0, 10).forEach((c, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(15, y - 2, 180, 8, "F")
        }
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...negro)
        doc.text(c.cliente.substring(0, 28), 18, y + 4)
        doc.text((c.numeroFactura || c.id.slice(-6)).substring(0, 18), 75, y + 4)
        doc.text(c.estado, 120, y + 4)
        doc.text(`${c.monedaPrincipal || "RD$"} ${c.total.toLocaleString()}`, 155, y + 4)
        y += 9
      })

      // Sección Facturas
      y += 10
      if (y > 240) { doc.addPage(); y = 20 }

      doc.setTextColor(...rojo)
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.text("FACTURAS", 15, y)

      y += 8
      doc.setFontSize(9)
      doc.setTextColor(...negro)

      const datosF = [
        ["Total facturas", totalFacturas.toString()],
        ["Pagadas", facturasPagadas.toString()],
        ["Pendientes", facturasPendientes.toString()],
        ["Total facturado", `RD$ ${montoFacturado.toLocaleString()}`],
        ["Total cobrado", `RD$ ${montoFacturasPagadas.toLocaleString()}`],
      ]

      datosF.forEach(([label, valor]) => {
        doc.setFont("helvetica", "bold")
        doc.text(label + ":", 15, y)
        doc.setFont("helvetica", "normal")
        doc.text(valor, 80, y)
        y += 7
      })

      // Tabla facturas
      y += 6
      doc.setFillColor(248, 250, 252)
      doc.rect(15, y, 180, 8, "F")
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...gris)
      doc.text("Cliente", 18, y + 5.5)
      doc.text("Número", 75, y + 5.5)
      doc.text("Estado", 120, y + 5.5)
      doc.text("Total", 160, y + 5.5)
      y += 11

      facturas.slice(0, 10).forEach((f, i) => {
        if (y > 270) { doc.addPage(); y = 20 }
        if (i % 2 === 0) {
          doc.setFillColor(249, 250, 251)
          doc.rect(15, y - 2, 180, 8, "F")
        }
        doc.setFont("helvetica", "normal")
        doc.setTextColor(...negro)
        doc.text(f.cliente.substring(0, 28), 18, y + 4)
        doc.text(f.numero.substring(0, 18), 75, y + 4)
        doc.text(f.estado, 120, y + 4)
        doc.text(`RD$ ${f.total.toLocaleString()}`, 155, y + 4)
        y += 9
      })

      // Footer
      doc.setFontSize(7)
      doc.setTextColor(...gris)
      doc.text("JumTech RD — Soluciones Tecnológicas Integrales | jumtechRD@gmail.com", 15, 285)

      doc.save(`Reporte-JumTech-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (e) {
      console.error(e)
      alert("Error al generar el PDF")
    } finally {
      setIsExportingPDF(false)
    }
  }

  // ── Exportar Excel (CSV) ──────────────────────────────────
  const exportarExcel = () => {
    setIsExportingExcel(true)
    try {
      const bom = "\uFEFF"

      // Hoja Cotizaciones
      let csvCot = "COTIZACIONES\r\n"
      csvCot += "Número,Cliente,Email,Teléfono,Fecha,Estado,Subtotal,ITBIS,Total,Moneda,Productos\r\n"
      cotizaciones.forEach((c) => {
        const num = c.numeroFactura || c.id.slice(-6)
        const fecha = new Date(c.fecha).toLocaleDateString("es-DO")
        const prods = c.productos.map((p: any) => `${p.nombre}(x${p.cantidad})`).join(" | ")
        csvCot += `"${num}","${c.cliente}","${c.email || ""}","${c.telefono || ""}","${fecha}","${c.estado}","${c.subtotal}","${c.impuestos}","${c.total}","${c.monedaPrincipal || "RD$"}","${prods}"\r\n`
      })

      csvCot += "\r\nRESUMEN COTIZACIONES\r\n"
      csvCot += `Total cotizaciones,${totalCotizaciones}\r\n`
      csvCot += `Aprobadas,${cotizacionesAprobadas}\r\n`
      csvCot += `Pendientes,${cotizacionesPendientes}\r\n`
      csvCot += `Monto total,"RD$ ${montoCotizaciones.toLocaleString()}"\r\n`

      // Hoja Facturas
      let csvFac = "\r\nFACTURAS\r\n"
      csvFac += "Número,Cliente,Email,Teléfono,Fecha,Vencimiento,Estado,Subtotal,ITBIS,Total\r\n"
      facturas.forEach((f) => {
        const fecha = new Date(f.fecha).toLocaleDateString("es-DO")
        const venc = new Date(f.vencimiento).toLocaleDateString("es-DO")
        csvFac += `"${f.numero}","${f.cliente}","${f.email || ""}","${f.telefono || ""}","${fecha}","${venc}","${f.estado}","${f.subtotal}","${f.impuestos}","${f.total}"\r\n`
      })

      csvFac += "\r\nRESUMEN FACTURAS\r\n"
      csvFac += `Total facturas,${totalFacturas}\r\n`
      csvFac += `Pagadas,${facturasPagadas}\r\n`
      csvFac += `Pendientes,${facturasPendientes}\r\n`
      csvFac += `Total facturado,"RD$ ${montoFacturado.toLocaleString()}"\r\n`
      csvFac += `Total cobrado,"RD$ ${montoFacturasPagadas.toLocaleString()}"\r\n`

      const blob = new Blob([bom + csvCot + csvFac], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Reporte-JumTech-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert("Error al generar el Excel")
    } finally {
      setIsExportingExcel(false)
    }
  }

  const estadoColor = (e: string) => {
    const m: Record<string, string> = {
      pendiente: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
      enviada: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      aprobada: "bg-green-600/20 text-green-400 border-green-600/30",
      rechazada: "bg-red-600/20 text-red-400 border-red-600/30",
      pagada: "bg-green-600/20 text-green-400 border-green-600/30",
      vencida: "bg-orange-600/20 text-orange-400 border-orange-600/30",
      cancelada: "bg-gray-600/20 text-gray-400 border-gray-600/30",
    }
    return m[e] || m.cancelada
  }

  if (!isAuthenticated) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-white">Cargando...</p></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      {/* Nav — mobile friendly */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/images/logo-nuevo-transparente.png"
              alt="JumTech RD"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <span className="text-base font-bold text-white">JumTech RD</span>
              <Badge className="ml-2 bg-green-600/20 text-green-400 border-green-600/30 text-xs hidden sm:inline-flex">Reportes</Badge>
            </div>
          </div>
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white text-sm flex items-center gap-1"><Home className="h-4 w-4" />Ver Sitio</Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">Dashboard</Link>
            <Link href="/admin/clientes" className="text-gray-300 hover:text-white text-sm">Clientes</Link>
            <Link href="/admin/cotizaciones" className="text-gray-300 hover:text-white text-sm flex items-center gap-1"><FileText className="h-4 w-4" />Cotizaciones</Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white text-sm flex items-center gap-1"><Receipt className="h-4 w-4" />Facturas</Link>
            <Link href="/admin/usuarios" className="text-gray-300 hover:text-white text-sm">Usuarios</Link>
            <Button variant="ghost" onClick={handleLogout} className="text-slate-200 hover:text-white hover:bg-white/10 text-sm">
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          </div>
          {/* Mobile nav */}
          <div className="flex lg:hidden items-center gap-2">
            <Link href="/admin/dashboard"><Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-white/10 p-2"><Home className="h-4 w-4" /></Button></Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-200 hover:text-white hover:bg-white/10 p-2"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-24 lg:pb-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-green-600/20 text-green-400 border-green-600/30">Análisis de Actividad</Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Reportes</h1>
            <p className="text-gray-400 text-sm md:text-base">Resumen completo de cotizaciones y facturas</p>
          </div>

          {/* Botones exportar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
            <Button
              onClick={exportarPDF}
              disabled={isExportingPDF}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              {isExportingPDF ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Generando PDF...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" />Exportar PDF</>
              )}
            </Button>
            <Button
              onClick={exportarExcel}
              disabled={isExportingExcel}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              {isExportingExcel ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Generando Excel...</>
              ) : (
                <><FileSpreadsheet className="h-4 w-4 mr-2" />Exportar Excel</>
              )}
            </Button>
          </div>

          {/* KPIs — 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Total Cotizaciones</p>
                    <p className="text-2xl font-bold text-white">{totalCotizaciones}</p>
                    <p className="text-green-400 text-xs mt-1">{cotizacionesAprobadas} aprobadas</p>
                  </div>
                  <FileText className="h-6 w-6 text-blue-400 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Monto Cotizaciones</p>
                    <p className="text-xl font-bold text-blue-400">RD$ {(montoCotizaciones / 1000).toFixed(0)}K</p>
                    <p className="text-gray-500 text-xs mt-1">{cotizacionesPendientes} pendientes</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-400 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Total Facturas</p>
                    <p className="text-2xl font-bold text-white">{totalFacturas}</p>
                    <p className="text-green-400 text-xs mt-1">{facturasPagadas} pagadas</p>
                  </div>
                  <Receipt className="h-6 w-6 text-purple-400 shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Total Cobrado</p>
                    <p className="text-xl font-bold text-green-400">RD$ {(montoFacturasPagadas / 1000).toFixed(0)}K</p>
                    <p className="text-gray-500 text-xs mt-1">{facturasPendientes} pendientes</p>
                  </div>
                  <DollarSign className="h-6 w-6 text-green-400 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700/50 mb-6 overflow-x-auto">
            {(["resumen", "cotizaciones", "facturas"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActiva(tab)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tabActiva === tab
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab === "resumen" ? "Resumen" : tab === "cotizaciones" ? "Cotizaciones" : "Facturas"}
              </button>
            ))}
          </div>

          {/* Tab: Resumen */}
          {tabActiva === "resumen" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-gray-700/50">
                <CardContent className="p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-blue-400" />Cotizaciones</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Total", val: totalCotizaciones, color: "text-white" },
                      { label: "Aprobadas", val: cotizacionesAprobadas, color: "text-green-400" },
                      { label: "Pendientes", val: cotizacionesPendientes, color: "text-yellow-400" },
                      { label: "Rechazadas", val: cotizaciones.filter(c => c.estado === "rechazada").length, color: "text-red-400" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-gray-700/30 last:border-0">
                        <span className="text-gray-400 text-sm">{label}</span>
                        <span className={`shrink-0 font-bold ${color}`}>{val}</span>
                      </div>
                    ))}
                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Monto Total</span>
                        <span className="font-bold text-blue-400">RD$ {montoCotizaciones.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-gray-700/50">
                <CardContent className="p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Receipt className="h-4 w-4 text-purple-400" />Facturas</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Total", val: totalFacturas, color: "text-white" },
                      { label: "Pagadas", val: facturasPagadas, color: "text-green-400" },
                      { label: "Pendientes", val: facturasPendientes, color: "text-yellow-400" },
                      { label: "Vencidas", val: facturas.filter(f => f.estado === "vencida").length, color: "text-orange-400" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-gray-700/30 last:border-0">
                        <span className="text-gray-400 text-sm">{label}</span>
                        <span className={`shrink-0 font-bold ${color}`}>{val}</span>
                      </div>
                    ))}
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Facturado</span>
                        <span className="font-bold text-purple-400">RD$ {montoFacturado.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Cobrado</span>
                        <span className="font-bold text-green-400">RD$ {montoFacturasPagadas.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab: Cotizaciones */}
          {tabActiva === "cotizaciones" && (
            <div className="space-y-3">
              {cotizaciones.length === 0 ? (
                <Card className="bg-white/5 border-gray-700/50">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No hay cotizaciones registradas</p>
                    <Link href="/admin/cotizaciones"><Button className="mt-4 bg-blue-600 hover:bg-blue-700">Crear cotización</Button></Link>
                  </CardContent>
                </Card>
              ) : cotizaciones.map((c) => (
                <Card key={c.id} className="bg-white/5 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-medium">{c.cliente}</p>
                        <p className="text-gray-400 text-xs">{c.numeroFactura || `COT-${c.id.slice(-6)}`} · {new Date(c.fecha).toLocaleDateString("es-DO")}</p>
                        <p className="text-gray-500 text-xs">{c.productos.length} productos</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-end">
                        <Badge className={estadoColor(c.estado)}>{c.estado}</Badge>
                        <p className="text-blue-400 font-bold">{c.monedaPrincipal || "RD$"} {c.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tab: Facturas */}
          {tabActiva === "facturas" && (
            <div className="space-y-3">
              {facturas.length === 0 ? (
                <Card className="bg-white/5 border-gray-700/50">
                  <CardContent className="p-8 text-center">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No hay facturas registradas</p>
                    <Link href="/admin/facturas"><Button className="mt-4 bg-purple-600 hover:bg-purple-700">Crear factura</Button></Link>
                  </CardContent>
                </Card>
              ) : facturas.map((f) => (
                <Card key={f.id} className="bg-white/5 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-medium">{f.cliente}</p>
                        <p className="text-gray-400 text-xs">{f.numero} · {new Date(f.fecha).toLocaleDateString("es-DO")}</p>
                        <p className="text-gray-500 text-xs">Vence: {new Date(f.vencimiento).toLocaleDateString("es-DO")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-end">
                        <Badge className={estadoColor(f.estado)}>{f.estado}</Badge>
                        <p className="text-purple-400 font-bold">RD$ {f.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bottom nav mobile */}
          <AdminBottomNav />
          <div className="h-16 lg:hidden" />
        </div>
      </div>
    </div>
  )
}
