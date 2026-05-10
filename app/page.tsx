"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Monitor,
  Camera,
  Network,
  Code,
  Router,
  Shield,
  Mail,
  Phone,
  Instagram,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { CotizacionForm } from "@/components/cotizacion-form"
import { Logo } from "@/components/logo"

const services = [
  {
    title: "Mantenimiento de Computadoras",
    description: "Limpieza, optimización y reparación de equipos",
    image: "/images/mantenimiento-computadoras.webp",
    icon: Monitor,
  },
  {
    title: "Instalación de Cámaras NVR",
    description: "Sistemas de vigilancia y seguridad IP",
    image: "/images/camaras-nvr.jpeg",
    icon: Camera,
  },
  {
    title: "Cableado Estructurado",
    description: "Diseño e instalación de redes",
    image: "/images/cableado-estructurado.jpeg",
    icon: Network,
  },
  {
    title: "Desarrollo de Aplicaciones",
    description: "Software personalizado y sistemas ERP",
    image: "/images/desarrollo-aplicaciones.jpeg",
    icon: Code,
  },
  {
    title: "Gestión de Redes",
    description: "Administración y optimización de redes",
    image: "/images/gestion-redes.jpeg",
    icon: Router,
  },
  {
    title: "Ciberseguridad",
    description: "Protección y auditorías de seguridad",
    image: "/images/ciberseguridad.jpeg",
    icon: Shield,
  },
]

function ServicesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const cloneCount = itemsPerView
  const carouselSlides = [
    ...services.slice(-cloneCount),
    ...services,
    ...services.slice(0, cloneCount),
  ]
  const startIndex = cloneCount
  const endIndex = startIndex + services.length - 1

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3)
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    updateItemsPerView()
    window.addEventListener("resize", updateItemsPerView)
    return () => window.removeEventListener("resize", updateItemsPerView)
  }, [])

  useEffect(() => {
    setIsTransitioning(false)
    setCurrentIndex(startIndex)
    const timeout = window.setTimeout(() => {
      setIsTransitioning(true)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [startIndex, itemsPerView])

  const nextSlide = () => {
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev + 1)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev - 1)
  }

  // Handle infinite loop reset
  useEffect(() => {
    if (currentIndex > endIndex) {
      const timeout = window.setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(startIndex)
      }, 500)
      return () => window.clearTimeout(timeout)
    }

    if (currentIndex < startIndex) {
      const timeout = window.setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(endIndex)
      }, 500)
      return () => window.clearTimeout(timeout)
    }
  }, [currentIndex, startIndex, endIndex])

  // Re-enable transition after instant jump
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = window.setTimeout(() => {
        setIsTransitioning(true)
      }, 50)
      return () => window.clearTimeout(timeout)
    }
  }, [isTransitioning])

  // Auto-play carousel
  useEffect(() => {
    const interval = window.setInterval(() => {
      nextSlide()
    }, 4000)

    return () => window.clearInterval(interval)
  }, [])

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setCurrentIndex(startIndex + index)
  }

  // Calculate the real index for dots
  const realIndex = ((currentIndex - startIndex) % services.length + services.length) % services.length

  return (
    <div className="relative px-2 sm:px-0">
      <div className="overflow-hidden rounded-2xl">
        <div
          ref={containerRef}
          className={`flex ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
          }}
        >
          {carouselSlides.map((service, index) => {
            const IconComponent = service.icon
            return (
              <div
                key={`${service.title}-${index}`}
                className="flex-shrink-0"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10 mx-1 sm:mx-2 h-full">
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 6}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="p-2 bg-red-600/20 rounded-lg backdrop-blur-sm">
                        <IconComponent className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base sm:text-lg lg:text-xl leading-tight">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base lg:text-base line-clamp-2 lg:line-clamp-3">
                      {service.description}
                    </p>
                    <Button
                      size="sm"
                      className="bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300 w-full lg:w-auto"
                      asChild
                    >
                      <Link href="/servicios">Ver mas detalles</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-1 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-1.5 sm:p-2 lg:p-3 rounded-full hover:bg-black/80 transition-colors z-10 shadow-lg"
      >
        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-1 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-1.5 sm:p-2 lg:p-3 rounded-full hover:bg-black/80 transition-colors z-10 shadow-lg"
      >
        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 sm:mt-6 gap-1.5 sm:gap-2">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-colors ${
              index === realIndex ? "bg-red-500" : "bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCotizacionFormOpen, setIsCotizacionFormOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const [swipeProgress, setSwipeProgress] = useState(0)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const openCotizacionForm = () => {
    setIsCotizacionFormOpen(true)
  }

  const closeCotizacionForm = () => {
    setIsCotizacionFormOpen(false)
  }

  // Handle touch events for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchEndX.current - touchStartX.current
    const isLeftSwipe = distance < -50 // Swipe left more than 50px

    if (isLeftSwipe && isMobileMenuOpen) {
      closeMobileMenu()
    }

    // Reset values
    touchStartX.current = null
    touchEndX.current = null
  }

  const handleAdvancedTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return

    const currentX = e.touches[0].clientX
    touchEndX.current = currentX

    // Calculate swipe progress (0 to 100)
    const distance = touchStartX.current - currentX
    if (distance > 0) {
      const progress = Math.min(100, (distance / 100) * 100)
      setSwipeProgress(progress)
    }
  }

  const handleAdvancedTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50 // Swipe left more than 50px

    if (isLeftSwipe && isMobileMenuOpen) {
      closeMobileMenu()
    }

    // Reset values
    touchStartX.current = null
    touchEndX.current = null
    setSwipeProgress(0)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        closeMobileMenu()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-x-hidden pt-[80px]">
      {/* Enhanced Background blur effects with red gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large red gradient blurs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-600/30 via-red-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-60 w-[500px] h-[500px] bg-gradient-to-tr from-red-500/25 via-red-400/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-tl from-red-400/20 via-red-300/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-tr from-red-600/15 via-red-500/10 to-transparent rounded-full blur-3xl"></div>

        {/* Additional smaller red accents */}
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-bl from-red-500/15 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-3/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-red-400/20 to-transparent rounded-full blur-2xl"></div>

        {/* Subtle gray accents */}
        <div className="absolute top-1/3 right-1/2 w-48 h-48 bg-gray-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-gray-500/8 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-[9999] isolate">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.09]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 95%)",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(227,29,52,0.14),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(227,29,52,0.08),transparent_20%),linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.06)_50%,transparent_65%)]" />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 140" fill="none" aria-hidden="true">
              <path d="M0 92C160 64 250 64 388 88C515 110 650 116 790 90C940 62 1060 58 1200 84C1310 104 1378 106 1440 96" stroke="rgba(227,29,52,0.55)" strokeWidth="1.1" strokeLinecap="round" />
              <path d="M0 50C140 34 260 36 384 54C520 76 668 76 816 52C950 32 1080 30 1216 50C1308 63 1380 64 1440 56" stroke="rgba(148,163,184,0.28)" strokeWidth="0.9" strokeDasharray="7 10" />
            </svg>
          </div>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(227,29,52,0.08),transparent_42%)]" />
          <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <Image
              src="/images/logo-nuevo.png"
              alt="JumTech RD"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
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
            <Link href="/productos" className="text-gray-300 hover:text-white transition-colors">
              Productos
            </Link>
            <Link href="/nosotros" className="text-gray-300 hover:text-white transition-colors">
              Nosotros
            </Link>
            <Link href="#contacto" className="text-gray-300 hover:text-white transition-colors">
              Contacto
            </Link>
            <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25" onClick={openCotizacionForm}>
              Cotizar Proyecto
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        </div>

        {/* Mobile Navigation Menu with Swipe Gesture */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleAdvancedTouchMove}
          onTouchEnd={handleAdvancedTouchEnd}
        >
          <div className="px-4 py-4 bg-black/90 backdrop-blur-xl border-t border-gray-800/50 relative">
            {/* Swipe indicator */}
            {isMobileMenuOpen && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                <div
                  className="h-full bg-red-500 transition-all duration-150"
                  style={{ width: `${swipeProgress}%` }}
                ></div>
              </div>
            )}

            {/* Swipe hint animation */}
            {isMobileMenuOpen && (
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 text-sm flex items-center opacity-50">
                <span className="mr-1">Desliza</span>
                <div className="animate-pulse">
                  <ChevronLeft className="h-4 w-4" />
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={closeMobileMenu}
              >
                Inicio
              </Link>
              <Link
                href="/servicios"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={closeMobileMenu}
              >
                Servicios
              </Link>
              <Link
                href="/productos"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={closeMobileMenu}
              >
                Productos
              </Link>
              <Link
                href="/nosotros"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={closeMobileMenu}
              >
                Nosotros
              </Link>
              <Link
                href="#contacto"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={closeMobileMenu}
              >
                Contacto
              </Link>
              <Button
                className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 w-full"
                onClick={() => {
                  closeMobileMenu()
                  openCotizacionForm()
                }}
              >
                Cotizar Proyecto
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl w-40 h-40 mx-auto"></div>
            <div className="mx-auto mb-6 relative z-10 bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/10">
              <Logo size="xl" className="justify-center" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent">
              Soluciones tecnológicas que conectan
            </span>
          </h1>
          <p className="text-base sm:text-xl mb-8 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
            <span className="text-red-400 font-semibold">Protegen</span>{" "}
            <span className="text-gray-300">
              y transforman tu mundo digital, con la confianza y calidad que nos distingue en
            </span>{" "}
            <span className="text-red-400 font-semibold">JumTechRD</span>
            <span className="text-gray-300">.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-base sm:w-auto sm:text-lg sm:px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
              asChild
            >
              <Link href="/servicios">
                Ver Servicios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="w-full bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300 text-base sm:w-auto sm:text-lg sm:px-8 py-3"
              asChild
            >
              <Link href="/productos">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ver Productos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Carousel Section */}
      <section id="servicios" className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">
              Nuestros Servicios
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Servicios Especializados</h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Ofrecemos soluciones tecnológicas integrales para impulsar tu negocio
            </p>
          </div>

          <ServicesCarousel />

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-base sm:w-auto sm:text-lg sm:px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
              asChild
            >
              <Link href="/servicios">
                Ver Todos los Servicios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 px-4 bg-black/10 backdrop-blur-sm relative z-10 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">
                Sobre Nosotros
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Expertos en Tecnología</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed max-w-3xl mx-auto lg:mx-0">
                En JumTechRD somos especialistas en soluciones tecnológicas integrales diseñadas para impulsar la
                eficiencia de tu empresa y mejorar la conectividad en el hogar. Nuestro compromiso es ofrecer servicios
                confiables, innovadores y adaptados a las necesidades actuales del mercado dominicano.
              </p>
              <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0">
                Nuestro equipo de profesionales altamente capacitados se dedica a ofrecer servicios de calidad,
                garantizando la satisfacción total de nuestros clientes y el éxito de sus proyectos tecnológicos.
              </p>
              <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25" asChild>
                <Link href="/nosotros">
                  Conocer Más
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative hidden lg:block min-h-[520px] animate-[floatSoft_9s_ease-in-out_infinite] motion-reduce:animate-none">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/8 via-slate-900/70 to-black/90 border border-white/10 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.85)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,29,52,0.18),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_32%)] animate-[glowBreathe_7s_ease-in-out_infinite] motion-reduce:animate-none" />
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                <div className="absolute inset-x-8 top-8 flex items-center justify-between">
                  <div className="rounded-2xl border border-red-500/20 bg-black/30 px-4 py-3 backdrop-blur-md shadow-[0_0_35px_rgba(227,29,52,0.12)] animate-[floatSlow_7s_ease-in-out_infinite]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-red-300/80">Infraestructura</p>
                    <p className="text-sm font-semibold text-white mt-1">Red corporativa activa</p>
                  </div>
                  <div className="rounded-2xl border border-slate-500/20 bg-slate-950/45 px-4 py-3 backdrop-blur-md animate-[floatSlow_9s_ease-in-out_infinite]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300/70">Soporte IT</p>
                    <p className="text-sm font-semibold text-white mt-1">24/7 monitoreo</p>
                  </div>
                </div>

                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 520" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="techLine" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(227,29,52,0.15)" />
                      <stop offset="50%" stopColor="rgba(227,29,52,0.72)" />
                      <stop offset="100%" stopColor="rgba(148,163,184,0.35)" />
                    </linearGradient>
                    <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path d="M120 150C220 110 300 110 380 160C455 207 507 200 560 145" stroke="url(#techLine)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M100 300C180 255 250 245 320 285C390 325 470 330 548 284" stroke="rgba(148,163,184,0.22)" strokeWidth="1.8" strokeDasharray="5 8" />
                  <path d="M160 410C240 360 315 350 390 388C446 417 500 422 570 392" stroke="rgba(227,29,52,0.35)" strokeWidth="2" strokeLinecap="round" />

                  {[
                    [112, 148],
                    [206, 124],
                    [310, 132],
                    [416, 172],
                    [520, 156],
                    [172, 300],
                    [280, 274],
                    [388, 302],
                    [500, 286],
                    [214, 408],
                    [332, 372],
                    [446, 398],
                  ].map(([x, y], index) => (
                    <g
                      key={`${x}-${y}`}
                      className={
                        (index === 0 || index === 6 || index === 10
                          ? "animate-pulse motion-reduce:animate-none"
                          : "")
                      }
                      style={
                        index === 0
                          ? { animationDuration: "4.8s", animationDelay: "0s" }
                          : index === 6
                            ? { animationDuration: "6s", animationDelay: "1.2s" }
                            : index === 10
                              ? { animationDuration: "5.6s", animationDelay: "2s" }
                              : undefined
                      }
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={index % 3 === 0 ? 9 : 6}
                        fill={index % 2 === 0 ? "rgba(227,29,52,0.9)" : "rgba(226,232,240,0.9)"}
                        filter="url(#softGlow)"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={index % 3 === 0 ? 18 : 13}
                        fill={index % 2 === 0 ? "rgba(227,29,52,0.10)" : "rgba(148,163,184,0.08)"}
                      />
                    </g>
                  ))}
                </svg>

                <div className="absolute left-10 top-28 w-[42%] rounded-3xl border border-white/10 bg-white/6 backdrop-blur-xl p-5 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] animate-[floatSoft_8s_ease-in-out_infinite] motion-reduce:animate-none">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Dashboard</p>
                      <h3 className="text-white font-semibold mt-1">Operaciones</h3>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-red-600/15 border border-red-500/20 flex items-center justify-center">
                      <div className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_22px_rgba(227,29,52,0.55)]" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-red-500 to-red-700" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-black/25 border border-white/8 p-3">
                        <p className="text-[11px] text-gray-400">Red</p>
                        <p className="text-sm font-semibold text-white mt-1">99.8%</p>
                      </div>
                      <div className="rounded-2xl bg-black/25 border border-white/8 p-3">
                        <p className="text-[11px] text-gray-400">Soporte</p>
                        <p className="text-sm font-semibold text-white mt-1">Activo</p>
                      </div>
                      <div className="rounded-2xl bg-black/25 border border-white/8 p-3">
                        <p className="text-[11px] text-gray-400">Seguridad</p>
                        <p className="text-sm font-semibold text-white mt-1">Ok</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-10 bottom-24 w-[38%] rounded-3xl border border-red-500/15 bg-slate-950/55 backdrop-blur-xl p-4 shadow-[0_20px_50px_-30px_rgba(227,29,52,0.45)] animate-[floatSoft_10s_ease-in-out_infinite] motion-reduce:animate-none">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-red-300/80">Conexiones</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-red-600/15 border border-red-500/20 flex items-center justify-center">
                      <span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_16px_rgba(227,29,52,0.55)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold">Red empresarial</p>
                      <p className="text-xs text-gray-400">Estable y escalable</p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-[46%] top-[54%] h-20 w-20 rounded-full border border-red-500/20 bg-red-500/10 blur-[1px] shadow-[0_0_70px_rgba(227,29,52,0.24)] animate-[glowBreathe_6s_ease-in-out_infinite] motion-reduce:animate-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">Contáctanos</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Estamos listos para ayudarte</h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Contáctanos hoy mismo y descubre cómo podemos transformar tu negocio con nuestras soluciones tecnológicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Email */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group text-center hover:bg-white/10">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-600/20 rounded-full group-hover:bg-red-600/30 transition-colors backdrop-blur-sm">
                    <Mail className="h-8 w-8 text-red-400" />
                  </div>
                </div>
                <CardTitle className="text-white">Correo Electrónico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4 break-all">jumtechRD@gmail.com</p>
                <Button
                  className="w-full bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300 sm:w-auto"
                  asChild
                >
                  <a href="mailto:jumtechRD@gmail.com">Enviar Email</a>
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group text-center hover:bg-white/10">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-600/20 rounded-full group-hover:bg-red-600/30 transition-colors backdrop-blur-sm">
                    <Phone className="h-8 w-8 text-red-400" />
                  </div>
                </div>
                <CardTitle className="text-white">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">+1 (809) 984-8283</p>
                <Button
                  className="w-full bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300 sm:w-auto"
                  asChild
                >
                  <a href="https://wa.me/18099848283" target="_blank" rel="noopener noreferrer">
                    Chatear Ahora
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group text-center hover:bg-white/10">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-600/20 rounded-full group-hover:bg-red-600/30 transition-colors backdrop-blur-sm">
                    <Instagram className="h-8 w-8 text-red-400" />
                  </div>
                </div>
                <CardTitle className="text-white">Instagram</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">@jumtechrd</p>
                <Button
                  className="w-full bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300 sm:w-auto"
                  asChild
                >
                  <a
                    href="https://www.instagram.com/jumtechrd?igsh=OWh1OXNuendkZjkx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Seguir
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/30 backdrop-blur-sm border-t border-gray-700/50 relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="lg" />
            <p className="text-gray-400 text-center md:text-right">
              © 2024 JumTech RD. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Cotización Form Modal */}
      <CotizacionForm isOpen={isCotizacionFormOpen} onClose={closeCotizacionForm} />
    </div>
  )
}
