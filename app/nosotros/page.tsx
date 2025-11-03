"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Target, Eye, Heart, ArrowRight } from "lucide-react"
import { useState } from "react"
import { CotizacionForm } from "@/components/cotizacion-form"
import { Logo } from "@/components/logo"

export default function AboutPage() {
  const [isCotizacionFormOpen, setIsCotizacionFormOpen] = useState(false)

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
              src="/images/jumtech-logo-negro.png"
              alt="JumTech RD"
              width={200}
              height={60}
              className="h-12 w-auto object-contain [mix-blend-mode:screen]"
              priority
            />
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/servicios" className="text-gray-300 hover:text-white transition-colors">
              Servicios
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
              Sobre
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
                JumTech RD
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              Conoce más sobre nuestra empresa, nuestra misión, visión y los valores que nos guían en cada proyecto
              tecnológico.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 px-4 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto">
          <div className="text-center lg:text-left">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30 backdrop-blur-sm">
              Nuestra Historia
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-6">Expertos en Tecnología</h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed max-w-4xl mx-auto lg:mx-0">
            En JumTechRD somos especialistas en soluciones tecnológicas integrales diseñadas para impulsar la eficiencia de tu empresa y mejorar la conectividad en el hogar. Nuestro compromiso es ofrecer servicios confiables, innovadores y adaptados a las necesidades actuales del mercado dominicano.
            </p>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto lg:mx-0">
              Nuestro equipo de profesionales altamente capacitados se dedica a ofrecer servicios de calidad,
              garantizando la satisfacción total de nuestros clientes y el éxito de sus proyectos tecnológicos.
            </p>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto lg:mx-0">
              Desde nuestros inicios, hemos trabajado incansablemente para mantenernos a la vanguardia de las
              tecnologías emergentes, ofreciendo soluciones innovadoras que se adaptan a las necesidades específicas de
              cada cliente.
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Misión, Visión y Valores</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
                  Brindar soluciones tecnológicas integrales, confiables y personalizadas que impulsen el desarrollo y
                  la eficiencia de nuestros clientes, tanto en el ámbito empresarial como en el hogar. Trabajamos con
                  compromiso, calidad e innovación constante.
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
                  Convertirnos en una empresa reconocida por ofrecer servicios tecnológicos de calidad en la República Dominicana, destacándonos por nuestra innovación, compromiso y enfoque en la transformación digital de nuestros clientes.
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
                  Nuestros valores fundamentales que definen nuestra cultura empresarial y guían cada decisión que
                  tomamos.
                </p>
                <p className="text-sm text-red-400">Ver valores completos abajo ↓</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Values Section */}
          <div className="bg-white/5 backdrop-blur-sm border-gray-700/50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4"> Nuestros Valores </h3>
              <p className="text-gray-300">Los principios que nos definen y nos impulsan hacia la excelencia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Compromiso con la Excelencia</h4>
                    <p className="text-gray-300">
                      Nos esforzamos por superar expectativas en cada servicio que brindamos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Innovación Constante</h4>
                    <p className="text-gray-300">
                      Adoptamos la tecnología de vanguardia para brindar soluciones efectivas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Satisfacción del Cliente</h4>
                    <p className="text-gray-300">Nuestra prioridad es ofrecer una experiencia superior y cercana.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Integridad y Ética</h4>
                    <p className="text-gray-300">
                      Operamos con transparencia y responsabilidad en todas nuestras acciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Colaboración y Trabajo en Equipo</h4>
                    <p className="text-gray-300">
                      Fomentamos un ambiente de cooperación para lograr mejores resultados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-red-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Orientación al Cliente</h4>
                    <p className="text-gray-300">Ponemos a nuestros clientes en el centro de cada decisión, ofreciendo soluciones prácticas y personalizadas.</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para trabajar con nosotros?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubre cómo nuestros valores y experiencia pueden impulsar tu proyecto tecnológico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3 shadow-lg shadow-red-600/25 backdrop-blur-sm"
              asChild
            >
              <Link href="/servicios">
                Ver Nuestros Servicios
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-black/60 text-red-400 border border-red-500/50 hover:bg-black/80 hover:text-red-300 hover:border-red-400 backdrop-blur-sm transition-all duration-300"
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
