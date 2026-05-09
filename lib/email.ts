type EmailPayload = {
  to: string | string[]
  subject: string
  text: string
  html?: string
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()

  if (!apiKey || !from) {
    return null
  }

  return { apiKey, from }
}

export function isEmailConfigured() {
  return getEmailConfig() !== null
}

export async function sendEmail(payload: EmailPayload) {
  const config = getEmailConfig()

  if (!config) {
    console.warn("[email] RESEND_API_KEY o RESEND_FROM_EMAIL no configurados; se omite el envío")
    return { success: false as const, reason: "not-configured" as const }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html || undefined,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      console.error("[email] Resend respondió con error", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      })
      return { success: false as const, reason: "send-failed" as const }
    }

    return { success: true as const }
  } catch (error) {
    console.error("[email] Error enviando correo", error)
    return { success: false as const, reason: "exception" as const }
  }
}
