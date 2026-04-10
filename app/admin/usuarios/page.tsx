"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminBottomNav } from "@/components/admin-bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ensureAdminSession, logoutAdminSession } from "@/lib/admin-session-client"
import { Download, FileText, Home, LogOut, Pencil, Receipt, Shield, Trash2, Users, X } from "lucide-react"

type UserRole = "ADMIN" | "CLIENT"
type RoleFilter = "ALL" | UserRole
type SortOption = "NEWEST" | "OLDEST" | "EMAIL_ASC" | "EMAIL_DESC"
type QuickFilter = "ALL" | "ADMIN" | "CLIENT" | "WITH_PERMISSIONS" | "WITHOUT_PERMISSIONS"
const USERS_PER_PAGE = 6
const AVAILABLE_PERMISSIONS = [
  "MANAGE_USERS",
  "VIEW_REPORTS",
  "EDIT_PRODUCTS",
  "MANAGE_QUOTES",
  "MANAGE_INVOICES",
]

interface AdminUser {
  id: string
  email: string
  role: UserRole
  permissions: string[]
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("CLIENT")
  const [permissionsInput, setPermissionsInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<UserRole>("CLIENT")
  const [editPermissionsInput, setEditPermissionsInput] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [customPermission, setCustomPermission] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL")
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL")

  const parsedPermissions = useMemo(
    () =>
      permissionsInput
        .split(",")
        .map((permission) => permission.trim())
        .filter(Boolean),
    [permissionsInput]
  )
  const effectiveCreatePermissions = useMemo(() => {
    const merged = [...selectedPermissions, ...parsedPermissions]
    return Array.from(new Set(merged))
  }, [selectedPermissions, parsedPermissions])
  const parsedEditPermissions = useMemo(
    () =>
      editPermissionsInput
        .split(",")
        .map((permission) => permission.trim())
        .filter(Boolean),
    [editPermissionsInput]
  )
  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    const roleFiltered = roleFilter === "ALL" ? users : users.filter((user) => user.role === roleFilter)
    const quickFiltered = roleFiltered.filter((user) => {
      switch (quickFilter) {
        case "ADMIN":
          return user.role === "ADMIN"
        case "CLIENT":
          return user.role === "CLIENT"
        case "WITH_PERMISSIONS":
          return user.permissions.length > 0
        case "WITHOUT_PERMISSIONS":
          return user.permissions.length === 0
        case "ALL":
        default:
          return true
      }
    })

    if (!normalized) return quickFiltered
    return quickFiltered.filter(
      (user) =>
        user.email.toLowerCase().includes(normalized) ||
        user.role.toLowerCase().includes(normalized) ||
        user.permissions.some((permission) => permission.toLowerCase().includes(normalized))
    )
  }, [quickFilter, roleFilter, search, users])
  const sortedUsers = useMemo(() => {
    const items = [...filteredUsers]
    switch (sortBy) {
      case "OLDEST":
        return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "EMAIL_ASC":
        return items.sort((a, b) => a.email.localeCompare(b.email))
      case "EMAIL_DESC":
        return items.sort((a, b) => b.email.localeCompare(a.email))
      case "NEWEST":
      default:
        return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }, [filteredUsers, sortBy])
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / USERS_PER_PAGE))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE
    const end = start + USERS_PER_PAGE
    return sortedUsers.slice(start, end)
  }, [currentPage, sortedUsers])

  const loadUsers = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload.error || "No se pudieron cargar los usuarios")
        return
      }

      const payload = await response.json()
      setUsers(Array.isArray(payload.users) ? payload.users : [])
      setCurrentPage(1)
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const setup = async () => {
      const isSessionValid = await ensureAdminSession(router)
      if (!isSessionValid) {
        return
      }
      await loadUsers()
    }

    void setup()
  }, [router])

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          permissions: effectiveCreatePermissions,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(payload.error || "No se pudo crear el usuario")
        return
      }

      setSuccess("Usuario creado correctamente")
      setEmail("")
      setPassword("")
      setRole("CLIENT")
      setPermissionsInput("")
      setSelectedPermissions([])
      setCustomPermission("")
      await loadUsers()
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    void logoutAdminSession(router)
  }
  const toggleCreatePermission = (permission: string) => {
    setSelectedPermissions((previous) =>
      previous.includes(permission) ? previous.filter((item) => item !== permission) : [...previous, permission]
    )
  }
  const addCustomPermission = () => {
    const permission = customPermission.trim().toUpperCase()
    if (!permission) return
    if (selectedPermissions.includes(permission)) {
      setCustomPermission("")
      return
    }
    setSelectedPermissions((previous) => [...previous, permission])
    setCustomPermission("")
  }
  const removeSelectedPermission = (permission: string) => {
    setSelectedPermissions((previous) => previous.filter((item) => item !== permission))
  }

  const startEditingUser = (user: AdminUser) => {
    setEditingUserId(user.id)
    setEditRole(user.role)
    setEditPermissionsInput(user.permissions.join(","))
    setError("")
    setSuccess("")
  }

  const cancelEditingUser = () => {
    setEditingUserId(null)
    setEditRole("CLIENT")
    setEditPermissionsInput("")
    setEditPassword("")
  }

  const handleUpdateUser = async (userId: string) => {
    setActionLoadingId(userId)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: editRole,
          permissions: parsedEditPermissions,
          password: editPassword,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(payload.error || "No se pudo actualizar el usuario")
        return
      }

      setSuccess("Usuario actualizado correctamente")
      cancelEditingUser()
      await loadUsers()
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setActionLoadingId(userId)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(payload.error || "No se pudo eliminar el usuario")
        return
      }

      setSuccess("Usuario eliminado correctamente")
      await loadUsers()
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setActionLoadingId(null)
    }
  }
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])
  useEffect(() => {
    setCurrentPage(1)
  }, [quickFilter, roleFilter, sortBy])

  const handleExportCsv = () => {
    const headers = ["email", "role", "permissions", "createdAt"]
    const rows = sortedUsers.map((user) => [
      user.email,
      user.role,
      user.permissions.join("|"),
      new Date(user.createdAt).toISOString(),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `usuarios-admin-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_20%_30%,rgba(30,64,175,0.08),transparent_28%)]" />

      <nav className="fixed top-0 w-full bg-[#080d17]/85 backdrop-blur-xl border-b border-slate-800/70 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/images/logo-nuevo.jpeg" alt="JumTech RD Logo" width={36} height={36} className="rounded-lg" />
            <div>
              <span className="text-base font-semibold text-white tracking-tight">JumTech RD</span>
              <Badge className="ml-2 bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-xs hidden sm:inline-flex">
                Usuarios
              </Badge>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
              <Home className="h-4 w-4" />
              Ver Sitio
            </Link>
            <Link href="/admin/dashboard" className="text-gray-300 hover:text-white text-sm">
              Dashboard
            </Link>
            <Link href="/admin/cotizaciones" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Cotizaciones
            </Link>
            <Link href="/admin/facturas" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              Facturas
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-gray-300 hover:text-white text-sm">
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </div>

          <div className="flex md:hidden">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 p-2">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-3">
            <Badge className="bg-indigo-500/15 text-indigo-200 border-indigo-500/30 px-3 py-1">Administración de Usuarios</Badge>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-100 tracking-tight">Control de accesos</h1>
            <p className="text-slate-400 max-w-2xl">
              Gestiona usuarios, roles y permisos con una vista clara, consistente y profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
            <Card className="xl:col-span-4 bg-slate-900/70 border-slate-700/60 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.9)] rounded-2xl">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-slate-100 flex items-center gap-2 text-xl font-semibold">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Nuevo usuario
                </CardTitle>
                <p className="text-sm text-slate-400">Completa los datos para crear un nuevo acceso administrativo.</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleCreateUser}>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Datos de acceso</p>
                    <div className="space-y-2">
                      <Label htmlFor="user-email" className="text-slate-300">Correo</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="usuario@empresa.com"
                        required
                        className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user-password" className="text-slate-300">Contraseña</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Rol</p>
                    <div className="space-y-2">
                      <Label htmlFor="user-role" className="text-slate-300">Tipo de usuario</Label>
                      <select
                        id="user-role"
                        title="Seleccionar rol del usuario"
                        aria-label="Seleccionar rol del usuario"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                        value={role}
                        onChange={(event) => setRole(event.target.value as UserRole)}
                      >
                        <option value="CLIENT">CLIENT</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Permisos</p>
                    <div className="space-y-2">
                      <Label htmlFor="permissions" className="text-slate-300">
                        Permisos personalizados (separados por coma)
                      </Label>
                      <Input
                        id="permissions"
                        value={permissionsInput}
                        onChange={(event) => setPermissionsInput(event.target.value)}
                        placeholder="MANAGE_USERS,VIEW_REPORTS,EDIT_PRODUCTS"
                        className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11"
                      />
                    </div>
                    {parsedPermissions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {parsedPermissions.map((permission) => (
                          <Badge key={permission} className="bg-indigo-500/15 text-indigo-200 border-indigo-500/30 rounded-full">
                            <Shield className="h-3 w-3 mr-1" />
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label className="text-slate-300">Permisos rápidos</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {AVAILABLE_PERMISSIONS.map((permission) => {
                          const active = selectedPermissions.includes(permission)
                          return (
                            <button
                              key={permission}
                              type="button"
                              onClick={() => toggleCreatePermission(permission)}
                              className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                                active
                                  ? "border-indigo-500/70 bg-indigo-500/15 text-indigo-200"
                                  : "border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
                              }`}
                            >
                              {permission}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
                      <Label className="text-slate-400 text-xs">Permiso adicional (opcional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={customPermission}
                          onChange={(event) => setCustomPermission(event.target.value)}
                          placeholder="Agregar permiso custom (ej: EXPORT_DATA)"
                          className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11"
                        />
                        <Button type="button" variant="outline" onClick={addCustomPermission} className="border-slate-600 text-slate-200">
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedPermissions.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs text-slate-400 mb-2">Permisos seleccionados</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPermissions.map((permission) => (
                          <button
                            key={`selected-${permission}`}
                            type="button"
                            onClick={() => removeSelectedPermission(permission)}
                            className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-1 text-xs text-indigo-200 hover:bg-indigo-500/25"
                          >
                            {permission}
                            <X className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && <p className="text-sm text-red-300">{error}</p>}
                  {success && <p className="text-sm text-emerald-300">{success}</p>}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-[0_10px_20px_-12px_rgba(79,70,229,0.9)]"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Crear usuario"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="xl:col-span-8 bg-slate-900/70 border-slate-700/60 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.9)] rounded-2xl">
              <CardHeader className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-slate-100 text-xl font-semibold">Usuarios registrados</CardTitle>
                    <p className="text-sm text-slate-400">
                      Total: <span className="text-slate-200 font-medium">{users.length}</span>
                    </p>
                  </div>
                  <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleExportCsv}>
                    <Download className="h-4 w-4 mr-1" />
                    Exportar CSV
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Buscar por correo, rol o permiso..."
                    className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Rol</Label>
                    <select
                      title="Filtrar usuarios por rol"
                      aria-label="Filtrar usuarios por rol"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                    >
                      <option value="ALL">Todos los roles</option>
                      <option value="ADMIN">Solo ADMIN</option>
                      <option value="CLIENT">Solo CLIENT</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Orden</Label>
                    <select
                      title="Ordenar usuarios"
                      aria-label="Ordenar usuarios"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                    >
                      <option value="NEWEST">Mas recientes</option>
                      <option value="OLDEST">Mas antiguos</option>
                      <option value="EMAIL_ASC">Correo A-Z</option>
                      <option value="EMAIL_DESC">Correo Z-A</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">Estado de permisos</Label>
                    <select
                      title="Filtrar por estado de permisos"
                      aria-label="Filtrar por estado de permisos"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                      value={quickFilter}
                      onChange={(event) => setQuickFilter(event.target.value as QuickFilter)}
                    >
                      <option value="ALL">Todos</option>
                      <option value="ADMIN">Solo ADMIN</option>
                      <option value="CLIENT">Solo CLIENT</option>
                      <option value="WITH_PERMISSIONS">Con permisos</option>
                      <option value="WITHOUT_PERMISSIONS">Sin permisos</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-400">
                    Cargando usuarios...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center space-y-2">
                    <p className="text-slate-200 font-medium">No hay resultados para los filtros actuales</p>
                    <p className="text-sm text-slate-400">Prueba ajustando la búsqueda, el rol o el estado de permisos.</p>
                  </div>
                ) : (
                  paginatedUsers.map((user) => (
                    <div key={user.id} className="rounded-xl border border-slate-800 bg-slate-950/65 p-4 md:p-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-slate-100 font-semibold text-base break-all">{user.email}</p>
                        <Badge className={user.role === "ADMIN" ? "bg-rose-500/15 text-rose-200 border-rose-500/30" : "bg-slate-500/20 text-slate-200 border-slate-500/30"}>
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>Creado: {new Date(user.createdAt).toLocaleString()}</span>
                        <span>Permisos: {user.permissions.length}</span>
                        <span>{user.permissions.length > 0 ? "Estado: Configurado" : "Estado: Sin permisos"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.permissions.length > 0 ? (
                          user.permissions.map((permission) => (
                            <Badge key={`${user.id}-${permission}`} className="bg-indigo-500/15 text-indigo-200 border-indigo-500/30 rounded-full">
                              {permission}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">Sin permisos personalizados</span>
                        )}
                      </div>
                      {editingUserId === user.id ? (
                        <div className="mt-3 space-y-3 border-t border-slate-800 pt-3">
                          <div>
                            <Label className="text-slate-300 text-xs">Rol</Label>
                            <select
                              title="Editar rol del usuario"
                              aria-label="Editar rol del usuario"
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                              value={editRole}
                              onChange={(event) => setEditRole(event.target.value as UserRole)}
                            >
                              <option value="CLIENT">CLIENT</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-slate-300 text-xs">Permisos (coma)</Label>
                            <Input
                              value={editPermissionsInput}
                              onChange={(event) => setEditPermissionsInput(event.target.value)}
                              placeholder="MANAGE_USERS,VIEW_REPORTS"
                              className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300 text-xs">Nueva contraseña (opcional)</Label>
                            <Input
                              type="password"
                              value={editPassword}
                              onChange={(event) => setEditPassword(event.target.value)}
                              placeholder="Minimo 6 caracteres"
                              className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 h-10"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700"
                              size="sm"
                              onClick={() => void handleUpdateUser(user.id)}
                              disabled={actionLoadingId === user.id}
                            >
                              {actionLoadingId === user.id ? "Guardando..." : "Guardar"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={cancelEditingUser} className="border-slate-600 text-slate-200">
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEditingUser(user)} className="border-slate-600 text-slate-200 hover:bg-slate-800">
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                            Ver detalle
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-300 hover:bg-red-950/40"
                                disabled={actionLoadingId === user.id}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta accion eliminara el usuario {user.email}. No se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => void handleDeleteUser(user.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {!loading && sortedUsers.length > 0 && (
                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-200"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-200"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AdminBottomNav />
    </div>
  )
}
