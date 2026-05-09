import Image from "next/image"
import React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showIcon?: boolean
}

export function Logo({ size = "md", className = "", showIcon = false }: LogoProps) {
  const sizeClasses = {
    sm: "w-[96px] sm:w-[112px]",
    md: "w-[120px] sm:w-[140px]",
    lg: "w-[156px] sm:w-[184px]",
    xl: "w-[190px] sm:w-[232px]",
  }

  return (
    <div className={`flex items-center ${showIcon ? "gap-2" : ""} ${className}`}>
      {showIcon && (
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
      )}
      <div className={`relative shrink-0 aspect-[838/552] ${sizeClasses[size]}`}>
        <Image
          src="/images/logo-nuevo-transparente.png"
          alt="JumTech RD"
          fill
          priority
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 184px, 232px"
          className="object-contain drop-shadow-[0_8px_22px_rgba(227,29,52,0.18)]"
        />
      </div>
    </div>
  )
}
