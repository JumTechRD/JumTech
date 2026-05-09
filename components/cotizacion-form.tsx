"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Send, CheckCircle, AlertCircle } from "lucide-react"
import { submitCotizacion } from "@/app/actions/cotizacion"

interface CotizacionFormProps {
  isOpen: boolean
  onClose: () => void
}

export function CotizacionForm({ isOpen, onClose }: CotizacionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const result = await submitCotizacion(formData)

      if (result.success) {
        setSubmitStatus("success")
        setMessage(result.message)
        // Reset form after 3 seconds
        setTimeout(() => {
          onClose()
          setSubmitStatus("idle")
          setMessage("")
        }, 3000)
      } else {
        setSubmitStatus("error")
        setMessage(result.message)
      }
    } catch (error) {
      setSubmitStatus("error")
      setMessage("Error al enviar la cotización. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <Card className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border-gray-700/50 max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-h-[90vh]">
        <CardHeader className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
          <div className="text-center">
            <Badge className="mb-4 bg-red-600/20 text-red-400 border-red-600/30">Solicitar Cotización</Badge>
            <CardTitle className="text-xl md:text-3xl font-bold text-white mb-2">Cotiza tu Proyecto</CardTitle>
            <p className="text-gray-300">Completa el formulario y te contactaremos en menos de 24 horas</p>
          </div>
        </CardHeader>

        <CardContent>
          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-600/20 border border-green-600/30 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 shrink-0" />
              <p className="text-green-300">{message}</p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 shrink-0" />
              <p className="text-red-300">{message}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label htmlFor="empresa" className="block text-sm font-medium text-gray-300 mb-2">
                  Empresa/Organización
                </label>
                <input
                  type="text"
                  id="empresa"
                  name="empresa"
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nombre de tu empresa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono/WhatsApp *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="+1 (849) 000-0000"
                />
              </div>
            </div>

            {/* Tipo de Servicio */}
            <div>
              <label htmlFor="servicio" className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Servicio *
              </label>
              <select
                id="servicio"
                name="servicio"
                required
                className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent [&>option]:bg-slate-800 [&>option]:text-white"
              >
                <option value="">Selecciona un servicio</option>
                <option value="mantenimiento">Mantenimiento de Computadoras</option>
                <option value="camaras">Instalación de Cámaras NVR</option>
                <option value="cableado">Cableado Estructurado</option>
                <option value="desarrollo">Desarrollo de Aplicaciones</option>
                <option value="redes">Gestión de Redes</option>
                <option value="ciberseguridad">Ciberseguridad</option>
                <option value="multiple">Múltiples Servicios</option>
                <option value="otro">Otro (especificar en descripción)</option>
              </select>
            </div>

            {/* Urgencia */}
            <div>
              <label htmlFor="urgencia" className="block text-sm font-medium text-gray-300 mb-2">
                Urgencia del Proyecto *
              </label>
              <select
                id="urgencia"
                name="urgencia"
                required
                className="w-full px-4 py-3 bg-slate-800/90 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent [&>option]:bg-slate-800 [&>option]:text-white"
              >
                <option value="">Selecciona la urgencia</option>
                <option value="inmediato">Inmediato (1-3 días)</option>
                <option value="urgente">Urgente (1 semana)</option>
                <option value="normal">Normal (2-4 semanas)</option>
                <option value="flexible">Flexible (1-3 meses)</option>
              </select>
            </div>

            {/* Descripción del Proyecto */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300 mb-2">
                Descripción del Proyecto *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Describe detalladamente tu proyecto, objetivos, requerimientos específicos y cualquier información adicional que consideres importante..."
              />
            </div>

            {/* Ubicación */}
            <div>
              <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-300 mb-2">
                Ubicación del Proyecto
              </label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ciudad, provincia o dirección específica"
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Cotización
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
