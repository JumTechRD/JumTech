"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AdminBottomNav } from "@/components/admin-bottom-nav"
import { ensureAdminSession, logoutAdminSession } from "@/lib/admin-session-client"
import {
  deleteAdminClient,
  fetchAdminClients,
  saveAdminClient,
} from "@/lib/admin-api-client"
import { Home, LogOut, Package, FileText, Receipt, BarChart3, Users, Search, Pencil, Trash2, Plus } from "lucide-react"
import type { ClientRecord } from "@/lib/admin-clients"

type ClientFormState = {
  name: string
  email: string
  phone: string
  companyName: string
  identification: string
  address: string
  notes: string
}

const emptyForm: ClientFormState = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  identification: "",
  address: "",
  notes: "",
}

export default function ClientesPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [search, setSearch] = useState("")
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientFormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadPage = async () => {
      const isSessionValid = await ensureAdminSession(router)
      if (!isSessionValid) return

      setIsAuthenticated(true)
      await loadClients()
    }

    void loadPage()
  }, [router])

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminClients<ClientRecord[]>()
      setClients(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    void logoutAdminSession(router)
  }

  const filteredClients = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return clients

    return clients.filter((client) =>
      [
        client.name,
        client.email,
        client.phone,
        client.companyName || "",
        client.identification || "",
        client.address || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    )
  }, [clients, search])

  const handleChange = (field: keyof ClientFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleNewClient = () => {
    setEditingClientId(null)
    setForm(emptyForm)
  }

  const handleEditClient = (client: ClientRecord) => {
    setEditingClientId(client.id)
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      companyName: client.companyName || "",
      identification: client.identification || "",
      address: client.address || "",
      notes: client.notes || "",
    })
  }

  const handleSaveClient = async () => {
    if (!form.name.trim()) {
      alert("El nombre del cliente es requerido")
      return
    }

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      alert("Ingresa un correo válido")
      return
    }

    if (!form.phone.trim()) {
      alert("El teléfono del cliente es requerido")
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName || null,
        identification: form.identification || null,
        address: form.address || null,
        notes: form.notes || null,
      }

      const savedClient = await saveAdminClient<ClientRecord>(payload, editingClientId || undefined)
      setClients((currentClients) =>
        editingClientId
          ? currentClients.map((client) => (client.id === savedClient.id ? savedClient : client))
          : [savedClient, ...currentClients],
      )
      handleNewClient()
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar el cliente")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClient = async (client: ClientRecord) => {
    if (!confirm(`¿Eliminar a ${client.name}?`)) return

    try {
      await deleteAdminClient(client.id)
      setClients((currentClients) => currentClients.filter((item) => item.id !== client.id))
      if (editingClientId === client.id) {
        handleNewClient()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo eliminar el cliente")
    }
  }

  if (!isAuthenticated) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl"></div>
      </div>

      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/images/logo-nuevo.jpeg" alt="JumTech RD Logo" width={36} height={36} className="rounded-lg" />
            <div>
              <span className="text-base font-bold text-white">JumTech RD</span>
              <Badge className="ml-2 bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs hidden sm:inline-flex">
                Admin
              </Badge>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Home className="h-4 w-4" />
              Ver Sitio
            </Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
              Dashboard
            </Link>
            <Link href="/admin/productos" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Package className="h-4 w-4" />
              Productos
            </Link>
            <Link href="/admin/clientes" className="text-blue-400 font-semibold text-sm flex items-center gap-1">
              <Users className="h-4 w-4" />
              Clientes
            </Link>
            <Link href="/admin/cotizaciones" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Cotizaciones
            </Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              Facturas
            </Link>
            <Link href="/admin/reportes" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Reportes
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white text-sm">
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-24 lg:pb-16 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-6 pt-4">
            <Badge className="mb-3 bg-blue-600/20 text-blue-400 border-blue-600/30">Gestión de Clientes</Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Clientes</h1>
            <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto">
              Crea y administra clientes reutilizables para cotizaciones y facturas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <Card className="bg-white/5 border-gray-700/50">
              <CardContent className="p-4">
                <p className="text-gray-400 text-sm">Total Clientes</p>
                <p className="text-2xl font-bold text-white">{clients.length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 mb-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10 bg-white/5 border-gray-600 text-white placeholder-gray-400 text-sm"
                />
              </div>
              <Button onClick={handleNewClient} className="bg-blue-600 hover:bg-blue-700 text-white sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Listado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-gray-400">Cargando clientes...</p>
                ) : filteredClients.length === 0 ? (
                  <p className="text-gray-400">No se encontraron clientes.</p>
                ) : (
                  filteredClients.map((client) => (
                    <div key={client.id} className="rounded-lg border border-gray-700/40 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{client.name}</p>
                          <p className="text-sm text-gray-300 break-all">{client.email}</p>
                          <p className="text-sm text-gray-400">{client.phone}</p>
                          {client.companyName && <p className="text-xs text-gray-500">{client.companyName}</p>}
                          {client.identification && <p className="text-xs text-gray-500">ID: {client.identification}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClient(client)}
                            className="border-gray-600 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void handleDeleteClient(client)}
                            className="border-gray-600 text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {client.address && <p className="mt-2 text-xs text-gray-500">{client.address}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">{editingClientId ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                    <Input
                      value={form.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      className="bg-white/5 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Correo *</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      className="bg-white/5 border-gray-600 text-white placeholder-gray-400"
                      placeholder="correo@cliente.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono *</label>
                    <Input
                      value={form.phone}
                      onChange={(event) => handleChange("phone", event.target.value)}
                      className="bg-white/5 border-gray-600 text-white placeholder-gray-400"
                      placeholder="+1 (809) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
                    <Input
                      value={form.companyName}
                      onChange={(event) => handleChange("companyName", event.target.value)}
                      className="bg-white/5 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Empresa opcional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Identificación</label>
                    <Input
                      value={form.identification}
                      onChange={(event) => handleChange("identification", event.target.value)}
                      className="bg-white/5 border-gray-600 text-white placeholder-gray-400"
                      placeholder="RNC, cédula o ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                    <Input
                      value={form.address}
                      onChange={(event) => handleChange("address", event.target.value)}
                      className="bg-white/5 border-gray-600 text-white placeholder-gray-400"
                      placeholder="Dirección del cliente"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
                  <Textarea
                    value={form.notes}
                    onChange={(event) => handleChange("notes", event.target.value)}
                    className="bg-white/5 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
                    placeholder="Notas internas"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleSaveClient}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? "Guardando..." : editingClientId ? "Actualizar" : "Guardar"}
                  </Button>
                  {editingClientId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNewClient}
                      className="border-gray-600 text-gray-300 hover:bg-white/10 bg-transparent"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AdminBottomNav />
    </div>
  )
}
