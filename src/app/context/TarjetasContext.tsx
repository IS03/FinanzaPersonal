"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Tarjeta, Gasto } from '@/app/types/types'
import { cleanDuplicateData } from '@/lib/utils'

interface TarjetasContextType {
  tarjetas: Tarjeta[]
  setTarjetas: (tarjetas: Tarjeta[]) => void
  agregarTarjeta: (tarjeta: Tarjeta) => void
  actualizarTarjeta: (tarjeta: Tarjeta) => void
  eliminarTarjeta: (id: number) => void
  actualizarSaldosTarjetas: (gastos: Gasto[]) => void
}

const TarjetasContext = createContext<TarjetasContextType | undefined>(undefined)

export function TarjetasProvider({ children }: { children: ReactNode }) {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])

  // Cargar tarjetas desde localStorage al iniciar
  useEffect(() => {
    const savedTarjetas = JSON.parse(localStorage.getItem('tarjetas') || '[]')
    
    // Validar que los datos tengan la estructura correcta de Tarjeta
    const validTarjetas = savedTarjetas.filter((tarjeta: unknown) => 
      tarjeta && typeof tarjeta === 'object' && 
      tarjeta !== null &&
      'id' in tarjeta && typeof (tarjeta as Record<string, unknown>).id === 'number' && 
      'nombre' in tarjeta && typeof (tarjeta as Record<string, unknown>).nombre === 'string' && 
      'banco' in tarjeta && typeof (tarjeta as Record<string, unknown>).banco === 'string' &&
      'tipo' in tarjeta && typeof (tarjeta as Record<string, unknown>).tipo === 'string' &&
      'limite' in tarjeta && typeof (tarjeta as Record<string, unknown>).limite === 'number' &&
      'saldoUsado' in tarjeta && typeof (tarjeta as Record<string, unknown>).saldoUsado === 'number' &&
      'saldoDisponible' in tarjeta && typeof (tarjeta as Record<string, unknown>).saldoDisponible === 'number'
    ) as Tarjeta[]
    
    const cleanedTarjetas = cleanDuplicateData(validTarjetas)
    setTarjetas(cleanedTarjetas)
  }, [])

  // Guardar tarjetas en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('tarjetas', JSON.stringify(tarjetas))
  }, [tarjetas])

  const agregarTarjeta = useCallback((tarjeta: Tarjeta) => {
    setTarjetas(prevTarjetas => [...prevTarjetas, tarjeta])
  }, [])

  const actualizarTarjeta = useCallback((tarjetaActualizada: Tarjeta) => {
    setTarjetas(prevTarjetas => 
      prevTarjetas.map(t => t.id === tarjetaActualizada.id ? tarjetaActualizada : t)
    )
  }, [])

  const eliminarTarjeta = useCallback((id: number) => {
    setTarjetas(prevTarjetas => prevTarjetas.filter(t => t.id !== id))
  }, [])

  const actualizarSaldosTarjetas = useCallback((gastos: Gasto[]) => {
    setTarjetas(prevTarjetas => {
      return prevTarjetas.map(tarjeta => {
        const gastosTarjeta = gastos.filter(g => g.tarjetaId === tarjeta.id)
        const saldoUsado = gastosTarjeta.reduce((acc, gasto) => {
          // Para tarjetas de crédito, descontamos el monto total del gasto
          if (gasto.medioPago === 'credito') {
            return acc + gasto.monto
          }
          // Para otros medios de pago, descontamos el monto normal
          return acc + gasto.monto
        }, 0)
        
        return {
          ...tarjeta,
          saldoUsado,
          saldoDisponible: tarjeta.limite - saldoUsado
        }
      })
    })
  }, [])

  return (
    <TarjetasContext.Provider value={{ 
      tarjetas, 
      setTarjetas, 
      agregarTarjeta, 
      actualizarTarjeta, 
      eliminarTarjeta,
      actualizarSaldosTarjetas
    }}>
      {children}
    </TarjetasContext.Provider>
  )
}

export function useTarjetas() {
  const context = useContext(TarjetasContext)
  if (context === undefined) {
    throw new Error('useTarjetas debe ser usado dentro de un TarjetasProvider')
  }
  return context
} 