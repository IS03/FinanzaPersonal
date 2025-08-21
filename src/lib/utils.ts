import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getCurrentMonth(): string {
  return new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long'
  })
}

import type { Gasto, Ingreso } from "@/app/types/types"

export function calculateMonthlyStats(gastos: Gasto[], ingresos: Ingreso[]) {
  const totalGastos = gastos.reduce((acc, gasto) => acc + gasto.monto, 0)
  const totalIngresos = ingresos.reduce((acc, ingreso) => acc + ingreso.monto, 0)
  const balance = totalIngresos - totalGastos

  const gastosPorCategoria = gastos.reduce((acc: Record<string, number>, gasto) => {
    const key = String(gasto.categoriaId)
    acc[key] = (acc[key] || 0) + gasto.monto
    return acc
  }, {})

  return {
    totalGastos,
    totalIngresos,
    balance,
    gastosPorCategoria
  }
}
