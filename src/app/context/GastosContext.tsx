"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Gasto } from '@/app/types/types'
import { cleanDuplicateData } from '@/lib/utils'

interface GastosContextType {
  gastos: Gasto[]
  setGastos: (gastos: Gasto[]) => void
  agregarGasto: (gasto: Gasto) => void
  actualizarGasto: (gasto: Gasto) => void
  eliminarGasto: (id: number) => void
  cargarGastos: () => void
  gastoEnEdicion: Gasto | null
  setGastoEnEdicion: (gasto: Gasto | null) => void
}

const GastosContext = createContext<GastosContextType | undefined>(undefined)

export function GastosProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [gastoEnEdicion, setGastoEnEdicion] = useState<Gasto | null>(null)

  // Cargar gastos desde localStorage al iniciar
  useEffect(() => {
    cargarGastos()
  }, [])

  // Guardar gastos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('gastos', JSON.stringify(gastos))
  }, [gastos])

  const cargarGastos = useCallback(() => {
    const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]')
    
    // Validar gastos
    const validGastos = savedGastos.filter((gasto: unknown) => 
      gasto && typeof gasto === 'object' && 
      gasto !== null &&
      'id' in gasto && typeof (gasto as Record<string, unknown>).id === 'number' &&
      'descripcion' in gasto && typeof (gasto as Record<string, unknown>).descripcion === 'string' &&
      'monto' in gasto && typeof (gasto as Record<string, unknown>).monto === 'number' &&
      'categoriaId' in gasto && typeof (gasto as Record<string, unknown>).categoriaId === 'number' &&
      'medioPago' in gasto && typeof (gasto as Record<string, unknown>).medioPago === 'string' &&
      'fecha' in gasto && typeof (gasto as Record<string, unknown>).fecha === 'string'
    ) as Gasto[]
    
    const cleanedGastos = cleanDuplicateData(validGastos)
    setGastos(cleanedGastos)
  }, [])

  const agregarGasto = useCallback((gasto: Gasto) => {
    setGastos(prevGastos => [...prevGastos, gasto])
  }, [])

  const actualizarGasto = useCallback((gastoActualizado: Gasto) => {
    setGastos(prevGastos => 
      prevGastos.map(g => g.id === gastoActualizado.id ? gastoActualizado : g)
    )
  }, [])

  const eliminarGasto = useCallback((id: number) => {
    setGastos(prevGastos => prevGastos.filter(g => g.id !== id))
  }, [])

  return (
    <GastosContext.Provider value={{ 
      gastos, 
      setGastos, 
      agregarGasto, 
      actualizarGasto, 
      eliminarGasto,
      cargarGastos,
      gastoEnEdicion,
      setGastoEnEdicion
    }}>
      {children}
    </GastosContext.Provider>
  )
}

export function useGastos() {
  const context = useContext(GastosContext)
  if (context === undefined) {
    throw new Error('useGastos must be used within a GastosProvider')
  }
  return context
}
