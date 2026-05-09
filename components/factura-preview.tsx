"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
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

interface FacturaPreviewProps {
  factura: Factura
}

export function FacturaPreview({ factura }: FacturaPreviewProps) {
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

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white text-black">
      {/* Header */}
      <CardHeader className="bg-red-600 text-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Image src="/images/jumtech-logo-new.png" alt="JumTech RD" width={40} height={40} className="rounded" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">JumTech RD</h1>
              <p className="text-red-100">Soluciones Tecnológicas Integrales</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-2xl sm:text-3xl font-bold">FACTURA</h2>
            <p className="text-red-100">#{factura.numero}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Información de la factura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-lg mb-2">Información de la Empresa</h3>
            <p>📧 jumtechRD@gmail.com</p>
            <p>📱 +1 (809) 984-8283</p>
            <p>🌐 República Dominicana</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">Estado</h3>
              <Badge className={getEstadoColor(factura.estado)}>{factura.estado.toUpperCase()}</Badge>
            </div>
            <p>
              <strong>Fecha:</strong> {new Date(factura.fecha).toLocaleDateString("es-DO")}
            </p>
            <p>
              <strong>Vencimiento:</strong> {new Date(factura.vencimiento).toLocaleDateString("es-DO")}
            </p>
            <p>
              <strong>Método de pago:</strong> {factura.paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"}
            </p>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-lg mb-2">FACTURAR A:</h3>
          <p className="font-semibold">{factura.cliente}</p>
          {factura.companyName && <p>🏢 {factura.companyName}</p>}
          {factura.identification && <p>🪪 {factura.identification}</p>}
          {factura.email && <p>📧 {factura.email}</p>}
          {factura.telefono && <p>📱 {factura.telefono}</p>}
          {factura.direccion && <p>📍 {factura.direccion}</p>}
        </div>

        {/* Tabla de productos */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Descripción</th>
                  <th className="border p-3 text-center">Cant.</th>
                  <th className="border p-3 text-right">Precio</th>
                  <th className="border p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {factura.productos.map((producto, index) => (
                  <tr key={producto.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="border p-3">
                      <div>
                        <p className="font-semibold">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">{producto.descripcion}</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">{producto.categoria}</Badge>
                      </div>
                    </td>
                    <td className="border p-3 text-center">{producto.cantidad}</td>
                    <td className="border p-3 text-right">${producto.precio.toLocaleString()}</td>
                    <td className="border p-3 text-right font-semibold">
                      ${(producto.precio * producto.cantidad).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-64">
            <div className="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>${factura.subtotal.toLocaleString()}</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-2">
              <div className="flex justify-between py-2 text-xl font-bold text-red-600">
                <span>TOTAL:</span>
                <span>${factura.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        {factura.notas && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-bold mb-2">NOTAS:</h3>
            <p className="text-sm">{factura.notas}</p>
          </div>
        )}

        {/* Footer */}
        <div className="break-words text-center text-sm text-gray-500 border-t pt-4">
          <p>Gracias por su confianza - JumTech RD</p>
          <p>📧 jumtechRD@gmail.com | 📱 +1 (809) 984-8283 | 🌐 República Dominicana</p>
        </div>
      </CardContent>
    </Card>
  )
}
