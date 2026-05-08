"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Database, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { saveAdminInvoice, saveAdminProduct, saveAdminQuote } from "@/lib/admin-api-client"

export default function LoadDataPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadSampleData = async () => {
    setIsLoading(true)
    
    // Productos de ejemplo con datos completos
    const productosEjemplo = [
      {
        id: "1",
        nombre: "Laptop Dell Inspiron 15 3000",
        descripcion: "Laptop para uso profesional y personal con excelente rendimiento y durabilidad",
        precio: 45000,
        categoria: "laptops",
        imagen: "/placeholder.svg?height=300&width=300&text=Dell+Inspiron+15",
        stock: 8,
        rating: 4.5,
        especificaciones: ["Intel Core i5-1135G7", "8GB RAM DDR4", "256GB SSD", "15.6 pulgadas Full HD", "Windows 11 Home"],
        activo: true,
        fechaCreacion: "2024-01-15T10:30:00.000Z",
        fechaActualizacion: "2024-01-20T14:22:00.000Z",
        precioCompra: 35000,
        margenGanancia: 28.6,
        proveedor: "Dell Technologies",
        sku: "DELL-INS15-001",
        peso: 1.8,
        dimensiones: { largo: 35.8, ancho: 24.2, alto: 1.9 },
        garantia: 12,
        ubicacion: "Almacén A - Estante 1",
        stockMinimo: 3,
        stockMaximo: 15,
        vendido: 12,
        ultimaVenta: "2024-01-18T16:45:00.000Z"
      },
      {
        id: "2",
        nombre: "Monitor Samsung 24\" Full HD",
        descripcion: "Monitor Full HD para oficina con excelente calidad de imagen y diseño moderno",
        precio: 12000,
        categoria: "monitores",
        imagen: "/placeholder.svg?height=300&width=300&text=Samsung+24+Monitor",
        stock: 15,
        rating: 4.3,
        especificaciones: ["24 pulgadas", "Full HD 1920x1080", "Panel IPS", "Puerto HDMI", "Puerto VGA", "60Hz"],
        activo: true,
        fechaCreacion: "2024-01-10T09:15:00.000Z",
        fechaActualizacion: "2024-01-25T11:30:00.000Z",
        precioCompra: 9000,
        margenGanancia: 33.3,
        proveedor: "Samsung Electronics",
        sku: "SAM-MON24-001",
        peso: 3.2,
        dimensiones: { largo: 55.2, ancho: 32.7, alto: 4.2 },
        garantia: 24,
        ubicacion: "Almacén A - Estante 2",
        stockMinimo: 5,
        stockMaximo: 25,
        vendido: 8,
        ultimaVenta: "2024-01-22T10:15:00.000Z"
      },
      {
        id: "3",
        nombre: "iPhone 15 Pro 128GB",
        descripcion: "Último modelo de Apple con tecnología avanzada y cámara profesional",
        precio: 85000,
        categoria: "celulares",
        imagen: "/placeholder.svg?height=300&width=300&text=iPhone+15+Pro",
        stock: 5,
        rating: 4.8,
        especificaciones: ["128GB", "Cámara 48MP", "5G", "iOS 17", "A17 Pro Chip", "Titanio"],
        activo: true,
        fechaCreacion: "2024-01-05T08:00:00.000Z",
        fechaActualizacion: "2024-01-28T15:20:00.000Z",
        precioCompra: 75000,
        margenGanancia: 13.3,
        proveedor: "Apple Inc.",
        sku: "APP-IPH15P-001",
        peso: 0.187,
        dimensiones: { largo: 14.8, ancho: 7.2, alto: 0.8 },
        garantia: 12,
        ubicacion: "Almacén B - Estante 1",
        stockMinimo: 2,
        stockMaximo: 8,
        vendido: 18,
        ultimaVenta: "2024-01-26T12:30:00.000Z"
      },
      {
        id: "4",
        nombre: "Cámara IP Hikvision 4K",
        descripcion: "Cámara de seguridad 4K con visión nocturna y resistencia al agua",
        precio: 8500,
        categoria: "camaras",
        imagen: "/placeholder.svg?height=300&width=300&text=Hikvision+4K+Camera",
        stock: 20,
        rating: 4.6,
        especificaciones: ["4K Ultra HD", "Visión nocturna", "IP67", "PoE", "Ángulo 90°", "Audio bidireccional"],
        activo: true,
        fechaCreacion: "2024-01-08T14:45:00.000Z",
        fechaActualizacion: "2024-01-30T09:10:00.000Z",
        precioCompra: 6000,
        margenGanancia: 41.7,
        proveedor: "Hikvision",
        sku: "HIK-CAM4K-001",
        peso: 0.8,
        dimensiones: { largo: 12.0, ancho: 8.0, alto: 6.0 },
        garantia: 24,
        ubicacion: "Almacén A - Estante 3",
        stockMinimo: 8,
        stockMaximo: 30,
        vendido: 15,
        ultimaVenta: "2024-01-29T14:20:00.000Z"
      },
      {
        id: "5",
        nombre: "Tablet iPad Air 10.9\" 64GB",
        descripcion: "Tablet de Apple con pantalla Liquid Retina y chip M1 para máximo rendimiento",
        precio: 35000,
        categoria: "tablets",
        imagen: "/placeholder.svg?height=300&width=300&text=iPad+Air+10.9",
        stock: 6,
        rating: 4.7,
        especificaciones: ["10.9 pulgadas", "64GB", "Chip M1", "WiFi", "Touch ID", "iPadOS 15"],
        activo: true,
        fechaCreacion: "2024-01-12T11:20:00.000Z",
        fechaActualizacion: "2024-01-27T16:45:00.000Z",
        precioCompra: 30000,
        margenGanancia: 16.7,
        proveedor: "Apple Inc.",
        sku: "APP-IPAD-AIR-001",
        peso: 0.461,
        dimensiones: { largo: 24.8, ancho: 17.8, alto: 0.6 },
        garantia: 12,
        ubicacion: "Almacén B - Estante 2",
        stockMinimo: 2,
        stockMaximo: 10,
        vendido: 9,
        ultimaVenta: "2024-01-25T11:15:00.000Z"
      },
      {
        id: "6",
        nombre: "Disco Duro SSD 1TB Samsung",
        descripcion: "Disco duro sólido de alta velocidad para mejorar el rendimiento de tu computadora",
        precio: 4500,
        categoria: "discos",
        imagen: "/placeholder.svg?height=300&width=300&text=Samsung+SSD+1TB",
        stock: 25,
        rating: 4.4,
        especificaciones: ["1TB", "SATA III", "Velocidad 560MB/s", "2.5 pulgadas", "Samsung V-NAND"],
        activo: true,
        fechaCreacion: "2024-01-03T13:30:00.000Z",
        fechaActualizacion: "2024-01-31T10:25:00.000Z",
        precioCompra: 3500,
        margenGanancia: 28.6,
        proveedor: "Samsung Electronics",
        sku: "SAM-SSD1TB-001",
        peso: 0.05,
        dimensiones: { largo: 10.0, ancho: 7.0, alto: 0.7 },
        garantia: 36,
        ubicacion: "Almacén A - Estante 4",
        stockMinimo: 10,
        stockMaximo: 40,
        vendido: 22,
        ultimaVenta: "2024-01-30T15:40:00.000Z"
      },
      {
        id: "7",
        nombre: "Memoria RAM DDR4 16GB Corsair",
        descripcion: "Memoria RAM de alta velocidad para mejorar el rendimiento de tu sistema",
        precio: 3200,
        categoria: "memorias",
        imagen: "/placeholder.svg?height=300&width=300&text=Corsair+16GB+DDR4",
        stock: 18,
        rating: 4.2,
        especificaciones: ["16GB", "DDR4-3200", "CL16", "DIMM", "1.35V", "Corsair Vengeance"],
        activo: true,
        fechaCreacion: "2024-01-07T16:15:00.000Z",
        fechaActualizacion: "2024-01-29T12:50:00.000Z",
        precioCompra: 2500,
        margenGanancia: 28.0,
        proveedor: "Corsair",
        sku: "COR-RAM16-001",
        peso: 0.03,
        dimensiones: { largo: 13.3, ancho: 3.0, alto: 0.3 },
        garantia: 24,
        ubicacion: "Almacén A - Estante 5",
        stockMinimo: 8,
        stockMaximo: 25,
        vendido: 14,
        ultimaVenta: "2024-01-28T09:30:00.000Z"
      },
      {
        id: "8",
        nombre: "Router WiFi 6 TP-Link Archer AX73",
        descripcion: "Router WiFi 6 de alta velocidad para redes domésticas y pequeñas oficinas",
        precio: 8500,
        categoria: "redes",
        imagen: "/placeholder.svg?height=300&width=300&text=TP-Link+AX73+Router",
        stock: 12,
        rating: 4.5,
        especificaciones: ["WiFi 6", "AX5400", "4 antenas", "Gigabit Ethernet", "USB 3.0", "MU-MIMO"],
        activo: true,
        fechaCreacion: "2024-01-14T10:45:00.000Z",
        fechaActualizacion: "2024-01-26T14:15:00.000Z",
        precioCompra: 6500,
        margenGanancia: 30.8,
        proveedor: "TP-Link",
        sku: "TPL-AX73-001",
        peso: 0.8,
        dimensiones: { largo: 26.0, ancho: 16.0, alto: 3.5 },
        garantia: 24,
        ubicacion: "Almacén A - Estante 6",
        stockMinimo: 5,
        stockMaximo: 20,
        vendido: 11,
        ultimaVenta: "2024-01-27T13:25:00.000Z"
      },
      {
        id: "9",
        nombre: "Teclado Mecánico Logitech MX Keys",
        descripcion: "Teclado inalámbrico ergonómico con retroiluminación y conexión multi-dispositivo",
        precio: 5500,
        categoria: "accesorios",
        imagen: "/placeholder.svg?height=300&width=300&text=Logitech+MX+Keys",
        stock: 14,
        rating: 4.6,
        especificaciones: ["Inalámbrico", "Retroiluminación", "Multi-dispositivo", "USB-C", "2 años batería", "Ergonómico"],
        activo: true,
        fechaCreacion: "2024-01-11T15:20:00.000Z",
        fechaActualizacion: "2024-01-24T11:40:00.000Z",
        precioCompra: 4200,
        margenGanancia: 31.0,
        proveedor: "Logitech",
        sku: "LOG-MXKEYS-001",
        peso: 0.81,
        dimensiones: { largo: 43.0, ancho: 12.6, alto: 2.0 },
        garantia: 24,
        ubicacion: "Almacén B - Estante 3",
        stockMinimo: 5,
        stockMaximo: 20,
        vendido: 7,
        ultimaVenta: "2024-01-23T16:10:00.000Z"
      },
      {
        id: "10",
        nombre: "Mouse Gaming Razer DeathAdder V2",
        descripcion: "Mouse gaming de alta precisión con sensor óptico de 20,000 DPI",
        precio: 2800,
        categoria: "accesorios",
        imagen: "/placeholder.svg?height=300&width=300&text=Razer+DeathAdder+V2",
        stock: 22,
        rating: 4.3,
        especificaciones: ["20,000 DPI", "Sensor óptico", "7 botones", "RGB", "Cable", "Gaming"],
        activo: true,
        fechaCreacion: "2024-01-09T12:30:00.000Z",
        fechaActualizacion: "2024-01-31T08:45:00.000Z",
        precioCompra: 2200,
        margenGanancia: 27.3,
        proveedor: "Razer",
        sku: "RAZ-DAV2-001",
        peso: 0.082,
        dimensiones: { largo: 12.7, ancho: 6.1, alto: 4.2 },
        garantia: 24,
        ubicacion: "Almacén B - Estante 4",
        stockMinimo: 8,
        stockMaximo: 30,
        vendido: 16,
        ultimaVenta: "2024-01-30T14:55:00.000Z"
      }
    ];

    // Cotizaciones de ejemplo
    const cotizacionesEjemplo = [
      {
        id: "1",
        numeroFactura: "COT-2024-001",
        cliente: "Empresa ABC SRL",
        email: "contacto@empresaabc.com",
        telefono: "+1 (809) 123-4567",
        fecha: "2024-01-15T10:30:00.000Z",
        productos: [
          {
            id: "1",
            nombre: "Laptop Dell Inspiron 15 3000",
            descripcion: "Laptop para uso profesional y personal",
            precio: 45000,
            categoria: "laptops",
            cantidad: 2,
            moneda: "RD$",
            porcentajeExtra: 0
          },
          {
            id: "2",
            nombre: "Monitor Samsung 24\" Full HD",
            descripcion: "Monitor Full HD para oficina",
            precio: 12000,
            categoria: "monitores",
            cantidad: 2,
            moneda: "RD$",
            porcentajeExtra: 0
          }
        ],
        subtotal: 114000,
        impuestos: 19440,
        total: 133440,
        estado: "aprobada",
        notas: "Cotización para equipamiento de oficina nueva",
        monedaPrincipal: "RD$",
        itbisActivo: true,
        porcentajeItbis: 17,
        tipoPago: "transferencia",
        porcentajePago: 100,
        fechaPagoPendiente: undefined,
        montoPendiente: undefined
      },
      {
        id: "2",
        numeroFactura: "COT-2024-002",
        cliente: "María González",
        email: "maria.gonzalez@email.com",
        telefono: "+1 (809) 987-6543",
        fecha: "2024-01-18T14:20:00.000Z",
        productos: [
          {
            id: "3",
            nombre: "iPhone 15 Pro 128GB",
            descripcion: "Último modelo de Apple",
            precio: 85000,
            categoria: "celulares",
            cantidad: 1,
            moneda: "RD$",
            porcentajeExtra: 0
          }
        ],
        subtotal: 85000,
        impuestos: 14450,
        total: 99450,
        estado: "pendiente",
        notas: "Cliente interesado en financiamiento",
        monedaPrincipal: "RD$",
        itbisActivo: true,
        porcentajeItbis: 17,
        tipoPago: "efectivo",
        porcentajePago: 50,
        fechaPagoPendiente: "2024-02-18T14:20:00.000Z",
        montoPendiente: 49725
      },
      {
        id: "3",
        numeroFactura: "COT-2024-003",
        cliente: "Oficina Legal Pérez & Asociados",
        email: "info@perezasociados.com",
        telefono: "+1 (809) 555-0123",
        fecha: "2024-01-20T09:15:00.000Z",
        productos: [
          {
            id: "4",
            nombre: "Cámara IP Hikvision 4K",
            descripcion: "Cámara de seguridad 4K",
            precio: 8500,
            categoria: "camaras",
            cantidad: 8,
            moneda: "RD$",
            porcentajeExtra: 0
          },
          {
            id: "8",
            nombre: "Router WiFi 6 TP-Link Archer AX73",
            descripcion: "Router WiFi 6 de alta velocidad",
            precio: 8500,
            categoria: "redes",
            cantidad: 1,
            moneda: "RD$",
            porcentajeExtra: 0
          }
        ],
        subtotal: 76500,
        impuestos: 13005,
        total: 89505,
        estado: "enviada",
        notas: "Sistema de seguridad para oficina principal",
        monedaPrincipal: "RD$",
        itbisActivo: true,
        porcentajeItbis: 17,
        tipoPago: "transferencia",
        porcentajePago: 50,
        fechaPagoPendiente: "2024-02-20T09:15:00.000Z",
        montoPendiente: 44752.5
      },
      {
        id: "4",
        numeroFactura: "COT-2024-004",
        cliente: "Carlos Rodríguez",
        email: "carlos.rodriguez@gmail.com",
        telefono: "+1 (809) 444-7890",
        fecha: "2024-01-22T16:45:00.000Z",
        productos: [
          {
            id: "5",
            nombre: "Tablet iPad Air 10.9\" 64GB",
            descripcion: "Tablet de Apple con pantalla Liquid Retina",
            precio: 35000,
            categoria: "tablets",
            cantidad: 1,
            moneda: "RD$",
            porcentajeExtra: 0
          },
          {
            id: "9",
            nombre: "Teclado Mecánico Logitech MX Keys",
            descripcion: "Teclado inalámbrico ergonómico",
            precio: 5500,
            categoria: "accesorios",
            cantidad: 1,
            moneda: "RD$",
            porcentajeExtra: 0
          }
        ],
        subtotal: 40500,
        impuestos: 6885,
        total: 47385,
        estado: "aprobada",
        notas: "Equipamiento personal para trabajo remoto",
        monedaPrincipal: "RD$",
        itbisActivo: true,
        porcentajeItbis: 17,
        tipoPago: "efectivo",
        porcentajePago: 100,
        fechaPagoPendiente: undefined,
        montoPendiente: undefined
      },
      {
        id: "5",
        numeroFactura: "COT-2024-005",
        cliente: "Tienda Tecnológica Digital",
        email: "ventas@digitalstore.com",
        telefono: "+1 (809) 333-2468",
        fecha: "2024-01-25T11:30:00.000Z",
        productos: [
          {
            id: "6",
            nombre: "Disco Duro SSD 1TB Samsung",
            descripcion: "Disco duro sólido de alta velocidad",
            precio: 4500,
            categoria: "discos",
            cantidad: 10,
            moneda: "RD$",
            porcentajeExtra: 0
          },
          {
            id: "7",
            nombre: "Memoria RAM DDR4 16GB Corsair",
            descripcion: "Memoria RAM de alta velocidad",
            precio: 3200,
            categoria: "memorias",
            cantidad: 15,
            moneda: "RD$",
            porcentajeExtra: 0
          },
          {
            id: "10",
            nombre: "Mouse Gaming Razer DeathAdder V2",
            descripcion: "Mouse gaming de alta precisión",
            precio: 2800,
            categoria: "accesorios",
            cantidad: 20,
            moneda: "RD$",
            porcentajeExtra: 0
          }
        ],
        subtotal: 131000,
        impuestos: 22270,
        total: 153270,
        estado: "rechazada",
        notas: "Precio muy alto para reventa",
        monedaPrincipal: "RD$",
        itbisActivo: true,
        porcentajeItbis: 17,
        tipoPago: "transferencia",
        porcentajePago: 100,
        fechaPagoPendiente: undefined,
        montoPendiente: undefined
      }
    ];

    // Facturas de ejemplo
    const facturasEjemplo = [
      {
        id: "1",
        numero: "FAC-2024-001",
        cliente: "Empresa ABC SRL",
        email: "contacto@empresaabc.com",
        telefono: "+1 (809) 123-4567",
        direccion: "Av. 27 de Febrero #123, Santo Domingo",
        fecha: "2024-01-16T10:30:00.000Z",
        vencimiento: "2024-02-16T10:30:00.000Z",
        productos: [
          {
            id: "1",
            nombre: "Laptop Dell Inspiron 15 3000",
            descripcion: "Laptop para uso profesional y personal",
            precio: 45000,
            categoria: "laptops",
            cantidad: 2
          },
          {
            id: "2",
            nombre: "Monitor Samsung 24\" Full HD",
            descripcion: "Monitor Full HD para oficina",
            precio: 12000,
            categoria: "monitores",
            cantidad: 2
          }
        ],
        subtotal: 114000,
        impuestos: 19440,
        total: 133440,
        estado: "pagada",
        notas: "Pago recibido por transferencia bancaria"
      },
      {
        id: "2",
        numero: "FAC-2024-002",
        cliente: "María González",
        email: "maria.gonzalez@email.com",
        telefono: "+1 (809) 987-6543",
        direccion: "Calle Principal #456, Santiago",
        fecha: "2024-01-19T14:20:00.000Z",
        vencimiento: "2024-02-19T14:20:00.000Z",
        productos: [
          {
            id: "3",
            nombre: "iPhone 15 Pro 128GB",
            descripcion: "Último modelo de Apple",
            precio: 85000,
            categoria: "celulares",
            cantidad: 1
          }
        ],
        subtotal: 85000,
        impuestos: 14450,
        total: 99450,
        estado: "pendiente",
        notas: "Pago parcial recibido, pendiente el 50% restante"
      },
      {
        id: "3",
        numero: "FAC-2024-003",
        cliente: "Oficina Legal Pérez & Asociados",
        email: "info@perezasociados.com",
        telefono: "+1 (809) 555-0123",
        direccion: "Av. Independencia #789, Santo Domingo",
        fecha: "2024-01-21T09:15:00.000Z",
        vencimiento: "2024-02-21T09:15:00.000Z",
        productos: [
          {
            id: "4",
            nombre: "Cámara IP Hikvision 4K",
            descripcion: "Cámara de seguridad 4K",
            precio: 8500,
            categoria: "camaras",
            cantidad: 8
          },
          {
            id: "8",
            nombre: "Router WiFi 6 TP-Link Archer AX73",
            descripcion: "Router WiFi 6 de alta velocidad",
            precio: 8500,
            categoria: "redes",
            cantidad: 1
          }
        ],
        subtotal: 76500,
        impuestos: 13005,
        total: 89505,
        estado: "pendiente",
        notas: "Instalación programada para la próxima semana"
      },
      {
        id: "4",
        numero: "FAC-2024-004",
        cliente: "Carlos Rodríguez",
        email: "carlos.rodriguez@gmail.com",
        telefono: "+1 (809) 444-7890",
        direccion: "Residencial Los Pinos #321, La Romana",
        fecha: "2024-01-23T16:45:00.000Z",
        vencimiento: "2024-02-23T16:45:00.000Z",
        productos: [
          {
            id: "5",
            nombre: "Tablet iPad Air 10.9\" 64GB",
            descripcion: "Tablet de Apple con pantalla Liquid Retina",
            precio: 35000,
            categoria: "tablets",
            cantidad: 1
          },
          {
            id: "9",
            nombre: "Teclado Mecánico Logitech MX Keys",
            descripcion: "Teclado inalámbrico ergonómico",
            precio: 5500,
            categoria: "accesorios",
            cantidad: 1
          }
        ],
        subtotal: 40500,
        impuestos: 6885,
        total: 47385,
        estado: "pagada",
        notas: "Pago en efectivo al momento de la entrega"
      },
      {
        id: "5",
        numero: "FAC-2024-005",
        cliente: "Tienda Tecnológica Digital",
        email: "ventas@digitalstore.com",
        telefono: "+1 (809) 333-2468",
        direccion: "Zona Industrial #654, San Pedro de Macorís",
        fecha: "2024-01-26T11:30:00.000Z",
        vencimiento: "2024-02-26T11:30:00.000Z",
        productos: [
          {
            id: "6",
            nombre: "Disco Duro SSD 1TB Samsung",
            descripcion: "Disco duro sólido de alta velocidad",
            precio: 4500,
            categoria: "discos",
            cantidad: 10
          },
          {
            id: "7",
            nombre: "Memoria RAM DDR4 16GB Corsair",
            descripcion: "Memoria RAM de alta velocidad",
            precio: 3200,
            categoria: "memorias",
            cantidad: 15
          },
          {
            id: "10",
            nombre: "Mouse Gaming Razer DeathAdder V2",
            descripcion: "Mouse gaming de alta precisión",
            precio: 2800,
            categoria: "accesorios",
            cantidad: 20
          }
        ],
        subtotal: 131000,
        impuestos: 22270,
        total: 153270,
        estado: "vencida",
        notas: "Cliente no ha respondido a recordatorios de pago"
      },
      {
        id: "6",
        numero: "FAC-2024-006",
        cliente: "Restaurante El Buen Sabor",
        email: "admin@elbuensabor.com",
        telefono: "+1 (809) 777-8888",
        direccion: "Calle del Sol #987, Puerto Plata",
        fecha: "2024-01-28T13:20:00.000Z",
        vencimiento: "2024-02-28T13:20:00.000Z",
        productos: [
          {
            id: "4",
            nombre: "Cámara IP Hikvision 4K",
            descripcion: "Cámara de seguridad 4K",
            precio: 8500,
            categoria: "camaras",
            cantidad: 4
          }
        ],
        subtotal: 34000,
        impuestos: 5780,
        total: 39780,
        estado: "pagada",
        notas: "Sistema de seguridad para restaurante"
      }
    ];

    try {
      await Promise.all(productosEjemplo.map((producto) => saveAdminProduct(producto)))
      await Promise.all(cotizacionesEjemplo.map((cotizacion) => saveAdminQuote(cotizacion)))
      await Promise.all(facturasEjemplo.map((factura) => saveAdminInvoice(factura)))

      setIsLoading(false);
      setIsLoaded(true);
    } catch (error) {
      setIsLoading(false);
      alert("No se pudieron cargar los datos. Inicia sesión como administrador e intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-sm border-gray-700/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-16 w-16 text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-white">Cargar Datos de Ejemplo</CardTitle>
          <p className="text-gray-300 mt-2">
            Este script cargará datos de ejemplo en todas las secciones administrativas para probar los reportes
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isLoaded ? (
            <div className="text-center">
              <Button
                onClick={loadSampleData}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Cargando datos...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Cargar Datos de Ejemplo
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-green-400">¡Datos Cargados Exitosamente!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white">Productos</h4>
                  <p className="text-2xl font-bold text-blue-400">10</p>
                  <p className="text-sm text-gray-400">Con datos completos</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white">Cotizaciones</h4>
                  <p className="text-2xl font-bold text-purple-400">5</p>
                  <p className="text-sm text-gray-400">Con diferentes estados</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold text-white">Facturas</h4>
                  <p className="text-2xl font-bold text-green-400">6</p>
                  <p className="text-sm text-gray-400">Con pagos variados</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-gray-300">Ahora puedes probar todas las funcionalidades:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                    Gestión de Productos
                  </Badge>
                  <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                    Cotizaciones
                  </Badge>
                  <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                    Facturas
                  </Badge>
                  <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30">
                    Reportes
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/admin/dashboard">
                    Ir al Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10">
                  <Link href="/admin/reportes">
                    Ver Reportes
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}






