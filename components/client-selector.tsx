"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, Search, UserRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ClientRecord } from "@/lib/admin-clients"

interface ClientSelectorProps {
  clients: ClientRecord[]
  selectedClientId: string | null
  onSelect: (client: ClientRecord | null) => void
  label?: string
  description?: string
}

export function ClientSelector({
  clients,
  selectedClientId,
  onSelect,
  label = "Cliente",
  description = "Selecciona un cliente para autocompletar los datos o continúa manualmente.",
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null

  const filteredClients = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return clients

    return clients.filter((client) => {
      const haystack = [
        client.name,
        client.email,
        client.phone,
        client.companyName || "",
        client.identification || "",
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [clients, search])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        {selectedClient && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect(null)
              setSearch("")
            }}
            className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {selectedClient ? (
        <div className="rounded-lg border border-blue-500/30 bg-blue-600/10 p-3 text-sm text-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white">{selectedClient.name}</p>
              <p className="text-gray-300 break-all">{selectedClient.email}</p>
              <p className="text-gray-400">{selectedClient.phone}</p>
              {selectedClient.companyName && <p className="text-gray-400">{selectedClient.companyName}</p>}
              {selectedClient.identification && <p className="text-gray-400">ID: {selectedClient.identification}</p>}
            </div>
            <Check className="h-5 w-5 text-blue-300 shrink-0" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400">{description}</p>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-lg border border-gray-600 bg-white/5 px-4 py-3 text-left text-sm text-white hover:bg-white/10"
        >
          <span className="flex items-center gap-2 min-w-0">
            <UserRound className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="truncate">{selectedClient ? "Cambiar cliente" : "Buscar cliente"}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        </button>

        {open && (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-gray-700 bg-slate-950 shadow-2xl">
            <div className="border-b border-gray-800 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, correo, teléfono o empresa"
                  className="pl-10 bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="p-4 text-sm text-gray-400">No hay clientes que coincidan con la búsqueda.</div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      onSelect(client)
                      setOpen(false)
                      setSearch("")
                    }}
                    className="flex w-full items-start gap-3 border-b border-gray-800 px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/5"
                  >
                    <UserRound className="mt-0.5 h-4 w-4 text-blue-400 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium text-white">{client.name}</span>
                      <span className="block truncate text-gray-400">{client.email}</span>
                      <span className="block text-gray-500">{client.phone}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
