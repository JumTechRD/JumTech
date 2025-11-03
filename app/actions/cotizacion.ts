"use server"

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

    // Crear el contenido del email
    const emailContent = `
Nueva Solicitud de Cotización - JumTech RD

Información del Cliente:
- Nombre: ${validatedData.nombre}
- Empresa: ${validatedData.empresa || "No especificada"}
- Email: ${validatedData.email}
- Teléfono: ${validatedData.telefono}
- Ubicación: ${validatedData.ubicacion || "No especificada"}

Detalles del Proyecto:
- Servicio: ${validatedData.servicio}
- Presupuesto: ${validatedData.presupuesto || "No especificado"}
- Urgencia: ${validatedData.urgencia}
- Descripción: ${validatedData.descripcion}

Fecha de solicitud: ${new Date().toLocaleString("es-DO")}

---
Este mensaje fue enviado desde el formulario de cotización de JumTech RD.
    `.trim()

    // Simular envío de email (en producción usarías un servicio como SendGrid, Resend, etc.)
    console.log("=== NUEVA COTIZACIÓN RECIBIDA ===")
    console.log(emailContent)
    console.log("=================================")

    // En un entorno de producción, aquí enviarías el email real
    // await sendEmail({
    //   to: "jumtechRD@gmail.com",
    //   subject: `Nueva Cotización - ${validatedData.nombre}`,
    //   body: emailContent
    // })

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000))

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