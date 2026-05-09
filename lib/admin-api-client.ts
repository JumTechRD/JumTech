async function readJson<T>(response: Response, key: string): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data[key] as T
}

export async function fetchAdminProducts<T>() {
  const response = await fetch('/api/admin/products', { cache: 'no-store', credentials: 'same-origin' })
  return readJson<T>(response, 'products')
}

export async function fetchAdminClients<T>() {
  const response = await fetch('/api/admin/clients', { cache: 'no-store', credentials: 'same-origin' })
  return readJson<T>(response, 'clients')
}

export async function saveAdminClient<T>(client: Record<string, unknown>, id?: string) {
  const response = await fetch(id ? `/api/admin/clients/${id}` : '/api/admin/clients', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(client),
  })
  return readJson<T>(response, 'client')
}

export async function deleteAdminClient(id: string) {
  const response = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE', credentials: 'same-origin' })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
}

export async function saveAdminProduct<T extends { id?: string }>(product: T, id?: string) {
  const response = await fetch(id ? `/api/admin/products/${id}` : '/api/admin/products', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(product),
  })
  return readJson<T>(response, 'product')
}

export async function deleteAdminProduct(id: string) {
  const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'same-origin' })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
}

export async function fetchAdminInvoices<T>(filters?: {
  estado?: string
  q?: string
  fechaInicial?: string
  fechaFinal?: string
}) {
  const params = new URLSearchParams()
  if (filters?.estado) params.set('estado', filters.estado)
  if (filters?.q) params.set('q', filters.q)
  if (filters?.fechaInicial) params.set('fechaInicial', filters.fechaInicial)
  if (filters?.fechaFinal) params.set('fechaFinal', filters.fechaFinal)

  const queryString = params.toString()
  const response = await fetch(`/api/admin/invoices${queryString ? `?${queryString}` : ''}`, {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  return readJson<T>(response, 'invoices')
}

export async function saveAdminInvoice<T extends { id?: string }>(invoice: T, id?: string) {
  const response = await fetch(id ? `/api/admin/invoices/${id}` : '/api/admin/invoices', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(invoice),
  })
  return readJson<T>(response, 'invoice')
}

export async function deleteAdminInvoice(id: string) {
  const response = await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE', credentials: 'same-origin' })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
}

export async function fetchAdminQuotes<T>() {
  const response = await fetch('/api/admin/quotes', { cache: 'no-store', credentials: 'same-origin' })
  return readJson<T>(response, 'quotes')
}

export async function saveAdminQuote<T extends { id?: string }>(quote: T, id?: string) {
  const response = await fetch(id ? `/api/admin/quotes/${id}` : '/api/admin/quotes', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(quote),
  })
  return readJson<T>(response, 'quote')
}

export async function deleteAdminQuote(id: string) {
  const response = await fetch(`/api/admin/quotes/${id}`, { method: 'DELETE', credentials: 'same-origin' })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
}

export async function fetchPublicProducts<T>() {
  const response = await fetch('/api/products', { cache: 'no-store' })
  return readJson<T>(response, 'products')
}

export async function fetchPublicProduct<T>(id: string) {
  const response = await fetch(`/api/products/${id}`, { cache: 'no-store' })
  return readJson<T>(response, 'product')
}
