"use client"

import { Button } from "./button"
import { useTheme } from "@/app/context/ThemeContext"
import { Sun, Moon } from "lucide-react"
import { useEffect } from "react"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  // Tecla de acceso rápido (Ctrl/Cmd + T)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault()
        toggleTheme()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`theme-toggle flex items-center justify-center ${className}`}
      title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'} (Ctrl+T)`}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          }`}
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-sm">
          {theme === 'light' ? 'Oscuro' : 'Claro'}
        </span>
      )}
    </Button>
  )
}
