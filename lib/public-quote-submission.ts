import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sanitizeString, validateEmail } from "@/lib/auth"
import { sendEmail, isEmailConfigured } from "@/lib/email"

const SERVICE_LABELS: Record<string, string> = {
  mantenimiento: "Mantenimiento de Computadoras",
  camaras: "Instalación de Cámaras NVR",
  cableado: "Cableado Estructurado",
  desarrollo: "Desarrollo de Aplicaciones",
  redes: "Gestión de Redes",
  ciberseguridad: "Ciberseguridad",
  multiple: "Múltiples Servicios",
  otro: "Otro",
}

const URGENCY_LABELS: Record<string, string> = {
  inmediato: "Inmediato (1-3 días)",
  urgente: "Urgente (1 semana)",
  normal: "Normal (2-4 semanas)",
  flexible: "Flexible (1-3 meses)",
}

const optionalEmailSchema = z.preprocess((value) => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value.trim()
  return value
}, z.union([z.literal(""), z.string().email()]))

const quoteSubmissionSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  empresa: z.string().trim().max(120).optional().nullable(),
  email: optionalEmailSchema,
  telefono: z.string().trim().min(8).max(30),
  servicio: z.string().trim().min(1),
  urgencia: z.string().trim().min(1),
  descripcion: z.string().trim().min(10).max(5000),
  ubicacion: z.string().trim().max(200).optional().nullable(),
})

export type PublicQuoteSubmission = z.infer<typeof quoteSubmissionSchema>

type SubmissionResult = {
  success: boolean
  message: string
}

function normalizePhone(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function phoneKey(value: string) {
  return value.replace(/\D/g, "")
}

function buildServiceLabel(service: string) {
  return SERVICE_LABELS[service] || service
}

function buildUrgencyLabel(urgency: string) {
  return URGENCY_LABELS[urgency] || urgency
}

function buildRequestMessage(input: PublicQuoteSubmission) {
  const serviceLabel = buildServiceLabel(input.servicio)
  const urgencyLabel = buildUrgencyLabel(input.urgencia)

  return `
Nueva Solicitud de Cotización - JumTech RD

Información del Cliente:
- Nombre: ${input.nombre}
- Empresa: ${input.empresa || "No especificada"}
- Email: ${input.email || "No especificado"}
- Teléfono: ${input.telefono}
- Ubicación: ${input.ubicacion || "No especificada"}

Detalles del Proyecto:
- Servicio: ${serviceLabel}
- Urgencia: ${urgencyLabel}
- Descripción: ${input.descripcion}

Fecha de solicitud: ${new Date().toLocaleString("es-DO")}

---
Este mensaje fue enviado desde el formulario de cotización de JumTech RD.
  `.trim()
}

function buildClientNotes(input: PublicQuoteSubmission) {
  return sanitizeString(
    `Solicitud de cotización: ${buildServiceLabel(input.servicio)} | Urgencia: ${buildUrgencyLabel(input.urgencia)} | ${input.descripcion}`,
  )
}

function buildAdminQuoteNotes(input: PublicQuoteSubmission) {
  const notes = [
    "Solicitud de cotización",
    `Servicio: ${buildServiceLabel(input.servicio)}`,
    `Urgencia: ${buildUrgencyLabel(input.urgencia)}`,
    `Ubicación: ${input.ubicacion || "No especificada"}`,
  ]
  const clientDescription = input.descripcion.trim()

  if (clientDescription) {
    notes.push(`Nota del cliente: ${clientDescription}`)
  }

  return sanitizeString(notes.join(" | "))
}

function toContactEmail(input: PublicQuoteSubmission) {
  return input.email.trim().toLowerCase()
}

function logSubmissionError(stage: string, error: unknown, context?: Record<string, unknown>) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[quote-submission] ${stage} failed`, {
      code: error.code,
      meta: error.meta,
      ...context,
    })
    return
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(`[quote-submission] ${stage} validation failed`, {
      message: error.message,
      ...context,
    })
    return
  }

  console.error(`[quote-submission] ${stage} failed`, {
    error,
    ...context,
  })
}

async function resolveService(tx: Prisma.TransactionClient, serviceKey: string) {
  const existingById = await tx.service.findUnique({
    where: { id: serviceKey },
  })

  if (existingById) {
    return existingById
  }

  const serviceLabel = buildServiceLabel(serviceKey)
  const serviceDescription =
    SERVICE_LABELS[serviceKey]
      ? `Solicitud de ${serviceLabel} desde el formulario público`
      : "Solicitud de servicio desde el formulario público"

  const existingService = await tx.service.findFirst({
    where: { title: serviceLabel },
  })

  if (existingService) {
    return existingService
  }

  return tx.service.create({
    data: {
      title: serviceLabel,
      description: serviceDescription,
    },
  })
}

async function upsertClient(tx: Prisma.TransactionClient, input: PublicQuoteSubmission) {
  const email = toContactEmail(input)
  const normalizedPhone = normalizePhone(input.telefono)
  const phoneDigits = phoneKey(normalizedPhone)
  type ExistingClient = {
    id: string
    name: string
    email: string
    phone: string
    companyName: string | null
    identification: string | null
    address: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
  }

  const [existingClient] = email
    ? await tx.$queryRaw<ExistingClient[]>(Prisma.sql`
        SELECT *
        FROM "Client"
        WHERE lower("email") = ${email}
           OR regexp_replace("phone", '\\D', '', 'g') = ${phoneDigits}
        ORDER BY CASE WHEN lower("email") = ${email} THEN 0 ELSE 1 END, "createdAt" DESC
        LIMIT 1
      `)
    : await tx.$queryRaw<ExistingClient[]>(Prisma.sql`
        SELECT *
        FROM "Client"
        WHERE regexp_replace("phone", '\\D', '', 'g') = ${phoneDigits}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `)

  const notes = buildClientNotes(input)

  if (existingClient) {
    return tx.client.update({
      where: { id: existingClient.id },
      data: {
        name: sanitizeString(input.nombre),
        ...(email ? { email } : {}),
        phone: normalizedPhone,
        companyName: input.empresa ? sanitizeString(input.empresa) : existingClient.companyName ?? undefined,
        address: input.ubicacion ? sanitizeString(input.ubicacion) : existingClient.address ?? undefined,
        notes: existingClient.notes ? `${existingClient.notes}\n${notes}` : notes,
      },
    })
  }

  if (!email) return null

  return tx.client.create({
    data: {
      name: sanitizeString(input.nombre),
      email,
      phone: normalizedPhone,
      companyName: input.empresa ? sanitizeString(input.empresa) : null,
      address: input.ubicacion ? sanitizeString(input.ubicacion) : null,
      notes,
    },
  })
}

async function sendQuoteNotifications(input: PublicQuoteSubmission, clientId: string | null, quoteId: string) {
  if (!isEmailConfigured()) {
    console.warn("[quote-submission] Servicio de correo no configurado; se omiten notificaciones")
    return
  }

  const internalRecipient = process.env.QUOTE_INTERNAL_RECIPIENT_EMAIL?.trim() || "jumtechrd@gmail.com"
  const contactEmail = toContactEmail(input)
  const serviceLabel = buildServiceLabel(input.servicio)
  const urgencyLabel = buildUrgencyLabel(input.urgencia)
  const customerText = `
Hola ${input.nombre},

Hemos recibido tu solicitud de cotización. Te contactaremos en menos de 24 horas.

Servicio: ${serviceLabel}
Urgencia: ${urgencyLabel}
Cliente: ${input.nombre}
Empresa: ${input.empresa || "No especificada"}
Teléfono: ${input.telefono}
Ubicación: ${input.ubicacion || "No especificada"}

Gracias por confiar en JumTech RD.
Referencia interna: ${quoteId}
  `.trim()

  const internalText = `
Nueva solicitud de cotización recibida

Cliente: ${input.nombre}
Empresa: ${input.empresa || "No especificada"}
Email: ${contactEmail || "No especificado"}
Teléfono: ${input.telefono}
Ubicación: ${input.ubicacion || "No especificada"}
Servicio: ${serviceLabel}
Urgencia: ${urgencyLabel}
Descripción:
${input.descripcion}

ClientId: ${clientId}
QuoteId: ${quoteId}
Fecha: ${new Date().toLocaleString("es-DO")}
  `.trim()

  const notifications = [
    {
      label: "interno",
      promise: sendEmail({
        to: internalRecipient,
        subject: `Nueva solicitud de cotización - ${input.nombre}`,
        text: internalText,
        html: internalText.replace(/\n/g, "<br>"),
      }),
    },
  ]

  if (contactEmail) {
    notifications.unshift({
      label: "cliente",
      promise: sendEmail({
        to: contactEmail,
        subject: "Hemos recibido tu solicitud de cotización",
        text: customerText,
        html: customerText.replace(/\n/g, "<br>"),
      }),
    })
  }

  const results = await Promise.allSettled(notifications.map((notification) => notification.promise))

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`[quote-submission] Falló el correo ${notifications[index].label}`, result.reason)
    }
  })
}

function normalizeSubmissionInput(raw: Record<string, unknown>) {
  return {
    nombre: raw.nombre ?? raw.name,
    empresa: raw.empresa ?? raw.company,
    email: raw.email,
    telefono: raw.telefono ?? raw.phone,
    servicio: raw.servicio ?? raw.service ?? raw.serviceId,
    urgencia: raw.urgencia ?? "normal",
    descripcion: raw.descripcion ?? raw.message,
    ubicacion: raw.ubicacion ?? raw.location,
  }
}

export function parsePublicQuoteSubmission(raw: Record<string, unknown>) {
  const parsed = quoteSubmissionSchema.safeParse(normalizeSubmissionInput(raw))

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Por favor completa todos los campos requeridos correctamente.",
    }
  }

  const email = toContactEmail(parsed.data)
  if (email && !validateEmail(email)) {
    return {
      success: false as const,
      message: "Por favor completa todos los campos requeridos correctamente.",
    }
  }

  if (phoneKey(parsed.data.telefono).length < 7) {
    return {
      success: false as const,
      message: "Por favor completa todos los campos requeridos correctamente.",
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export async function submitPublicQuote(raw: Record<string, unknown>): Promise<SubmissionResult> {
  const parsed = parsePublicQuoteSubmission(raw)
  if (!parsed.success) {
    return parsed
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const service = await resolveService(tx, parsed.data.servicio)
      const client = await upsertClient(tx, parsed.data)
      const requestMessage = buildRequestMessage(parsed.data)
      const email = toContactEmail(parsed.data)

      const quoteRequest = await tx.quoteRequest.create({
        data: {
          name: sanitizeString(parsed.data.nombre),
          email,
          phone: normalizePhone(parsed.data.telefono),
          message: requestMessage,
          serviceId: service.id,
          clientId: client?.id ?? null,
        },
      })

      const adminQuote = await tx.adminQuote.create({
        data: {
          cliente: sanitizeString(parsed.data.nombre),
          email,
          telefono: normalizePhone(parsed.data.telefono),
          clientId: client?.id ?? null,
          fecha: new Date(),
          subtotal: 0,
          impuestos: 0,
          total: 0,
          estado: "pendiente",
          notas: buildAdminQuoteNotes(parsed.data),
          tipoServicio: buildServiceLabel(parsed.data.servicio),
          urgencia: parsed.data.urgencia,
          descripcionProyecto: sanitizeString(parsed.data.descripcion),
          ubicacionProyecto: parsed.data.ubicacion ? sanitizeString(parsed.data.ubicacion) : null,
        },
      })

      return { client, quoteRequest, adminQuote }
    })

    await sendQuoteNotifications(parsed.data, result.client?.id ?? null, result.adminQuote.id)

    return {
      success: true,
      message: "Hemos recibido tu solicitud de cotización. Te contactaremos en menos de 24 horas.",
    }
  } catch (error) {
    logSubmissionError("submitPublicQuote", error, {
      email: toContactEmail(parsed.data) || "No especificado",
      service: parsed.data.servicio,
    })
    return {
      success: false,
      message: "No se pudo enviar tu solicitud. Intenta de nuevo más tarde.",
    }
  }
}
