"use client"

import { useTheme } from "@/app/context/ThemeContext"
import Image from "next/image"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  const { theme } = useTheme()

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={theme === 'light' ? '/img/icono-modoclaro.png' : '/img/icono-modooscuro.png'}
        alt="Finly Logo"
        width={96}
        height={96}
        className="transition-all duration-300 w-20 h-20 sm:w-24 sm:h-24"
        priority
      />
    </div>
  )
}
