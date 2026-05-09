import React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showIcon?: boolean
}

export function Logo({ size = "md", className = "", showIcon = false }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <div className={`flex items-center ${showIcon ? "space-x-2" : ""} ${className}`}>
      {showIcon && (
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
      )}
      <span className={`font-bold ${sizeClasses[size]}`}>
        <span className="text-white">Jum</span>
        <span className="text-red-500">Tech</span>
        <span className="text-white"> RD</span>
      </span>
    </div>
  )
}
