"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { Button } from "./button"
import { ThemeToggle } from "./theme-toggle"

export function MainNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

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

  // Función para cerrar el menú con animación
  const closeMenu = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsMobileMenuOpen(false)
      setIsClosing(false)
      document.body.style.overflow = 'unset'
    }, 300)
  }, [])

  // Función para abrir el menú
  const openMenu = () => {
    setIsMobileMenuOpen(true)
    setIsClosing(false)
    document.body.style.overflow = 'hidden'
  }

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    if (isMobileMenuOpen) {
      closeMenu()
    }
  }, [pathname, isMobileMenuOpen, closeMenu])

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden sm:flex items-center gap-4 lg:gap-6">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-all duration-200 relative py-2 px-3 rounded-md",
                "hover:text-primary hover:scale-105 hover:bg-accent/50",
                isActive
                  ? "text-primary font-semibold bg-accent"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Mobile Menu Button */}
      <div className="sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => isMobileMenuOpen ? closeMenu() : openMenu()}
          className="h-10 w-10 menu-button flex items-center justify-center"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 menu-icon" />
          ) : (
            <Menu className="h-5 w-5 menu-icon" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div 
            className={cn(
              "absolute inset-0 bg-black/20 backdrop-blur-sm mobile-menu-backdrop",
              isClosing && "closing"
            )}
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className={cn(
            "absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l mobile-menu-panel",
            isClosing && "closing"
          )}>
            <div className="flex flex-col h-full">
                                       {/* Header */}
                         <div className="flex items-center justify-between p-4 border-b menu-header">
                           <h2 className="text-lg font-semibold">Menú</h2>
                           <div className="flex items-center gap-2">
                             <ThemeToggle />
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={closeMenu}
                               className="h-8 w-8 menu-button flex items-center justify-center"
                             >
                               <X className="h-4 w-4 menu-icon" />
                             </Button>
                           </div>
                         </div>
              
              {/* Navigation Links */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMenu}
                        className={cn(
                          "flex items-center px-4 py-3 rounded-lg text-base font-medium menu-link menu-link-item",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {link.label}
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full active-indicator" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 