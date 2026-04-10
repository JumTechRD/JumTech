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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-400/15 rounded-full blur-3xl" />
      </div>

      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="/images/logo-nuevo.jpeg" alt="JumTech RD Logo" width={36} height={36} className="rounded-lg" />
            <div>
              <span className="text-base font-bold text-white">JumTech RD</span>
              <Badge className="ml-2 bg-indigo-600/20 text-indigo-400 border-indigo-600/30 text-xs hidden sm:inline-flex">
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

      <div className="pt-20 pb-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <Badge className="mb-3 bg-indigo-600/20 text-indigo-400 border-indigo-600/30">Administración de Usuarios</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Control de accesos</h1>
            <p className="text-gray-300">
              Crea usuarios y define permisos personalizados según tu criterio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Nuevo usuario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateUser}>
                  <div className="space-y-2">
                    <Label htmlFor="user-email" className="text-gray-300">Correo</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="usuario@empresa.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-password" className="text-gray-300">Contraseña</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-role" className="text-gray-300">Rol</Label>
                    <select
                      id="user-role"
                      title="Seleccionar rol del usuario"
                      aria-label="Seleccionar rol del usuario"
                      className="w-full rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-white"
                      value={role}
                      onChange={(event) => setRole(event.target.value as UserRole)}
                    >
                      <option value="CLIENT">CLIENT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="permissions" className="text-gray-300">
                      Permisos personalizados (separados por coma)
                    </Label>
                    <Input
                      id="permissions"
                      value={permissionsInput}
                      onChange={(event) => setPermissionsInput(event.target.value)}
                      placeholder="MANAGE_USERS,VIEW_REPORTS,EDIT_PRODUCTS"
                    />
                    {parsedPermissions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {parsedPermissions.map((permission) => (
                          <Badge key={permission} className="bg-indigo-600/20 text-indigo-300 border-indigo-600/30">
                            <Shield className="h-3 w-3 mr-1" />
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Permisos rápidos</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AVAILABLE_PERMISSIONS.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center gap-2 rounded-md border border-gray-700/60 px-3 py-2 text-sm text-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => toggleCreatePermission(permission)}
                          />
                          {permission}
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={customPermission}
                        onChange={(event) => setCustomPermission(event.target.value)}
                        placeholder="Agregar permiso custom (ej: EXPORT_DATA)"
                      />
                      <Button type="button" variant="outline" onClick={addCustomPermission}>
                        Agregar
                      </Button>
                    </div>
                    {selectedPermissions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedPermissions.map((permission) => (
                          <Badge key={`selected-${permission}`} className="bg-indigo-600/20 text-indigo-300 border-indigo-600/30">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && <p className="text-sm text-red-300">{error}</p>}
                  {success && <p className="text-sm text-green-300">{success}</p>}

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
                    {saving ? "Guardando..." : "Crear usuario"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Usuarios registrados</CardTitle>
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Buscar por correo, rol o permiso..."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    title="Filtrar usuarios por rol"
                    aria-label="Filtrar usuarios por rol"
                    className="w-full rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-white text-sm"
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                  >
                    <option value="ALL">Todos los roles</option>
                    <option value="ADMIN">Solo ADMIN</option>
                    <option value="CLIENT">Solo CLIENT</option>
                  </select>
                  <select
                    title="Ordenar usuarios"
                    aria-label="Ordenar usuarios"
                    className="w-full rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-white text-sm"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                  >
                    <option value="NEWEST">Mas recientes</option>
                    <option value="OLDEST">Mas antiguos</option>
                    <option value="EMAIL_ASC">Correo A-Z</option>
                    <option value="EMAIL_DESC">Correo Z-A</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={quickFilter === "ALL" ? "default" : "outline"}
                    onClick={() => setQuickFilter("ALL")}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={quickFilter === "ADMIN" ? "default" : "outline"}
                    onClick={() => setQuickFilter("ADMIN")}
                  >
                    ADMIN
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={quickFilter === "CLIENT" ? "default" : "outline"}
                    onClick={() => setQuickFilter("CLIENT")}
                  >
                    CLIENT
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={quickFilter === "WITH_PERMISSIONS" ? "default" : "outline"}
                    onClick={() => setQuickFilter("WITH_PERMISSIONS")}
                  >
                    Con permisos
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={quickFilter === "WITHOUT_PERMISSIONS" ? "default" : "outline"}
                    onClick={() => setQuickFilter("WITHOUT_PERMISSIONS")}
                  >
                    Sin permisos
                  </Button>
                  <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleExportCsv}>
                    <Download className="h-4 w-4 mr-1" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <p className="text-gray-400">Cargando usuarios...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-gray-400">Aún no hay usuarios creados.</p>
                ) : (
                  paginatedUsers.map((user) => (
                    <div key={user.id} className="rounded-lg border border-gray-700/60 bg-black/30 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <p className="text-white font-medium">{user.email}</p>
                        <Badge className={user.role === "ADMIN" ? "bg-red-600/20 text-red-300 border-red-600/30" : "bg-gray-600/20 text-gray-300 border-gray-600/30"}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        Creado: {new Date(user.createdAt).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {user.permissions.length > 0 ? (
                          user.permissions.map((permission) => (
                            <Badge key={`${user.id}-${permission}`} className="bg-indigo-600/20 text-indigo-300 border-indigo-600/30">
                              {permission}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">Sin permisos personalizados</span>
                        )}
                      </div>
                      {editingUserId === user.id ? (
                        <div className="mt-3 space-y-3 border-t border-gray-700/60 pt-3">
                          <div>
                            <Label className="text-gray-300 text-xs">Rol</Label>
                            <select
                              title="Editar rol del usuario"
                              aria-label="Editar rol del usuario"
                              className="mt-1 w-full rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-white text-sm"
                              value={editRole}
                              onChange={(event) => setEditRole(event.target.value as UserRole)}
                            >
                              <option value="CLIENT">CLIENT</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-gray-300 text-xs">Permisos (coma)</Label>
                            <Input
                              value={editPermissionsInput}
                              onChange={(event) => setEditPermissionsInput(event.target.value)}
                              placeholder="MANAGE_USERS,VIEW_REPORTS"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-xs">Nueva contraseña (opcional)</Label>
                            <Input
                              type="password"
                              value={editPassword}
                              onChange={(event) => setEditPassword(event.target.value)}
                              placeholder="Minimo 6 caracteres"
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
                            <Button variant="outline" size="sm" onClick={cancelEditingUser}>
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEditingUser(user)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-300 hover:bg-red-900/30"
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
                    <p className="text-xs text-gray-400">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
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
