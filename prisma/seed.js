const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.$executeRaw`DELETE FROM "AdminQuoteItem"`
  await prisma.$executeRaw`DELETE FROM "AdminQuote"`
  await prisma.$executeRaw`DELETE FROM "InvoiceItem"`
  await prisma.$executeRaw`DELETE FROM "Invoice"`
  await prisma.$executeRaw`DELETE FROM "Product"`
  await prisma.quoteRequest.deleteMany({})
  await prisma.service.deleteMany({})
  await prisma.user.deleteMany({})

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        title: 'Mantenimiento de Computadoras',
        description: 'Mantenimiento preventivo y correctivo de equipos de cómputo',
        image: null,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Instalación de Cámaras NVR',
        description: 'Instalación y configuración de sistemas de vigilancia de alta tecnología',
        image: null,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Cableado Estructurado',
        description: 'Diseño e instalación de cableado certificado para redes empresariales',
        image: null,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Desarrollo de Aplicaciones',
        description: 'Desarrollo de software personalizado y soluciones tecnológicas a medida',
        image: null,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Gestión de Redes',
        description: 'Diseño, implementación y mantenimiento de infraestructura de redes profesionales',
        image: null,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Ciberseguridad',
        description: 'Protección avanzada contra amenazas cibernéticas y vulnerabilidades de seguridad',
        image: null,
      },
    }),
  ])

  const now = new Date()
  const products = [
    {
      nombre: 'Laptop Dell Inspiron 15',
      descripcion: 'Laptop para uso profesional y personal con excelente rendimiento',
      precio: 45000,
      categoria: 'laptops',
      imagen: '/placeholder.svg?height=300&width=300&text=Dell+Laptop',
      stock: 5,
      rating: 4.5,
      especificaciones: ['Intel i5', '8GB RAM', '256GB SSD', '15.6 pulgadas'],
      precioCompra: 35000,
      margenGanancia: 28.6,
      proveedor: 'Dell Technologies',
      sku: 'DELL-INS15-001',
      peso: 1.8,
      dimensiones: { largo: 35.8, ancho: 24.2, alto: 1.9 },
      garantia: 12,
      ubicacion: 'Almacén A - Estante 1',
      stockMinimo: 2,
      stockMaximo: 10,
      vendido: 15,
      ultimaVenta: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      nombre: 'Monitor Samsung 24"',
      descripcion: 'Monitor Full HD para oficina con excelente calidad de imagen',
      precio: 12000,
      categoria: 'monitores',
      imagen: '/placeholder.svg?height=300&width=300&text=Samsung+Monitor',
      stock: 8,
      rating: 4.3,
      especificaciones: ['24 pulgadas', 'Full HD', 'IPS', 'HDMI'],
      precioCompra: 9000,
      margenGanancia: 33.3,
      proveedor: 'Samsung Electronics',
      sku: 'SAM-MON24-001',
      peso: 3.2,
      dimensiones: { largo: 55.2, ancho: 32.7, alto: 4.2 },
      garantia: 24,
      ubicacion: 'Almacén A - Estante 2',
      stockMinimo: 3,
      stockMaximo: 15,
      vendido: 8,
      ultimaVenta: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      nombre: 'iPhone 15',
      descripcion: 'Último modelo de Apple con tecnología avanzada',
      precio: 85000,
      categoria: 'celulares',
      imagen: '/placeholder.svg?height=300&width=300&text=iPhone+15',
      stock: 3,
      rating: 4.8,
      especificaciones: ['128GB', 'Cámara 48MP', '5G', 'iOS 17'],
      precioCompra: 75000,
      margenGanancia: 13.3,
      proveedor: 'Apple Inc.',
      sku: 'APP-IPH15-001',
      peso: 0.171,
      dimensiones: { largo: 14.8, ancho: 7.2, alto: 0.8 },
      garantia: 12,
      ubicacion: 'Almacén B - Estante 1',
      stockMinimo: 1,
      stockMaximo: 5,
      vendido: 25,
      ultimaVenta: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      nombre: 'Cámara IP Hikvision',
      descripcion: 'Cámara de seguridad 4K con visión nocturna',
      precio: 8500,
      categoria: 'camaras',
      imagen: '/placeholder.svg?height=300&width=300&text=Hikvision+Camera',
      stock: 12,
      rating: 4.6,
      especificaciones: ['4K', 'Visión nocturna', 'IP67', 'PoE'],
      precioCompra: 6000,
      margenGanancia: 41.7,
      proveedor: 'Hikvision',
      sku: 'HIK-CAM4K-001',
      peso: 0.8,
      dimensiones: { largo: 12.0, ancho: 8.0, alto: 6.0 },
      garantia: 24,
      ubicacion: 'Almacén A - Estante 3',
      stockMinimo: 5,
      stockMaximo: 20,
      vendido: 18,
      ultimaVenta: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const product of products) {
    await prisma.$executeRaw`
      INSERT INTO "Product" (
        "id", "nombre", "descripcion", "precio", "categoria", "imagen", "stock", "rating",
        "especificaciones", "activo", "fechaCreacion", "fechaActualizacion", "precioCompra",
        "margenGanancia", "proveedor", "sku", "peso", "dimensiones", "garantia", "ubicacion",
        "stockMinimo", "stockMaximo", "vendido", "ultimaVenta"
      )
      VALUES (
        ${randomUUID()}, ${product.nombre}, ${product.descripcion}, ${product.precio}, ${product.categoria},
        ${product.imagen}, ${product.stock}, ${product.rating}, ${product.especificaciones}, true,
        ${now}, ${now}, ${product.precioCompra}, ${product.margenGanancia}, ${product.proveedor},
        ${product.sku}, ${product.peso}, ${JSON.stringify(product.dimensiones)}::jsonb, ${product.garantia},
        ${product.ubicacion}, ${product.stockMinimo}, ${product.stockMaximo}, ${product.vendido}, ${product.ultimaVenta}
      )
    `
  }

  console.log('Seeded services:')
  console.log(services)
  console.log(`Seeded products: ${products.length}`)
  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
