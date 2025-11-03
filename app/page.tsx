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
  Settings,
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

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3) // Show 3 items on large screens
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2) // Show 2 items on medium screens
      } else {
        setItemsPerView(1) // Show 1 item on small screens
      }
    }

    updateItemsPerView()
    window.addEventListener("resize", updateItemsPerView)
    return () => window.removeEventListener("resize", updateItemsPerView)
  }, [])

  const maxIndex = Math.max(0, services.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1))
  }

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [currentIndex, maxIndex])

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex))
  }

  return (
    <div className="relative px-2 sm:px-0">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(services.length / itemsPerView) * 100}%`,
          }}
        >
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <div key={index} className="flex-shrink-0" style={{ width: `${100 / services.length}%` }}>
                <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10 mx-1 sm:mx-2 h-full">
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
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
                      <Link href="/servicios">Ver más detalles</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Buttons - Only show if there are more items than visible */}
      {maxIndex > 0 && (
        <>
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
        </>
      )}

      {/* Dots Indicator - Only show if there are multiple slides */}
      {maxIndex > 0 && (
        <div className="flex justify-center mt-4 sm:mt-6 space-x-1.5 sm:space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-colors ${
                index === currentIndex ? "bg-red-500" : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      )}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
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
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/images/jum-negro.jpeg"
              alt="JumTech RD"
              width={200}
              height={60}
              className="h-12 w-auto object-contain [mix-blend-mode:screen]"
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent">
              Soluciones tecnológicas que conectan
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
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
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
              asChild
            >
              <Link href="/servicios">
                Ver Servicios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300 text-lg px-8 py-3"
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Servicios Especializados</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Ofrecemos soluciones tecnológicas integrales para impulsar tu negocio
            </p>
          </div>

          <ServicesCarousel />

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
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
      <section id="nosotros" className="py-20 px-4 bg-black/10 backdrop-blur-sm relative z-10">
        <div className="container mx-auto">
          <div className="text-center lg:text-left">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">Sobre Nosotros</Badge>
            <h2 className="text-4xl font-bold text-white mb-6">Expertos en Tecnología</h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed max-w-3xl mx-auto lg:mx-0">
              En JumTechRD somos especialistas en soluciones tecnológicas integrales diseñadas para impulsar la
              eficiencia de tu empresa y mejorar la conectividad en el hogar. Nuestro compromiso es ofrecer servicios
              confiables, innovadores y adaptados a las necesidades actuales del mercado dominicano.
            </p>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0">
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
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">Contáctanos</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Estamos listos para ayudarte</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
                <p className="text-gray-300 mb-4">jumtechRD@gmail.com</p>
                <Button
                  className="bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300"
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
                  className="bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300"
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
                  className="bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300"
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
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Logo size="lg" />
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-center md:text-right">
                © 2024 JumTech RD. Todos los derechos reservados.
              </p>
              <Link
                href="/admin/login"
                className="text-gray-500 hover:text-red-400 transition-colors text-sm"
                title="Acceso Administrativo"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cotización Form Modal */}
      <CotizacionForm isOpen={isCotizacionFormOpen} onClose={closeCotizacionForm} />
    </div>
  )
}
