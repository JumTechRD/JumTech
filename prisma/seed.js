const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.quoteRequest.deleteMany({})
  await prisma.service.deleteMany({})
  await prisma.user.deleteMany({})

  // Create services
  const ciberseguridad = await prisma.service.create({
    data: {
      title: 'Ciberseguridad',
      description:
        'Protección avanzada contra amenazas cibernéticas y vulnerabilidades de seguridad',
      image: null,
    },
  })

  const redes = await prisma.service.create({
    data: {
      title: 'Redes',
      description:
        'Diseño, implementación y mantenimiento de infraestructura de redes profesionales',
      image: null,
    },
  })

  const desarrollo = await prisma.service.create({
    data: {
      title: 'Desarrollo',
      description:
        'Desarrollo de software personalizado y soluciones tecnológicas a medida',
      image: null,
    },
  })

  const camaras = await prisma.service.create({
    data: {
      title: 'Cámaras',
      description:
        'Instalación y configuración de sistemas de vigilancia de alta tecnología',
      image: null,
    },
  })

  console.log('Seeded services:')
  console.log({ ciberseguridad, redes, desarrollo, camaras })
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
