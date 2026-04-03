"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Receipt, BarChart3, Home } from "lucide-react"

const navItems = [
  { href: "/", icon: Home, label: "Sitio" },
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/cotizaciones", icon: FileText, label: "Cotizar" },
  { href: "/admin/facturas", icon: Receipt, label: "Facturas" },
  { href: "/admin/reportes", icon: BarChart3, label: "Reportes" },
]

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800/50 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? "text-red-400 bg-red-600/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-red-400" : ""}`} />
              <span className={`text-[10px] mt-0.5 truncate ${isActive ? "font-medium" : ""}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
