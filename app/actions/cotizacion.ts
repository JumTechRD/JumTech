"use server"

import { z } from "zod"
import { submitPublicQuote } from "@/lib/public-quote-submission"

const optionalEmailSchema = z.preprocess((value) => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value.trim()
  return value
}, z.union([z.literal(""), z.string().email("Email inválido")]))

const cotizacionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  empresa: z.string().optional(),
  email: optionalEmailSchema,
  telefono: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  servicio: z.string().min(1, "Debe seleccionar un servicio"),
  urgencia: z.string().min(1, "Debe seleccionar la urgencia"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  ubicacion: z.string().optional(),
})

export async function submitCotizacion(formData: FormData) {
  try {
    const rawData = {
      nombre: formData.get("nombre"),
      empresa: formData.get("empresa"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      servicio: formData.get("servicio"),
      urgencia: formData.get("urgencia"),
      descripcion: formData.get("descripcion"),
      ubicacion: formData.get("ubicacion"),
    }

    const validatedData = cotizacionSchema.parse(rawData)
    const result = await submitPublicQuote(validatedData)

    if (!result.success) {
      return result
    }

    return {
      success: true,
      message: result.message,
    }
  } catch (error) {
    console.error("Error al procesar cotización:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Por favor completa todos los campos requeridos correctamente.",
      }
    }

    return {
      success: false,
      message: "Error al enviar la cotización. Por favor intenta nuevamente.",
    }
  }
}
