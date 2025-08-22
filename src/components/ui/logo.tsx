"use client"

import { useTheme } from "@/app/context/ThemeContext"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar hidratación incorrecta mostrando un estado inicial
  if (!mounted) {
    return (
      <Link href="/" className={`flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200 ${className}`}>
        <Image
          src="/img/icono-modoclaro.png"
          alt="Findly Logo"
          width={96}
          height={96}
          className="transition-all duration-300 w-20 h-20 sm:w-24 sm:h-24"
          priority
        />
      </Link>
    )
  }

  return (
    <Link href="/" className={`flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200 ${className}`}>
      <Image
        src={theme === 'light' ? '/img/icono-modoclaro.png' : '/img/icono-modooscuro.png'}
        alt="Findly Logo"
        width={96}
        height={96}
        className="transition-all duration-300 w-20 h-20 sm:w-24 sm:h-24"
        priority
      />
    </Link>
  )
}
