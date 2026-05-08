async function readJson<T>(response: Response, key: string): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data[key] as T
}

export async function fetchAdminProducts<T>() {
  const response = await fetch('/api/admin/products', { cache: 'no-store' })
  return readJson<T>(response, 'products')
}

export async function saveAdminProduct<T extends { id?: string }>(product: T, id?: string) {
  const response = await fetch(id ? `/api/admin/products/${id}` : '/api/admin/products', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  return readJson<T>(response, 'product')
}

export async function deleteAdminProduct(id: string) {
  const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
}

export async function fetchAdminInvoices<T>() {
  const response = await fetch('/api/admin/invoices', { cache: 'no-store' })
  return readJson<T>(response, 'invoices')
}

export async function saveAdminInvoice<T extends { id?: string }>(invoice: T, id?: string) {
  const response = await fetch(id ? `/api/admin/invoices/${id}` : '/api/admin/invoices', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  })
  return readJson<T>(response, 'invoice')
}

export async function deleteAdminInvoice(id: string) {
  const response = await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
}

export async function fetchAdminQuotes<T>() {
  const response = await fetch('/api/admin/quotes', { cache: 'no-store' })
  return readJson<T>(response, 'quotes')
}

export async function saveAdminQuote<T extends { id?: string }>(quote: T, id?: string) {
  const response = await fetch(id ? `/api/admin/quotes/${id}` : '/api/admin/quotes', {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quote),
  })
  return readJson<T>(response, 'quote')
}

export async function deleteAdminQuote(id: string) {
  const response = await fetch(`/api/admin/quotes/${id}`, { method: 'DELETE' })
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
