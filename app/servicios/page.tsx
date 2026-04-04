"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Camera, Network, Code, Router, Shield, CheckCircle, ArrowLeft, ArrowRight, Clock, Menu, X } from "lucide-react"
import { CotizacionForm } from "@/components/cotizacion-form"
import { Logo } from "@/components/logo"

export default function ServicesPage() {
  const [isCotizacionFormOpen, setIsCotizacionFormOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openCotizacionForm = () => {
    setIsCotizacionFormOpen(true)
  }

  const closeCotizacionForm = () => {
    setIsCotizacionFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gray-600/10 rounded-full blur-3xl"></div>
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
              className="h-10 sm:h-12 w-auto object-contain [mix-blend-mode:screen]"
              priority
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/servicios" className="text-red-400 font-semibold">
              Servicios
            </Link>
            <Link href="/productos" className="text-gray-300 hover:text-white transition-colors">
              Productos
            </Link>
            <Link href="/nosotros" className="text-gray-300 hover:text-white transition-colors">
              Nosotros
            </Link>
            <Link href="/#contacto" className="text-gray-300 hover:text-white transition-colors">
              Contacto
            </Link>
            <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25" onClick={openCotizacionForm}>
              Cotizar Proyecto
            </Button>
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
                className="text-red-400 font-semibold py-2 px-4 rounded-lg bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="/productos"
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
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
              <Button
                className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false)
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
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="text-gray-300 hover:text-white mr-4" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-center mb-16">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl w-32 h-32 mx-auto"></div>
              <div className="mx-auto mb-6 relative z-10 bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/10">
                <Logo size="xl" className="justify-center" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Nuestros
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
                Servicios
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              Soluciones tecnológicas integrales diseñadas para impulsar tu negocio hacia el futuro digital
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                <Image
                  src="/images/mantenimiento-computadoras.webp"
                  alt="Mantenimiento de Computadoras"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="p-2 bg-red-600/20 rounded-lg backdrop-blur-sm">
                    <Monitor className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base sm:text-lg lg:text-xl leading-tight">
                  Mantenimiento de Computadoras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Servicios completos de mantenimiento preventivo y correctivo para equipos de cómputo, garantizando su
                  óptimo rendimiento y prolongando su vida útil.
                </p>
                <ul className="space-y-2 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Limpieza y optimización del sistema
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Actualización de hardware y software
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Reparación de componentes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Respaldo y recuperación de datos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Instalación de software especializado
                  </li>
                </ul>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Tiempo estimado: 2-4 horas
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={openCotizacionForm}>
                  Solicitar Cotización
                </Button>
              </CardContent>
            </Card>

            {/* Service 2 */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                <Image
                  src="/images/camaras-nvr.jpeg"
                  alt="Instalación de Cámaras NVR"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="p-2 bg-red-600/20 rounded-lg backdrop-blur-sm">
                    <Camera className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base sm:text-lg lg:text-xl leading-tight">
                  Instalación de Cámaras NVR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Sistemas de videovigilancia profesionales con tecnología IP de última generación para proteger tu
                  negocio o hogar las 24 horas del día.
                </p>
                <ul className="space-y-2 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Sistemas de vigilancia IP de alta definición
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Configuración de NVR y grabación
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Monitoreo remoto desde dispositivos móviles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Cámaras de alta resolución 4K
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Soporte técnico especializado 24/7
                  </li>
                </ul>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Tiempo estimado: 1-3 días
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={openCotizacionForm}>
                  Solicitar Cotización
                </Button>
              </CardContent>
            </Card>

            {/* Service 3 */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                <Image
                  src="/images/cableado-estructurado.jpeg"
                  alt="Cableado Estructurado"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="p-2 bg-red-600/20 rounded-lg backdrop-blur-sm">
                    <Network className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base sm:text-lg lg:text-xl leading-tight">
                  Cableado Estructurado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Diseño e implementación de infraestructura de red robusta y escalable, siguiendo estándares
                  internacionales para garantizar conectividad óptima.
                </p>
                <ul className="space-y-2 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Diseño personalizado de redes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Instalación de puntos de red certificados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Certificación de cableado Cat6/Cat6A
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Instalación de fibra óptica
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Mantenimiento preventivo de redes
                  </li>
                </ul>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Tiempo estimado: 3-7 días
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={openCotizacionForm}>
                  Solicitar Cotización
                </Button>
              </CardContent>
            </Card>

            {/* Service 4 */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                <Image
                  src="/images/desarrollo-aplicaciones.jpeg"
                  alt="Desarrollo de Aplicaciones y ERP"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="p-2 bg-red-600/20 rounded-lg backdrop-blur-sm">
                    <Code className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base sm:text-lg lg:text-xl leading-tight">
                  Desarrollo de Aplicaciones y ERP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Desarrollo de software personalizado y sistemas ERP adaptados a las necesidades específicas de tu
                  empresa para optimizar procesos y aumentar la productividad.
                </p>
                <ul className="space-y-2 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Aplicaciones web personalizadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Sistemas ERP para PyMEs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Integración con sistemas existentes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Aplicaciones móviles nativas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Soporte y mantenimiento continuo
                  </li>
                </ul>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Tiempo estimado: 4-12 semanas
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={openCotizacionForm}>
                  Solicitar Cotización
                </Button>
              </CardContent>
            </Card>

            {/* Service 5 */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                <Image
                  src="/images/gestion-redes.jpeg"
                  alt="Gestión de Redes"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="p-2 bg-red-600/20 rounded-lg backdrop-blur-sm">
                    <Router className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base sm:text-lg lg:text-xl leading-tight">
                  Gestión de Redes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Administración profesional de infraestructura de red, optimización de rendimiento y solución de
                  problemas para garantizar conectividad estable y segura.
                </p>
                <ul className="space-y-2 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Administración de redes empresariales
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Configuración de routers y switches
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Optimización de rendimiento de red
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Monitoreo continuo de rendimiento
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Diagnóstico y solución de problemas
                  </li>
                </ul>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Servicio continuo
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={openCotizacionForm}>
                  Solicitar Cotización
                </Button>
              </CardContent>
            </Card>

            {/* Service 6 */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                <Image
                  src="/images/ciberseguridad.jpeg"
                  alt="Ciberseguridad"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="p-2 bg-red-600/20 rounded-lg backdrop-blur-sm">
                    <Shield className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-base sm:text-lg lg:text-xl leading-tight">
                  Ciberseguridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Protección integral contra amenazas cibernéticas con auditorías de seguridad, implementación de
                  medidas preventivas y respuesta a incidentes.
                </p>
                <ul className="space-y-2 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Auditorías de seguridad completas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Protección contra malware y ransomware
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Configuración de firewalls avanzados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Plan de respuesta a incidentes
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    Capacitación en seguridad para empleados
                  </li>
                </ul>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  Evaluación: 1-2 semanas
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={openCotizacionForm}>
                  Solicitar Cotización
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Necesitas una solución personalizada?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contáctanos para una consulta gratuita y descubre cómo podemos ayudarte a alcanzar tus objetivos
            tecnológicos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
              asChild
            >
              <Link href="/#contacto">
                Contactar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
              variant="outline"
              asChild
            >
              <Link href="/nosotros">Conocer Más</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/30 backdrop-blur-sm border-t border-gray-700/50 relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Logo size="lg" />
            <p className="text-gray-400 text-center md:text-right">© 2024 JumTech RD. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cotización Form Modal */}
      <CotizacionForm isOpen={isCotizacionFormOpen} onClose={closeCotizacionForm} />
    </div>
  )
}
