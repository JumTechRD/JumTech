"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Target, Eye, Heart, ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"
import { CotizacionForm } from "@/components/cotizacion-form"
import { Logo } from "@/components/logo"

export default function AboutPage() {
  const [isCotizacionFormOpen, setIsCotizacionFormOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openCotizacionForm = () => {
    setIsCotizacionFormOpen(true)
  }

  const closeCotizacionForm = () => {
    setIsCotizacionFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-x-hidden pt-[80px]">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gray-600/10 rounded-full blur-3xl"></div>
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
              className="h-10 sm:h-12 w-auto object-contain"
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
            <Link href="/nosotros" className="text-red-400 font-semibold">
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
                className="text-gray-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                href="/nosotros"
                className="text-red-400 font-semibold py-2 px-4 rounded-lg bg-white/5"
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
            <Button variant="ghost" className="max-w-full text-gray-300 hover:text-white" asChild>
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
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Tecnología Estratégica para Empresas Modernas
            </h1>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
              En JumTechRD desarrollamos soluciones tecnológicas integrales para pequeñas y medianas empresas que
              buscan optimizar sus operaciones, fortalecer su conectividad y evolucionar digitalmente con confianza.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 px-4 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto">
          <div className="text-center lg:text-left">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">
              Sobre Nosotros
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Tecnología Estratégica para Empresas Modernas
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed max-w-4xl mx-auto lg:mx-0">
              En JumTechRD desarrollamos soluciones tecnológicas integrales para pequeñas y medianas empresas que
              buscan optimizar sus operaciones, fortalecer su conectividad y evolucionar digitalmente con confianza.
            </p>
            <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto lg:mx-0">
              Combinamos innovación, experiencia y tecnología para ofrecer servicios empresariales de alto nivel en
              infraestructura de red, soporte IT, seguridad y soluciones digitales adaptadas a las exigencias del
              mercado actual.
            </p>
            <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto lg:mx-0">
              Nuestro compromiso es convertirnos en un aliado tecnológico confiable para cada cliente, aportando
              estabilidad, eficiencia y crecimiento a través de implementaciones modernas y soporte profesional
              continuo.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">
              Nuestros Pilares
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Misión, Visión y Valores</h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Los principios fundamentales que guían nuestro trabajo y definen quiénes somos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Mission */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors backdrop-blur-sm">
                    <Target className="h-6 w-6 text-red-400" />
                  </div>
                  <CardTitle className="text-white text-xl"> Misión</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Brindar soluciones tecnológicas integrales, confiables y personalizadas que impulsen la eficiencia,
                  seguridad y crecimiento de pequeñas y medianas empresas. Trabajamos con compromiso, calidad e
                  innovación constante para ayudar a nuestros clientes a fortalecer su infraestructura tecnológica y
                  operar con mayor productividad.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors backdrop-blur-sm">
                    <Eye className="h-6 w-6 text-red-400" />
                  </div>
                  <CardTitle className="text-white text-xl"> Visión</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Convertirnos en una empresa tecnológica reconocida en la República Dominicana por ofrecer servicios
                  empresariales de alta calidad, destacándonos por nuestra innovación, compromiso y enfoque en la
                  transformación digital de pequeñas y medianas empresas.
                </p>
              </CardContent>
            </Card>

            {/* Values Preview */}
            <Card className="bg-white/5 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:bg-white/10">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors backdrop-blur-sm">
                    <Heart className="h-6 w-6 text-red-400" />
                  </div>
                  <CardTitle className="text-white text-xl"> Valores</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Nuestros valores fundamentales definen nuestra cultura empresarial y guían cada decisión que
                  tomamos.
                </p>
                <p className="text-sm text-red-400">Ver valores completos abajo ↓</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Values Section */}
          <div className="bg-white/5 backdrop-blur-sm border-gray-700/50 rounded-2xl p-4 sm:p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4"> Nuestros Valores </h3>
              <p className="text-gray-300">Los principios que nos definen y nos impulsan hacia la excelencia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Compromiso con la Excelencia</h4>
                    <p className="text-gray-300">
                      Nos esforzamos por superar expectativas en cada solución tecnológica que implementamos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Innovación Constante</h4>
                    <p className="text-gray-300">
                      Adoptamos herramientas y tecnologías modernas para brindar soluciones efectivas, seguras y
                      escalables.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Satisfacción del Cliente</h4>
                    <p className="text-gray-300">
                      Nuestra prioridad es ofrecer una experiencia profesional, cercana y orientada a resultados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Integridad y Ética</h4>
                    <p className="text-gray-300">
                      Operamos con transparencia, responsabilidad y confianza en cada proyecto.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Colaboración y Trabajo en Equipo</h4>
                    <p className="text-gray-300">
                      Fomentamos la cooperación con nuestros clientes para lograr implementaciones más eficientes y
                      sostenibles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Orientación al Cliente</h4>
                    <p className="text-gray-300">
                      Ponemos las necesidades de cada empresa en el centro de cada decisión, ofreciendo soluciones
                      prácticas, personalizadas y alineadas con sus objetivos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para trabajar con nosotros?</h2>
          <p className="text-base sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubre cómo nuestros valores y experiencia pueden impulsar tu proyecto tecnológico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-base sm:w-auto sm:text-lg sm:px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
              asChild
            >
              <Link href="/servicios">
                Ver Nuestros Servicios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="w-full bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300 sm:w-auto"
              asChild
            >
              <Link href="/#contacto">Contactar Ahora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/30 backdrop-blur-sm border-t border-gray-700/50 relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
