"use client"

import type React from "react"
import Image from "next/image"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Save, Package, DollarSign, Tag, ImageIcon, Upload, AlertCircle } from "lucide-react"

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

interface ProductoManagerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (producto: Producto) => void
  editingProduct?: Producto | null
}

const categorias = [
  { id: "laptops", nombre: "Laptops" },
  { id: "monitores", nombre: "Monitores" },
  { id: "celulares", nombre: "Celulares" },
  { id: "tablets", nombre: "Tablets" },
  { id: "camaras", nombre: "Cámaras" },
  { id: "discos", nombre: "Discos Duros" },
  { id: "memorias", nombre: "Memorias RAM" },
  { id: "redes", nombre: "Equipos de Red" },
  { id: "accesorios", nombre: "Accesorios" },
  { id: "mantenimiento", nombre: "Mantenimiento" },
  { id: "seguridad", nombre: "Seguridad" },
  { id: "desarrollo", nombre: "Desarrollo" },
  { id: "ciberseguridad", nombre: "Ciberseguridad" },
  { id: "otros", nombre: "Otros" },
]

export function ProductoManager({ isOpen, onClose, onSave, editingProduct }: ProductoManagerProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [categoria, setCategoria] = useState("")
  const [imagen, setImagen] = useState("")
  const [stock, setStock] = useState("")
  const [especificaciones, setEspecificaciones] = useState<string[]>([])
  const [nuevaEspecificacion, setNuevaEspecificacion] = useState("")
  const [activo, setActivo] = useState(true)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Nuevos estados para campos avanzados
  const [precioCompra, setPrecioCompra] = useState("")
  const [proveedor, setProveedor] = useState("")
  const [codigoBarras, setCodigoBarras] = useState("")
  const [sku, setSku] = useState("")
  const [peso, setPeso] = useState("")
  const [largo, setLargo] = useState("")
  const [ancho, setAncho] = useState("")
  const [alto, setAlto] = useState("")
  const [garantia, setGarantia] = useState("")
  const [ubicacion, setUbicacion] = useState("")
  const [stockMinimo, setStockMinimo] = useState("")
  const [stockMaximo, setStockMaximo] = useState("")

  useEffect(() => {
    if (editingProduct) {
      setNombre(editingProduct.nombre)
      setDescripcion(editingProduct.descripcion)
      setPrecio(editingProduct.precio.toString())
      setCategoria(editingProduct.categoria)
      setImagen(editingProduct.imagen)
      setStock(editingProduct.stock.toString())
      setEspecificaciones(editingProduct.especificaciones)
      setActivo(editingProduct.activo ?? true)
      
      // Nuevos campos
      setPrecioCompra(editingProduct.precioCompra?.toString() || "")
      setProveedor(editingProduct.proveedor || "")
      setCodigoBarras(editingProduct.codigoBarras || "")
      setSku(editingProduct.sku || "")
      setPeso(editingProduct.peso?.toString() || "")
      setLargo(editingProduct.dimensiones?.largo?.toString() || "")
      setAncho(editingProduct.dimensiones?.ancho?.toString() || "")
      setAlto(editingProduct.dimensiones?.alto?.toString() || "")
      setGarantia(editingProduct.garantia?.toString() || "")
      setUbicacion(editingProduct.ubicacion || "")
      setStockMinimo(editingProduct.stockMinimo?.toString() || "")
      setStockMaximo(editingProduct.stockMaximo?.toString() || "")
    } else {
      // Reset form
      setNombre("")
      setDescripcion("")
      setPrecio("")
      setCategoria("")
      setImagen("")
      setStock("")
      setEspecificaciones([])
      setNuevaEspecificacion("")
      setActivo(true)
      
      // Reset nuevos campos
      setPrecioCompra("")
      setProveedor("")
      setCodigoBarras("")
      setSku("")
      setPeso("")
      setLargo("")
      setAncho("")
      setAlto("")
      setGarantia("")
      setUbicacion("")
      setStockMinimo("")
      setStockMaximo("")
    }
    setErrors({})
  }, [editingProduct, isOpen])

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!nombre.trim()) newErrors.nombre = "El nombre es requerido"
    if (!descripcion.trim()) newErrors.descripcion = "La descripción es requerida"
    if (!precio || isNaN(Number(precio)) || Number(precio) <= 0) {
      newErrors.precio = "El precio debe ser un número mayor a 0"
    }
    if (!categoria) newErrors.categoria = "La categoría es requerida"
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = "El stock debe ser un número mayor o igual a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const agregarEspecificacion = () => {
    if (nuevaEspecificacion.trim()) {
      setEspecificaciones([...especificaciones, nuevaEspecificacion.trim()])
      setNuevaEspecificacion("")
    }
  }

  const eliminarEspecificacion = (index: number) => {
    setEspecificaciones(especificaciones.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const now = new Date().toISOString()
      const precioCompraNum = precioCompra ? Number.parseFloat(precioCompra) : undefined
      const precioNum = Number.parseFloat(precio)
      const margenGanancia = precioCompraNum ? ((precioNum - precioCompraNum) / precioCompraNum) * 100 : undefined

      const producto: Producto = {
        id: editingProduct?.id || Date.now().toString(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precioNum,
        categoria,
        imagen: imagen.trim() || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(nombre)}`,
        stock: Number.parseInt(stock),
        rating: editingProduct?.rating || 4.0,
        especificaciones,
        activo,
        fechaCreacion: editingProduct?.fechaCreacion || now,
        fechaActualizacion: now,
        
        // Nuevos campos
        precioCompra: precioCompraNum,
        margenGanancia,
        proveedor: proveedor.trim() || undefined,
        codigoBarras: codigoBarras.trim() || undefined,
        sku: sku.trim() || undefined,
        peso: peso ? Number.parseFloat(peso) : undefined,
        dimensiones: largo && ancho && alto ? {
          largo: Number.parseFloat(largo),
          ancho: Number.parseFloat(ancho),
          alto: Number.parseFloat(alto)
        } : undefined,
        garantia: garantia ? Number.parseInt(garantia) : undefined,
        ubicacion: ubicacion.trim() || undefined,
        stockMinimo: stockMinimo ? Number.parseInt(stockMinimo) : undefined,
        stockMaximo: stockMaximo ? Number.parseInt(stockMaximo) : undefined,
        vendido: editingProduct?.vendido || 0,
        ultimaVenta: editingProduct?.ultimaVenta,
      }

      // Simular delay de guardado
      await new Promise((resolve) => setTimeout(resolve, 500))

      onSave(producto)

      // Mostrar mensaje de éxito
      alert(editingProduct ? "Producto actualizado exitosamente" : "Producto creado exitosamente")
    } catch (error) {
      alert("Error al guardar el producto. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // En un caso real, aquí subirías la imagen a un servidor
      // Por ahora, usaremos un placeholder
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagen(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="text-center">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </Badge>
            <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-2">Gestión de Productos</CardTitle>
            <p className="text-gray-300">
              {editingProduct ? "Actualiza la información del producto" : "Completa la información del nuevo producto"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Estado del Producto */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              Estado del Producto
            </h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <span className="text-gray-300">Producto activo (visible para el público)</span>
              </label>
            </div>
            <p className="text-sm text-gray-400 mt-2">Los productos inactivos no aparecerán en la tienda pública</p>
          </div>

          {/* Información Básica */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-red-400" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Producto *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.nombre ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Ej: Laptop Dell Inspiron 15"
                  disabled={isLoading}
                />
                {errors.nombre && <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoría *</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-800/90 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 [&>option]:bg-slate-800 [&>option]:text-white ${
                    errors.categoria ? "border-red-500" : "border-gray-600"
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoria && <p className="text-red-400 text-sm mt-1">{errors.categoria}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción *</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                  errors.descripcion ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Descripción detallada del producto..."
                disabled={isLoading}
              />
              {errors.descripcion && <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>}
            </div>
          </div>

          {/* Precio y Stock */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-red-400" />
              Precio y Stock
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Precio (RD$) *</label>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.precio ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                {errors.precio && <p className="text-red-400 text-sm mt-1">{errors.precio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Disponible *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.stock ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                />
                {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock}</p>}
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-red-400" />
              Imagen del Producto
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL de la Imagen</label>
                <input
                  type="url"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={isLoading}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">O sube una imagen desde tu computadora</p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
              {imagen && (
                <div className="mt-4">
                  <p className="text-sm text-gray-300 mb-2">Vista previa:</p>
                  <div className="w-32 h-32 mx-auto bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={imagen || "/placeholder.svg"}
                      alt="Vista previa"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `/placeholder.svg?height=128&width=128&text=Error`
                      }}
                    />
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-400">Si no proporcionas una imagen, se generará una automáticamente</p>
            </div>
          </div>

          {/* Especificaciones */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-red-400" />
              Especificaciones Técnicas
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={nuevaEspecificacion}
                onChange={(e) => setNuevaEspecificacion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && agregarEspecificacion()}
                className="flex-1 px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Intel i5, 8GB RAM, etc."
                disabled={isLoading}
              />
              <Button
                onClick={agregarEspecificacion}
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading || !nuevaEspecificacion.trim()}
              >
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {especificaciones.map((spec, index) => (
                <Badge
                  key={index}
                  className="bg-blue-600/20 text-blue-400 border-blue-600/30 cursor-pointer hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30 transition-colors"
                  onClick={() => !isLoading && eliminarEspecificacion(index)}
                >
                  {spec} ×
                </Badge>
              ))}
            </div>
            {especificaciones.length === 0 && (
              <p className="text-gray-400 text-sm">No hay especificaciones agregadas</p>
            )}
          </div>

          {/* Información Comercial */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-red-400" />
              Información Comercial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Precio de Compra (RD$)</label>
                <input
                  type="number"
                  value={precioCompra}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">Precio al que compraste el producto</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Proveedor</label>
                <input
                  type="text"
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nombre del proveedor"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Código SKU único"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Código de Barras</label>
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Código de barras"
                  disabled={isLoading}
                />
              </div>
            </div>
            {precioCompra && precio && (
              <div className="mt-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Margen de Ganancia:</strong> {((Number.parseFloat(precio) - Number.parseFloat(precioCompra)) / Number.parseFloat(precioCompra) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Información Física */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-red-400" />
              Información Física
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Peso (kg)</label>
                <input
                  type="number"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Garantía (meses)</label>
                <input
                  type="number"
                  value={garantia}
                  onChange={(e) => setGarantia(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="12"
                  min="0"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Dimensiones (cm)</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Largo</label>
                  <input
                    type="number"
                    value={largo}
                    onChange={(e) => setLargo(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ancho</label>
                  <input
                    type="number"
                    value={ancho}
                    onChange={(e) => setAncho(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Alto</label>
                  <input
                    type="number"
                    value={alto}
                    onChange={(e) => setAlto(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de Inventario */}
          <div className="bg-white/5 rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              Gestión de Inventario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Mínimo</label>
                <input
                  type="number"
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">Alerta cuando el stock esté por debajo</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Máximo</label>
                <input
                  type="number"
                  value={stockMaximo}
                  onChange={(e) => setStockMaximo(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">Capacidad máxima de almacenamiento</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ubicación en Almacén</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ej: Almacén A - Estante 1"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10 bg-transparent"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading || !nombre || !descripcion || !precio || !categoria || !stock}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? "Actualizar" : "Guardar"} Producto
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
