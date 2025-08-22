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
  const date = new Date(dateString)
  const monthName = date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  // Capitalizar el nombre del mes
  const parts = monthName.split(' ')
  if (parts.length >= 3) {
    parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    return parts.join(' ')
  }
  return monthName
}

export function getCurrentMonth(): string {
  const date = new Date()
  const monthName = date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long'
  })
  // Capitalizar el nombre del mes
  const parts = monthName.split(' ')
  if (parts.length >= 2) {
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    return parts.join(' ')
  }
  return monthName
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
