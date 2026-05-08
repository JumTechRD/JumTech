"use server"

import { headers } from "next/headers"
import { z } from "zod"

// Schema de validación
const cotizacionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  empresa: z.string().optional(),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  servicio: z.string().min(1, "Debe seleccionar un servicio"),
  presupuesto: z.string().optional(),
  urgencia: z.string().min(1, "Debe seleccionar la urgencia"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  ubicacion: z.string().optional(),
})

const serviceLabels: Record<string, string> = {
  mantenimiento: "Mantenimiento de Computadoras",
  camaras: "Instalación de Cámaras NVR",
  cableado: "Cableado Estructurado",
  desarrollo: "Desarrollo de Aplicaciones",
  redes: "Gestión de Redes",
  ciberseguridad: "Ciberseguridad",
  multiple: "Múltiples Servicios",
  otro: "Otro",
}

function buildRequestUrl(path: string) {
  return headers().then((requestHeaders) => {
    const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host")
    if (!host) {
      throw new Error("Missing request host")
    }

    const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0] || "http"
    return `${protocol}://${host}${path}`
  })
}

export async function submitCotizacion(formData: FormData) {
  try {
    // Validar datos del formulario
    const rawData = {
      nombre: formData.get("nombre"),
      empresa: formData.get("empresa"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      servicio: formData.get("servicio"),
      presupuesto: formData.get("presupuesto"),
      urgencia: formData.get("urgencia"),
      descripcion: formData.get("descripcion"),
      ubicacion: formData.get("ubicacion"),
    }

    const validatedData = cotizacionSchema.parse(rawData)
    const serviceLabel = serviceLabels[validatedData.servicio] || validatedData.servicio

    const message = `
Nueva Solicitud de Cotización - JumTech RD

Información del Cliente:
- Nombre: ${validatedData.nombre}
- Empresa: ${validatedData.empresa || "No especificada"}
- Email: ${validatedData.email}
- Teléfono: ${validatedData.telefono}
- Ubicación: ${validatedData.ubicacion || "No especificada"}

Detalles del Proyecto:
- Servicio: ${serviceLabel}
- Presupuesto: ${validatedData.presupuesto || "No especificado"}
- Urgencia: ${validatedData.urgencia}
- Descripción: ${validatedData.descripcion}

Fecha de solicitud: ${new Date().toLocaleString("es-DO")}

---
Este mensaje fue enviado desde el formulario de cotización de JumTech RD.
    `.trim()

    const response = await fetch(await buildRequestUrl("/api/quotes"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: validatedData.nombre,
        email: validatedData.email,
        phone: validatedData.telefono,
        service: validatedData.servicio,
        message,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        success: false,
        message: "Error al enviar la cotización. Por favor intenta nuevamente."
      }
    }

    return {
      success: true,
      message: "¡Cotización enviada exitosamente! Te contactaremos en menos de 24 horas."
    }

  } catch (error) {
    console.error("Error al procesar cotización:", error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Por favor completa todos los campos requeridos correctamente."
      }
    }

    return {
      success: false,
      message: "Error al enviar la cotización. Por favor intenta nuevamente."
    }
  }
}
