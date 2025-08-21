import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
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

export function calculateMonthlyStats(gastos: Array<{ monto: number }>, ingresos: Array<{ monto: number }>) {
  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0)
  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0)
  const balance = totalIngresos - totalGastos

  return {
    totalGastos,
    totalIngresos,
    balance
  }
}

// Función para limpiar datos duplicados y asegurar IDs únicos
export function cleanDuplicateData<T extends { id: number }>(data: T[]): T[] {
  const seen = new Set<number>()
  const cleaned: T[] = []
  let nextId = 1

  for (const item of data) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      cleaned.push(item)
    } else {
      // Si el ID ya existe, asignar un nuevo ID único
      const newItem = { ...item, id: nextId }
      while (seen.has(nextId)) {
        nextId++
      }
      seen.add(nextId)
      cleaned.push(newItem)
      nextId++
    }
  }

  return cleaned
}
