"use client"

import { Button } from "./button"
import { Plus } from "lucide-react"
import { useGastoModal } from "@/app/context/GastoModalContext"

interface FloatingActionButtonProps {
  label?: string
  icon?: React.ReactNode
}

export function FloatingActionButton({ 
  label = "Agregar gasto", 
  icon = <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200" />
}: FloatingActionButtonProps) {
  const { openModal } = useGastoModal()

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 floating-button">
      <Button
        size="icon"
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-primary hover:bg-primary/90 floating-action-btn"
        title={label}
        onClick={openModal}
      >
        <div className="floating-icon">
          {icon}
        </div>
      </Button>
    </div>
  )
}
