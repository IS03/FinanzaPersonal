"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/app/context/ThemeContext"
import { Sun, Moon, Keyboard } from "lucide-react"

export function ThemeNotification() {
  const { theme } = useTheme()
  const [showNotification, setShowNotification] = useState(false)


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        setShowNotification(true)
        
        // Ocultar notificación después de 2 segundos
        setTimeout(() => {
          setShowNotification(false)
        }, 2000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!showNotification) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[280px]">
        <div className="flex items-center gap-2">
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-blue-600" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-500" />
          )}
          <span className="font-medium">
            Cambiado a modo {theme === 'light' ? 'claro' : 'oscuro'}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ctrl+T</span>
        </div>
      </div>
    </div>
  )
}
