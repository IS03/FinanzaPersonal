"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  const links = [
    {
      href: "/",
      label: "Resumen",
    },
    {
      href: "/gastos",
      label: "Gastos",
    },
    {
      href: "/ingresos",
      label: "Ingresos",
    },
    {
      href: "/tarjetas",
      label: "Tarjetas",
    },
    {
      href: "/cuotas",
      label: "Cuotas",
    },
    {
      href: "/deudas",
      label: "Deudas",
    },
    {
      href: "/categorias",
      label: "Categorías",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 ml-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
} 