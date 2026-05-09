"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Star,
  Package,
  DollarSign,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  Eye,
  Calendar,
  Tag,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
} from "lucide-react"
import { fetchPublicProduct } from "@/lib/admin-api-client"

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
  // Campos adicionales
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

const categorias = [
  { id: "laptops", nombre: "Laptops", icon: "💻" },
  { id: "monitores", nombre: "Monitores", icon: "🖥️" },
  { id: "celulares", nombre: "Celulares", icon: "📱" },
  { id: "tablets", nombre: "Tablets", icon: "📱" },
  { id: "camaras", nombre: "Cámaras", icon: "📹" },
  { id: "discos", nombre: "Discos Duros", icon: "💾" },
  { id: "memorias", nombre: "Memorias RAM", icon: "🧠" },
  { id: "redes", nombre: "Equipos de Red", icon: "🌐" },
  { id: "accesorios", nombre: "Accesorios", icon: "🔌" },
  { id: "mantenimiento", nombre: "Mantenimiento", icon: "🔧" },
  { id: "seguridad", nombre: "Seguridad", icon: "🔒" },
  { id: "desarrollo", nombre: "Desarrollo", icon: "💻" },
  { id: "ciberseguridad", nombre: "Ciberseguridad", icon: "🛡️" },
  { id: "otros", nombre: "Otros", icon: "📦" },
]

export default function ProductoDetailPage() {
  const params = useParams()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const productId = Array.isArray(params.id) ? params.id[0] : params.id
    if (!productId) {
      setError("Producto no encontrado")
      setLoading(false)
      return
    }

    const cargarProducto = async () => {
      try {
        setProducto(await fetchPublicProduct<Producto>(productId))
      } catch (err) {
        setError("Error al cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    void cargarProducto()
  }, [params.id])

  const categoriaInfo = categorias.find(cat => cat.id === producto?.categoria)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Producto no encontrado</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/productos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Productos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-x-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/images/jum-negro.jpeg"
              alt="JumTech RD Logo"
              width={180}
              height={54}
              className="h-10 sm:h-12 w-auto object-contain [mix-blend-mode:screen]"
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/servicios" className="text-gray-300 hover:text-white transition-colors">
              Servicios
            </Link>
            <Link href="/productos" className="text-red-400 font-semibold">
              Productos
            </Link>
            <Link href="/nosotros" className="text-gray-300 hover:text-white transition-colors">
              Nosotros
            </Link>
            <Link href="/#contacto" className="text-gray-300 hover:text-white transition-colors">
              Contacto
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-4 bg-black/90 backdrop-blur-xl border-t border-gray-800/50">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/servicios"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="/productos"
                className="text-red-400 font-semibold py-2 px-4 rounded-lg bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                href="/nosotros"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/#contacto"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 px-4 relative z-10">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-8">
            <Button variant="ghost" className="max-w-full text-gray-300 hover:text-white sm:mr-4" asChild>
              <Link href="/productos">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver a Productos
              </Link>
            </Button>
            <div className="min-w-0 text-sm text-gray-400">
              <Link href="/productos" className="hover:text-white">Productos</Link>
              <span className="mx-2">/</span>
              <span className="text-white break-words">{producto.nombre}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative h-72 sm:h-96 lg:h-[500px] overflow-hidden rounded-2xl bg-gray-800">
                <Image
                  src={producto.imagen || "/placeholder.svg"}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  priority
                />
                {producto.stock <= (producto.stockMinimo || 0) && (
                  <Badge className="absolute top-4 right-4 bg-orange-600/20 text-orange-400 border-orange-600/30">
                    Stock Bajo
                  </Badge>
                )}
                {producto.stock === 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-600/20 text-red-400 border-red-600/30">
                    Sin Stock
                  </Badge>
                )}
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/5 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <Package className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Categoría</p>
                    <p className="text-white font-semibold">{categoriaInfo?.nombre || producto.categoria}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-gray-700/50">
                  <CardContent className="p-4 text-center">
                    <Eye className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Disponibilidad</p>
                    <p className="text-white font-semibold">{producto.stock} unidades</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{categoriaInfo?.icon}</span>
                  <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                    {categoriaInfo?.nombre || producto.categoria}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 break-words">{producto.nombre}</h1>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">{producto.descripcion}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(producto.rating) ? "text-yellow-400 fill-current" : "text-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">({producto.rating})</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{producto.vendido || 0} vendidos</span>
              </div>

              {/* Price */}
              <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-red-400">RD$ {producto.precio.toLocaleString()}</span>
                  {producto.precioCompra && (
                    <span className="text-lg text-gray-400">
                      (Margen: {producto.margenGanancia?.toFixed(1)}%)
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  Precio final incluye garantía y soporte técnico
                </p>
              </div>

              {/* Specifications */}
              <Card className="bg-white/5 border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-red-400" />
                    Especificaciones Técnicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {producto.especificaciones.map((spec, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{spec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              {(producto.sku || producto.proveedor || producto.garantia) && (
                <Card className="bg-white/5 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Package className="h-5 w-5 mr-2 text-red-400" />
                      Información Adicional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {producto.sku && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-400">SKU:</span>
                        <span className="text-right text-white break-words">{producto.sku}</span>
                      </div>
                    )}
                    {producto.proveedor && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-400">Proveedor:</span>
                        <span className="text-right text-white break-words">{producto.proveedor}</span>
                      </div>
                    )}
                    {producto.garantia && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-400">Garantía:</span>
                        <span className="text-white">{producto.garantia} meses</span>
                      </div>
                    )}
                    {producto.peso && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-400">Peso:</span>
                        <span className="text-white">{producto.peso} kg</span>
                      </div>
                    )}
                    {producto.dimensiones && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-400">Dimensiones:</span>
                        <span className="text-right text-white break-words">
                          {producto.dimensiones.largo} × {producto.dimensiones.ancho} × {producto.dimensiones.alto} cm
                        </span>
                      </div>
                    )}
                    {producto.ubicacion && (
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-400">Ubicación:</span>
                        <span className="flex items-center text-right text-white break-words">
                          <MapPin className="h-4 w-4 mr-1" />
                          {producto.ubicacion}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-lg py-3"
                    asChild
                  >
                    <Link href="/#contacto">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Consultar Disponibilidad
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10 text-lg py-3"
                    asChild
                  >
                    <Link href="/#contacto">
                      <Phone className="h-5 w-5 mr-2" />
                      Llamar Ahora
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">
                    ¿Necesitas más información o tienes dudas?
                  </p>
                  <Button 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                    asChild
                  >
                    <Link href="/#contacto">
                      <Mail className="h-4 w-4 mr-2" />
                      Contactar por Email
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-gray-700/50">
                  <Truck className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Envío</p>
                  <p className="text-white font-semibold">Gratis</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-gray-700/50">
                  <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Garantía</p>
                  <p className="text-white font-semibold">{producto.garantia || 12} meses</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-gray-700/50">
                  <CheckCircle className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Soporte</p>
                  <p className="text-white font-semibold">24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
