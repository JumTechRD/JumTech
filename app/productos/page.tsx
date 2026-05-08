"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Star,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Camera,
  HardDrive,
  MemoryStick,
  Router,
  Headphones,
  Menu,
  X,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { fetchPublicProducts } from "@/lib/admin-api-client"

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
}

const categorias = [
  { id: "todos", nombre: "Todos", icon: ShoppingCart },
  { id: "laptops", nombre: "Laptops", icon: Laptop },
  { id: "monitores", nombre: "Monitores", icon: Monitor },
  { id: "celulares", nombre: "Celulares", icon: Smartphone },
  { id: "tablets", nombre: "Tablets", icon: Tablet },
  { id: "camaras", nombre: "Cámaras", icon: Camera },
  { id: "discos", nombre: "Discos Duros", icon: HardDrive },
  { id: "memorias", nombre: "Memorias RAM", icon: MemoryStick },
  { id: "redes", nombre: "Equipos de Red", icon: Router },
  { id: "accesorios", nombre: "Accesorios", icon: Headphones },
]

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const cargarProductos = async () => {
      try {
        const productosData = await fetchPublicProducts<Producto[]>()
        if (isMounted) {
          setProductos(productosData)
          setProductosFiltrados(productosData)
        }
      } catch (error) {
        if (isMounted) {
          setProductos([])
          setProductosFiltrados([])
        }
      }
    }

    void cargarProductos()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let filtrados = productos

    // Filtrar por categoría
    if (categoriaSeleccionada !== "todos") {
      filtrados = filtrados.filter((producto) => producto.categoria === categoriaSeleccionada)
    }

    // Filtrar por búsqueda
    if (busqueda) {
      filtrados = filtrados.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()),
      )
    }

    setProductosFiltrados(filtrados)
  }, [productos, categoriaSeleccionada, busqueda])

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
          <div className="flex items-center">
            <Image
              src="/images/jum-negro.jpeg"
              alt="JumTech RD"
              width={180}
              height={54}
              className="h-10 sm:h-12 w-auto object-contain [mix-blend-mode:screen]"
              priority
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
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="text-gray-300 hover:text-white mr-4" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-center mb-12">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">Tienda</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Nuestros
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
                Productos
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Encuentra los mejores productos tecnológicos con garantía y soporte técnico especializado
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categorias.map((categoria) => {
                const IconComponent = categoria.icon
                return (
                  <button
                    key={categoria.id}
                    onClick={() => setCategoriaSeleccionada(categoria.id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      categoriaSeleccionada === categoria.id
                        ? "bg-red-600 text-white"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {categoria.nombre}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Products Grid */}
          {productosFiltrados.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No hay productos disponibles</h3>
                <p className="text-gray-400 mb-6">
                  {busqueda || categoriaSeleccionada !== "todos"
                    ? "No se encontraron productos con los filtros aplicados"
                    : "El administrador aún no ha cargado productos"}
                </p>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/#contacto">Contactar para más información</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosFiltrados.map((producto) => (
                <Card
                  key={producto.id}
                  className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10"
                >
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={producto.imagen || "/placeholder.svg"}
                      alt={producto.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {producto.stock <= 3 && (
                      <Badge className="absolute top-2 right-2 bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                        Pocas unidades
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white text-lg leading-tight">{producto.nombre}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(producto.rating) ? "text-yellow-400 fill-current" : "text-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">({producto.rating})</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-3 text-sm line-clamp-2">{producto.descripcion}</p>
                    <div className="mb-3">
                      <p className="text-sm text-gray-400 mb-1">Especificaciones:</p>
                      <div className="flex flex-wrap gap-1">
                        {producto.especificaciones.slice(0, 2).map((spec, index) => (
                          <Badge key={index} className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {producto.especificaciones.length > 2 && (
                          <Badge className="bg-gray-600/20 text-gray-400 border-gray-600/30 text-xs">
                            +{producto.especificaciones.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-red-400">${producto.precio.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">Stock: {producto.stock}</span>
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
                      <Link href={`/productos/${producto.id}`}>Consultar Especificaciones</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
