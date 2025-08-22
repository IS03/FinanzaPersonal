import type { Gasto, Tarjeta } from "@/app/types/types"

// Validar si un gasto supera el saldo disponible de una tarjeta
export function validarSaldoTarjeta(gasto: Gasto, tarjetas: Tarjeta[]): { 
  esValido: boolean
  mensaje: string
  tarjeta?: Tarjeta
} {
  if (!gasto.tarjetaId || gasto.medioPago !== 'credito') {
    return { esValido: true, mensaje: "" }
  }

  const tarjeta = tarjetas.find(t => t.id === gasto.tarjetaId)
  if (!tarjeta) {
    return { 
      esValido: false, 
      mensaje: "Tarjeta no encontrada" 
    }
  }

  const saldoDisponible = tarjeta.saldoDisponible
  const montoGasto = gasto.monto

  if (montoGasto > saldoDisponible) {
    return {
      esValido: false,
      mensaje: `El gasto de ${formatCurrency(montoGasto)} supera el saldo disponible de ${formatCurrency(saldoDisponible)} en la tarjeta ${tarjeta.nombre}`,
      tarjeta
    }
  }

  return { esValido: true, mensaje: "", tarjeta }
}

// Validar campos obligatorios
export function validarCamposObligatorios(campos: Record<string, unknown>): {
  esValido: boolean
  camposFaltantes: string[]
} {
  const camposFaltantes: string[] = []
  
  Object.entries(campos).forEach(([campo, valor]) => {
    if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
      camposFaltantes.push(campo)
    }
  })

  return {
    esValido: camposFaltantes.length === 0,
    camposFaltantes
  }
}

// Validar formato de monto
export function validarMonto(monto: string): {
  esValido: boolean
  mensaje: string
  valor?: number
} {
  if (!monto || monto.trim() === '') {
    return { esValido: false, mensaje: "El monto es obligatorio" }
  }

  const valor = parseFloat(monto)
  if (isNaN(valor)) {
    return { esValido: false, mensaje: "El monto debe ser un número válido" }
  }

  if (valor <= 0) {
    return { esValido: false, mensaje: "El monto debe ser mayor a 0" }
  }

  return { esValido: true, mensaje: "", valor }
}

// Validar formato de fecha
export function validarFecha(fecha: string): {
  esValido: boolean
  mensaje: string
} {
  if (!fecha) {
    return { esValido: false, mensaje: "La fecha es obligatoria" }
  }

  const fechaObj = new Date(fecha)
  if (isNaN(fechaObj.getTime())) {
    return { esValido: false, mensaje: "Formato de fecha inválido" }
  }

  const hoy = new Date()
  if (fechaObj > hoy) {
    return { esValido: false, mensaje: "La fecha no puede ser futura" }
  }

  return { esValido: true, mensaje: "" }
}

// Validar cuotas
export function validarCuotas(cuotas: string, medioPago: string): {
  esValido: boolean
  mensaje: string
  valor?: number
} {
  if (medioPago !== 'credito') {
    return { esValido: true, mensaje: "" }
  }

  if (!cuotas || cuotas.trim() === '') {
    return { esValido: false, mensaje: "Debe especificar el número de cuotas para pagos con crédito" }
  }

  const valor = parseInt(cuotas)
  if (isNaN(valor)) {
    return { esValido: false, mensaje: "El número de cuotas debe ser un número válido" }
  }

  if (valor < 1 || valor > 60) {
    return { esValido: false, mensaje: "El número de cuotas debe estar entre 1 y 60" }
  }

  return { esValido: true, mensaje: "", valor }
}

// Función auxiliar para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
