type Nullable<T> = T | null

export interface ClientRecord {
  id: string
  name: string
  email: string
  phone: string
  companyName: Nullable<string>
  identification: Nullable<string>
  address: Nullable<string>
  notes: Nullable<string>
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ClientFormInput {
  name: string
  email: string
  phone: string
  companyName: Nullable<string>
  identification: Nullable<string>
  address: Nullable<string>
  notes: Nullable<string>
}

function toStringValue(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim()
  if (value === null || value === undefined) return fallback
  return String(value).trim()
}

function toOptionalString(value: unknown) {
  const normalized = toStringValue(value)
  return normalized.length > 0 ? normalized : null
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

export function normalizeClientInput(body: Record<string, unknown>): ClientFormInput {
  return {
    name: toStringValue(body.name),
    email: toStringValue(body.email).toLowerCase(),
    phone: toStringValue(body.phone),
    companyName: toOptionalString(body.companyName),
    identification: toOptionalString(body.identification),
    address: toOptionalString(body.address),
    notes: toOptionalString(body.notes),
  }
}

export function serializeClient(client: ClientRecord) {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    companyName: client.companyName || undefined,
    identification: client.identification || undefined,
    address: client.address || undefined,
    notes: client.notes || undefined,
    createdAt: toIso(client.createdAt),
    updatedAt: toIso(client.updatedAt),
  }
}
