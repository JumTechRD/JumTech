"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ProductoManager } from "@/components/producto-manager"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Package,
  DollarSign,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Tag,
  LogOut,
  Home,
  FileSpreadsheet,
  Settings,
  Copy,
  Archive,
  RefreshCw,
} from "lucide-react"

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
  // Nuevos campos para gestión avanzada
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
  garantia?: number // meses
  ubicacion?: string
  stockMinimo?: number
  stockMaximo?: number
  vendido?: number
  ultimaVenta?: string
}

interface Categoria {
  id: string
  nombre: string
  descripcion: string
  icono: string
  color: string
  activa: boolean
}

const categoriasPredefinidas: Categoria[] = [
  { id: "laptops", nombre: "Laptops", descripcion: "Computadoras portátiles", icono: "💻", color: "blue", activa: true },
  { id: "monitores", nombre: "Monitores", descripcion: "Pantallas y displays", icono: "🖥️", color: "green", activa: true },
  { id: "celulares", nombre: "Celulares", descripcion: "Teléfonos móviles", icono: "📱", color: "purple", activa: true },
  { id: "tablets", nombre: "Tablets", descripcion: "Tabletas digitales", icono: "📱", color: "indigo", activa: true },
  { id: "camaras", nombre: "Cámaras", descripcion: "Cámaras de seguridad", icono: "📹", color: "red", activa: true },
  { id: "discos", nombre: "Discos Duros", descripcion: "Almacenamiento", icono: "💾", color: "yellow", activa: true },
  { id: "memorias", nombre: "Memorias RAM", descripcion: "Memoria de acceso aleatorio", icono: "🧠", color: "pink", activa: true },
  { id: "redes", nombre: "Equipos de Red", descripcion: "Routers, switches, etc.", icono: "🌐", color: "cyan", activa: true },
  { id: "accesorios", nombre: "Accesorios", descripcion: "Accesorios varios", icono: "🔌", color: "gray", activa: true },
  { id: "mantenimiento", nombre: "Mantenimiento", descripcion: "Servicios de mantenimiento", icono: "🔧", color: "orange", activa: true },
  { id: "seguridad", nombre: "Seguridad", descripcion: "Sistemas de seguridad", icono: "🔒", color: "red", activa: true },
  { id: "desarrollo", nombre: "Desarrollo", descripcion: "Servicios de desarrollo", icono: "💻", color: "blue", activa: true },
  { id: "ciberseguridad", nombre: "Ciberseguridad", descripcion: "Seguridad informática", icono: "🛡️", color: "green", activa: true },
  { id: "otros", nombre: "Otros", descripcion: "Otros productos", icono: "📦", color: "gray", activa: true },
]

export default function ProductosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [productos, setProductos] = useState<Producto[]>([])
  const [showManager, setShowManager] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategoria, setFilterCategoria] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterStock, setFilterStock] = useState("todos")
  const [sortBy, setSortBy] = useState("nombre")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth !== "true") {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(true)

    // Cargar productos desde localStorage
    const productosGuardados = localStorage.getItem("productos")
    if (productosGuardados) {
      setProductos(JSON.parse(productosGuardados))
    } else {
      // Productos de ejemplo con datos mejorados
      const productosEjemplo: Producto[] = [
        {
          id: "1",
          nombre: "Laptop Dell Inspiron 15",
          descripcion: "Laptop para uso profesional y personal con excelente rendimiento",
          precio: 45000,
          categoria: "laptops",
          imagen: "/placeholder.svg?height=300&width=300&text=Dell+Laptop",
          stock: 5,
          rating: 4.5,
          especificaciones: ["Intel i5", "8GB RAM", "256GB SSD", "15.6 pulgadas"],
          activo: true,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          precioCompra: 35000,
          margenGanancia: 28.6,
          proveedor: "Dell Technologies",
          sku: "DELL-INS15-001",
          peso: 1.8,
          dimensiones: { largo: 35.8, ancho: 24.2, alto: 1.9 },
          garantia: 12,
          ubicacion: "Almacén A - Estante 1",
          stockMinimo: 2,
          stockMaximo: 10,
          vendido: 15,
          ultimaVenta: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          nombre: 'Monitor Samsung 24"',
          descripcion: "Monitor Full HD para oficina con excelente calidad de imagen",
          precio: 12000,
          categoria: "monitores",
          imagen: "/placeholder.svg?height=300&width=300&text=Samsung+Monitor",
          stock: 8,
          rating: 4.3,
          especificaciones: ["24 pulgadas", "Full HD", "IPS", "HDMI"],
          activo: true,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          precioCompra: 9000,
          margenGanancia: 33.3,
          proveedor: "Samsung Electronics",
          sku: "SAM-MON24-001",
          peso: 3.2,
          dimensiones: { largo: 55.2, ancho: 32.7, alto: 4.2 },
          garantia: 24,
          ubicacion: "Almacén A - Estante 2",
          stockMinimo: 3,
          stockMaximo: 15,
          vendido: 8,
          ultimaVenta: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          nombre: "iPhone 15",
          descripcion: "Último modelo de Apple con tecnología avanzada",
          precio: 85000,
          categoria: "celulares",
          imagen: "/placeholder.svg?height=300&width=300&text=iPhone+15",
          stock: 3,
          rating: 4.8,
          especificaciones: ["128GB", "Cámara 48MP", "5G", "iOS 17"],
          activo: true,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          precioCompra: 75000,
          margenGanancia: 13.3,
          proveedor: "Apple Inc.",
          sku: "APP-IPH15-001",
          peso: 0.171,
          dimensiones: { largo: 14.8, ancho: 7.2, alto: 0.8 },
          garantia: 12,
          ubicacion: "Almacén B - Estante 1",
          stockMinimo: 1,
          stockMaximo: 5,
          vendido: 25,
          ultimaVenta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          nombre: "Cámara IP Hikvision",
          descripcion: "Cámara de seguridad 4K con visión nocturna",
          precio: 8500,
          categoria: "camaras",
          imagen: "/placeholder.svg?height=300&width=300&text=Hikvision+Camera",
          stock: 12,
          rating: 4.6,
          especificaciones: ["4K", "Visión nocturna", "IP67", "PoE"],
          activo: true,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          precioCompra: 6000,
          margenGanancia: 41.7,
          proveedor: "Hikvision",
          sku: "HIK-CAM4K-001",
          peso: 0.8,
          dimensiones: { largo: 12.0, ancho: 8.0, alto: 6.0 },
          garantia: 24,
          ubicacion: "Almacén A - Estante 3",
          stockMinimo: 5,
          stockMaximo: 20,
          vendido: 18,
          ultimaVenta: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setProductos(productosEjemplo)
      localStorage.setItem("productos", JSON.stringify(productosEjemplo))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminUser")
    router.push("/admin/login")
  }

  const saveProductos = (nuevosProductos: Producto[]) => {
    setProductos(nuevosProductos)
    localStorage.setItem("productos", JSON.stringify(nuevosProductos))
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setShowManager(true)
  }

  const handleEditProduct = (producto: Producto) => {
    setEditingProduct(producto)
    setShowManager(true)
  }

  const handleSaveProduct = (producto: Producto) => {
    if (editingProduct) {
      // Actualizar producto existente
      const nuevosProductos = productos.map((p) => (p.id === producto.id ? producto : p))
      saveProductos(nuevosProductos)
    } else {
      // Nuevo producto
      saveProductos([...productos, producto])
    }
    setShowManager(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      const nuevosProductos = productos.filter((p) => p.id !== id)
      saveProductos(nuevosProductos)
    }
  }

  const handleToggleActive = (id: string) => {
    const nuevosProductos = productos.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
    saveProductos(nuevosProductos)
  }

  const handleDuplicateProduct = (producto: Producto) => {
    const productoDuplicado: Producto = {
      ...producto,
      id: Date.now().toString(),
      nombre: `${producto.nombre} (Copia)`,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    }
    saveProductos([...productos, productoDuplicado])
  }

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) {
      alert("Selecciona al menos un producto")
      return
    }

    switch (action) {
      case "activate":
        const productosActivados = productos.map((p) =>
          selectedProducts.includes(p.id) ? { ...p, activo: true } : p
        )
        saveProductos(productosActivados)
        break
      case "deactivate":
        const productosDesactivados = productos.map((p) =>
          selectedProducts.includes(p.id) ? { ...p, activo: false } : p
        )
        saveProductos(productosDesactivados)
        break
      case "delete":
        if (confirm(`¿Estás seguro de que quieres eliminar ${selectedProducts.length} productos?`)) {
          const productosFiltrados = productos.filter((p) => !selectedProducts.includes(p.id))
          saveProductos(productosFiltrados)
        }
        break
    }
    setSelectedProducts([])
  }

  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter((producto) => {
      const matchesSearch =
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.proveedor?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategoria = filterCategoria === "todos" || producto.categoria === filterCategoria
      
      const matchesEstado = filterEstado === "todos" || 
        (filterEstado === "activos" && producto.activo) ||
        (filterEstado === "inactivos" && !producto.activo)
      
      const matchesStock = filterStock === "todos" ||
        (filterStock === "con-stock" && producto.stock > 0) ||
        (filterStock === "sin-stock" && producto.stock === 0) ||
        (filterStock === "stock-bajo" && producto.stock <= (producto.stockMinimo || 0))

      return matchesSearch && matchesCategoria && matchesEstado && matchesStock
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "nombre":
          comparison = a.nombre.localeCompare(b.nombre)
          break
        case "precio":
          comparison = a.precio - b.precio
          break
        case "stock":
          comparison = a.stock - b.stock
          break
        case "rating":
          comparison = a.rating - b.rating
          break
        case "fecha":
          comparison = new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
          break
        case "vendido":
          comparison = (a.vendido || 0) - (b.vendido || 0)
          break
        default:
          comparison = 0
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  // Estadísticas
  const getTotalProductos = () => productos.length
  const getProductosActivos = () => productos.filter((p) => p.activo).length
  const getProductosInactivos = () => productos.filter((p) => !p.activo).length
  const getValorInventario = () => productos.reduce((sum, p) => sum + (p.precio * p.stock), 0)
  const getProductosStockBajo = () => productos.filter((p) => p.stock <= (p.stockMinimo || 0)).length
  const getProductosSinStock = () => productos.filter((p) => p.stock === 0).length
  const getTotalVendido = () => productos.reduce((sum, p) => sum + (p.vendido || 0), 0)

  const exportarProductosExcel = async () => {
    try {
      const XLSX = (await import("xlsx")).default

      const workbook = XLSX.utils.book_new()

      // Hoja principal de productos
      const productosData = [
        ["INVENTARIO DE PRODUCTOS"],
        ["Fecha de exportación", new Date().toLocaleDateString("es-DO")],
        [""],
        [
          "ID",
          "Nombre",
          "Descripción",
          "Categoría",
          "Precio (RD$)",
          "Stock",
          "SKU",
          "Proveedor",
          "Ubicación",
          "Estado",
          "Rating",
          "Vendido",
          "Fecha Creación",
        ],
        ...productos.map((p) => [
          p.id,
          p.nombre,
          p.descripcion,
          p.categoria,
          p.precio,
          p.stock,
          p.sku || "",
          p.proveedor || "",
          p.ubicacion || "",
          p.activo ? "Activo" : "Inactivo",
          p.rating,
          p.vendido || 0,
          new Date(p.fechaCreacion).toLocaleDateString("es-DO"),
        ]),
      ]

      const productosSheet = XLSX.utils.aoa_to_sheet(productosData)
      XLSX.utils.book_append_sheet(workbook, productosSheet, "Productos")

      // Hoja de estadísticas
      const estadisticasData = [
        ["ESTADÍSTICAS DE INVENTARIO"],
        ["Total de Productos", getTotalProductos()],
        ["Productos Activos", getProductosActivos()],
        ["Productos Inactivos", getProductosInactivos()],
        ["Valor del Inventario", getValorInventario()],
        ["Productos con Stock Bajo", getProductosStockBajo()],
        ["Productos sin Stock", getProductosSinStock()],
        ["Total Vendido", getTotalVendido()],
      ]

      const estadisticasSheet = XLSX.utils.aoa_to_sheet(estadisticasData)
      XLSX.utils.book_append_sheet(workbook, estadisticasSheet, "Estadísticas")

      XLSX.writeFile(workbook, `Inventario_JumTech_${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("Error exportando productos:", error)
      alert("Error al exportar los productos")
    }
  }

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
              <Badge className="ml-2 bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">Productos</Badge>
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
            <Link href="/admin/cotizaciones" className="text-gray-300 hover:text-white transition-colors">
              Cotizaciones
            </Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white transition-colors">
              Facturas
            </Link>
            <Link href="/admin/reportes" className="text-gray-300 hover:text-white transition-colors">
              Reportes
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
            <Badge className="mb-4 bg-blue-600/20 text-blue-400 border-blue-600/30">Gestión de Productos</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Inventario de Productos</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Administra tu inventario con control total de stock, precios y categorías
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Productos</p>
                    <p className="text-2xl font-bold text-white">{getTotalProductos()}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Activos</p>
                    <p className="text-2xl font-bold text-green-400">{getProductosActivos()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Inactivos</p>
                    <p className="text-2xl font-bold text-gray-400">{getProductosInactivos()}</p>
                  </div>
                  <EyeOff className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Valor Inventario</p>
                    <p className="text-2xl font-bold text-purple-400">RD$ {getValorInventario().toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Stock Bajo</p>
                    <p className="text-2xl font-bold text-orange-400">{getProductosStockBajo()}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Sin Stock</p>
                    <p className="text-2xl font-bold text-red-400">{getProductosSinStock()}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Vendido</p>
                    <p className="text-2xl font-bold text-green-400">{getTotalVendido()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, descripción, SKU o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white"
              >
                <option value="todos">Todas las categorías</option>
                {categoriasPredefinidas.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>

              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white"
              >
                <option value="todos">Todo el stock</option>
                <option value="con-stock">Con stock</option>
                <option value="sin-stock">Sin stock</option>
                <option value="stock-bajo">Stock bajo</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white"
              >
                <option value="nombre">Ordenar por</option>
                <option value="nombre">Nombre</option>
                <option value="precio">Precio</option>
                <option value="stock">Stock</option>
                <option value="rating">Rating</option>
                <option value="fecha">Fecha</option>
                <option value="vendido">Vendido</option>
              </select>

              <Button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white/10"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            {/* Vista */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "outline"}
                className={viewMode === "grid" ? "bg-blue-600" : "border-gray-600 text-gray-300"}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "outline"}
                className={viewMode === "list" ? "bg-blue-600" : "border-gray-600 text-gray-300"}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Acciones masivas */}
          {selectedProducts.length > 0 && (
            <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-300">
                  {selectedProducts.length} producto(s) seleccionado(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBulkAction("activate")}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Activar
                  </Button>
                  <Button
                    onClick={() => handleBulkAction("deactivate")}
                    size="sm"
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Desactivar
                  </Button>
                  <Button
                    onClick={() => handleBulkAction("delete")}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button onClick={handleNewProduct} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Producto
            </Button>
            <Button onClick={exportarProductosExcel} className="bg-green-600 hover:bg-green-700">
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10">
              <Upload className="h-5 w-5 mr-2" />
              Importar
            </Button>
          </div>

          {/* Lista de productos */}
          <div className="space-y-4">
            {productosFiltrados.length === 0 ? (
              <Card className="bg-white/5 border-gray-700/50">
                <CardContent className="p-8 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay productos</h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm || filterCategoria !== "todos" || filterEstado !== "todos" || filterStock !== "todos"
                      ? "No se encontraron productos con los filtros aplicados"
                      : "Comienza agregando tu primer producto"}
                  </p>
                  <Button onClick={handleNewProduct} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              productosFiltrados.map((producto) => (
                <Card
                  key={producto.id}
                  className="bg-white/5 border-gray-700/50 hover:border-blue-500/50 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Checkbox para selección masiva */}
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(producto.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, producto.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter((id) => id !== producto.id))
                          }
                        }}
                        className="mt-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />

                      {/* Imagen del producto */}
                      <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={producto.imagen || "/placeholder.svg"}
                          alt={producto.nombre}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{producto.nombre}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2">{producto.descripcion}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                producto.activo
                                  ? "bg-green-600/20 text-green-400 border-green-600/30"
                                  : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                              }
                            >
                              {producto.activo ? "Activo" : "Inactivo"}
                            </Badge>
                            {producto.stock <= (producto.stockMinimo || 0) && (
                              <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30">
                                Stock Bajo
                              </Badge>
                            )}
                            {producto.stock === 0 && (
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                                Sin Stock
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Categoría:</span>
                            <p className="text-white font-medium">
                              {categoriasPredefinidas.find((c) => c.id === producto.categoria)?.nombre || producto.categoria}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Precio:</span>
                            <p className="text-white font-medium">RD$ {producto.precio.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Stock:</span>
                            <p className="text-white font-medium">{producto.stock}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">SKU:</span>
                            <p className="text-white font-medium">{producto.sku || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Proveedor:</span>
                            <p className="text-white font-medium">{producto.proveedor || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Vendido:</span>
                            <p className="text-white font-medium">{producto.vendido || 0}</p>
                          </div>
                        </div>

                        {/* Especificaciones */}
                        {producto.especificaciones.length > 0 && (
                          <div className="mt-3">
                            <span className="text-gray-400 text-sm">Especificaciones:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {producto.especificaciones.slice(0, 3).map((spec, index) => (
                                <Badge
                                  key={index}
                                  className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs"
                                >
                                  {spec}
                                </Badge>
                              ))}
                              {producto.especificaciones.length > 3 && (
                                <Badge className="bg-gray-600/20 text-gray-400 border-gray-600/30 text-xs">
                                  +{producto.especificaciones.length - 3} más
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(producto)}
                          className="border-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(producto.id)}
                          className={
                            producto.activo
                              ? "border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                              : "border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                          }
                        >
                          {producto.activo ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                          {producto.activo ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicateProduct(producto)}
                          className="border-gray-600 text-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-600"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(producto.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
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

      {/* Modal de gestión de productos */}
      <ProductoManager
        isOpen={showManager}
        onClose={() => {
          setShowManager(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </div>
  )
}
