export interface Tarjeta {
  id: number
  nombre: string
  banco: string
  limite: number
  diaCierre: number // Día del mes en que cierra el resumen
  diaVencimiento: number // Día del mes en que vence el pago
  saldoUsado: number // Saldo actual usado de la tarjeta
  saldoDisponible: number // Saldo disponible de la tarjeta
}

export interface Gasto {
  id: number
  descripcion: string
  monto: number
  categoriaId: number
  medioPago: MedioPago
  fecha: string
  cuotas?: number
  cuotasPagadas?: number
  tarjetaId?: number
  estado?: 'pendiente' | 'pagada'
}

export interface Ingreso {
  id: number
  descripcion: string
  monto: number
  fecha: string
  fuente: string
}

export interface Cuota {
  id: number
  descripcion: string
  montoTotal: number
  cantidadCuotas: number
  cuotasPagadas: number
  montoPorCuota: number
  fechaInicio: string
  fechasVencimiento: string[]
  estado: 'pendiente' | 'pagada' | 'vencida'
}

export interface PagoDeuda {
  id: number
  monto: number
  fecha: string
  notas?: string
}

export interface Deuda {
  id: number
  descripcion: string
  monto: number
  montoPagado: number
  tipo: 'porCobrar' | 'porPagar'
  persona: string
  fecha: string
  estado: 'pendiente' | 'pagada' | 'parcial'
  fechaVencimiento?: string
  notas?: string
  historialPagos: PagoDeuda[]
}

export type MedioPago = 'efectivo' | 'debito' | 'credito' | 'transferencia' | 'otro'

export interface Categoria {
  id: number
  nombre: string
  emoji: string
}

export interface ResumenMensual {
  mes: string
  totalIngresos: number
  totalGastos: number
  balance: number
  gastosPorCategoria: Record<string, number>
  cuotasPendientes: number
  deudasPorCobrar: number
  deudasPorPagar: number
} 