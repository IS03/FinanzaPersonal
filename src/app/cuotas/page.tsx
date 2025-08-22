"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterSelect } from "@/components/ui/filter-select"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatCurrency, formatDate, cleanDuplicateData } from "@/lib/utils"
import type { Gasto, Tarjeta } from "@/app/types/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Calendar, DollarSign, CheckCircle, Clock, TrendingUp } from "lucide-react"

export default function CuotasPage() {
  const { toast, showToast, hideToast } = useToast()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [cuotaAMarcar, setCuotaAMarcar] = useState<{ gastoId: number; descripcion: string; monto: number } | null>(null)

  useEffect(() => {
    const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]')
    const savedTarjetas = JSON.parse(localStorage.getItem('tarjetas') || '[]')
    
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
    
    // Validar tarjetas
    const validTarjetas = savedTarjetas.filter((tarjeta: unknown) => 
      tarjeta && typeof tarjeta === 'object' && 
      tarjeta !== null &&
      'id' in tarjeta && typeof (tarjeta as Record<string, unknown>).id === 'number' && 
      'nombre' in tarjeta && typeof (tarjeta as Record<string, unknown>).nombre === 'string' && 
      'banco' in tarjeta && typeof (tarjeta as Record<string, unknown>).banco === 'string' &&
      'limite' in tarjeta && typeof (tarjeta as Record<string, unknown>).limite === 'number' &&
      'diaCierre' in tarjeta && typeof (tarjeta as Record<string, unknown>).diaCierre === 'number' &&
      'diaVencimiento' in tarjeta && typeof (tarjeta as Record<string, unknown>).diaVencimiento === 'number' &&
      'saldoUsado' in tarjeta && typeof (tarjeta as Record<string, unknown>).saldoUsado === 'number' &&
      'saldoDisponible' in tarjeta && typeof (tarjeta as Record<string, unknown>).saldoDisponible === 'number'
    ) as Tarjeta[]
    
    const cleanedGastos = cleanDuplicateData(validGastos)
    const cleanedTarjetas = cleanDuplicateData(validTarjetas)
    setGastos(cleanedGastos)
    setTarjetas(cleanedTarjetas)
  }, [])

  const gastosEnCuotas = gastos.filter(gasto => 
    gasto.medioPago === 'credito' && gasto.cuotas && gasto.tarjetaId
  )

  const abrirConfirmacionPago = (gastoId: number, descripcion: string, monto: number) => {
    setCuotaAMarcar({ gastoId, descripcion, monto })
    setIsConfirmDialogOpen(true)
  }

  const marcarCuotaComoPagada = () => {
    if (!cuotaAMarcar) return

    const gastosActualizados = gastos.map(gasto => {
      if (gasto.id === cuotaAMarcar.gastoId) {
        const cuotasPagadas = (gasto.cuotasPagadas || 0) + 1
        const estado: 'pendiente' | 'pagada' = cuotasPagadas === gasto.cuotas ? 'pagada' : 'pendiente'
        return {
          ...gasto,
          cuotasPagadas,
          estado
        }
      }
      return gasto
    })
    
    setGastos(gastosActualizados)
    localStorage.setItem('gastos', JSON.stringify(gastosActualizados))
    
    // Mostrar mensaje de éxito
    const montoPorCuota = cuotaAMarcar.monto / (gastos.find(g => g.id === cuotaAMarcar.gastoId)?.cuotas || 1)
    showToast(`Cuota de ${formatCurrency(montoPorCuota)} pagada con éxito ✅`, "success")
    
    // Limpiar estado
    setCuotaAMarcar(null)
  }

  // Función para calcular la fecha de vencimiento basada en la fecha de cierre
  const calcularFechaVencimiento = (fechaGasto: Date, tarjeta: Tarjeta, cuotaIndex: number) => {
    // Verificar que la tarjeta tenga los días configurados
    if (tarjeta.diaCierre === undefined || tarjeta.diaVencimiento === undefined) {
      // Si no están configurados, usar valores por defecto o retornar fecha actual
      console.warn(`Tarjeta ${tarjeta.nombre} no tiene configurados los días de cierre y vencimiento`)
      return new Date()
    }

    const fechaCierre = new Date(fechaGasto)
    fechaCierre.setDate(tarjeta.diaCierre)
    if (fechaCierre < fechaGasto) {
      fechaCierre.setMonth(fechaCierre.getMonth() + 1)
    }
    fechaCierre.setMonth(fechaCierre.getMonth() + cuotaIndex)
    fechaCierre.setDate(tarjeta.diaVencimiento)
    return fechaCierre
  }

  // Función para obtener todas las cuotas futuras
  const obtenerCuotasFuturas = () => {
    const fechaActual = new Date()
    const cuotasFuturas = gastosEnCuotas.flatMap(gasto => {
      const fechaGasto = new Date(gasto.fecha)
      const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
      const cuotasPendientes = gasto.cuotas || 0
      const cuotasPagadas = gasto.cuotasPagadas || 0
      const tarjeta = tarjetas.find(t => t.id === gasto.tarjetaId)
      
      if (!tarjeta) return []
      
      return Array.from({ length: cuotasPendientes }, (_, i) => {
        const fechaVencimiento = calcularFechaVencimiento(fechaGasto, tarjeta, i)
        return {
          fecha: fechaVencimiento,
          monto: montoPorCuota,
          gastoId: gasto.id,
          cuotaIndex: i,
          pagada: i < cuotasPagadas,
          descripcion: gasto.descripcion,
          tarjetaId: gasto.tarjetaId
        }
      }).filter(cuota => 
        cuota.fecha > fechaActual && !cuota.pagada
      )
    }).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())

    return cuotasFuturas
  }

  // Función para obtener las cuotas del mes seleccionado
  const obtenerCuotasDelMes = () => {
    return tarjetas.map(tarjeta => {
      const gastosDeTarjeta = gastosEnCuotas.filter(gasto => gasto.tarjetaId === tarjeta.id)
      const cuotasDelMes = gastosDeTarjeta.flatMap(gasto => {
        const fechaGasto = new Date(gasto.fecha)
        const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
        const cuotasPendientes = gasto.cuotas || 0
        const cuotasPagadas = gasto.cuotasPagadas || 0
        
        return Array.from({ length: cuotasPendientes }, (_, i) => {
          const fechaVencimiento = calcularFechaVencimiento(fechaGasto, tarjeta, i)
          return {
            fecha: fechaVencimiento,
            monto: montoPorCuota,
            gastoId: gasto.id,
            cuotaIndex: i,
            pagada: i < cuotasPagadas,
            descripcion: gasto.descripcion
          }
        }).filter(cuota => 
          cuota.fecha.getMonth() === selectedMonth && 
          cuota.fecha.getFullYear() === selectedYear
        )
      })

      const totalPendiente = cuotasDelMes
        .filter(cuota => !cuota.pagada)
        .reduce((acc, cuota) => acc + cuota.monto, 0)

      return {
        tarjeta,
        cuotas: cuotasDelMes,
        totalPendiente
      }
    }).filter(item => item.cuotas.length > 0)
  }

  const cuotasFuturas = obtenerCuotasFuturas()
  const cuotasDelMes = obtenerCuotasDelMes()

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header mejorado para móvil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Gastos en Cuotas</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <FilterSelect
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
            placeholder="Selecciona el mes"
            label="Mes"
            options={[
              { value: "0", label: "Enero" },
              { value: "1", label: "Febrero" },
              { value: "2", label: "Marzo" },
              { value: "3", label: "Abril" },
              { value: "4", label: "Mayo" },
              { value: "5", label: "Junio" },
              { value: "6", label: "Julio" },
              { value: "7", label: "Agosto" },
              { value: "8", label: "Septiembre" },
              { value: "9", label: "Octubre" },
              { value: "10", label: "Noviembre" },
              { value: "11", label: "Diciembre" }
            ]}
          />
          <FilterSelect
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
            placeholder="Selecciona el año"
            label="Año"
            options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => ({
              value: year.toString(),
              label: year.toString()
            }))}
          />
        </div>
      </div>

      <Tabs defaultValue="mes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 shadow-sm">
          <TabsTrigger value="mes" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cuotas del Mes
          </TabsTrigger>
          <TabsTrigger value="futuras" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Próximas Cuotas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mes" className="min-h-[300px]">
          {cuotasDelMes.length === 0 ? (
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">No hay cuotas para el mes seleccionado</p>
                <p className="text-xs sm:text-sm mt-2 text-muted-foreground">Intenta seleccionar un mes diferente o agregar gastos en cuotas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {cuotasDelMes.map(({ tarjeta, cuotas, totalPendiente }) => (
                <Card key={tarjeta.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 hover:border-l-orange-600">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/20">
                          <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{tarjeta.nombre}</p>
                          <p className="text-xs text-muted-foreground">{tarjeta.banco}</p>
                        </div>
                      </div>
                      <span className="text-base sm:text-lg text-orange-600 font-semibold">
                        Pendiente: {formatCurrency(totalPendiente)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {cuotas.map((cuota) => (
                        <Card key={`${cuota.gastoId}-${cuota.cuotaIndex}`} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500 hover:border-l-purple-600">
                          <CardHeader className="pb-3 sm:pb-4">
                            <CardTitle className="flex justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className={`p-1.5 rounded-full ${
                                  cuota.pagada 
                                    ? 'bg-green-100 dark:bg-green-900/20' 
                                    : 'bg-yellow-100 dark:bg-yellow-900/20'
                                }`}>
                                  {cuota.pagada ? (
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm truncate">{cuota.descripcion}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(cuota.fecha.toISOString())}
                                  </p>
                                </div>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3 sm:space-y-4">
                              {/* Monto de la cuota */}
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Monto por Cuota
                                </p>
                                <p className="text-lg sm:text-xl font-bold text-purple-600">
                                  {formatCurrency(cuota.monto)}
                                </p>
                              </div>

                              {/* Estado */}
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Estado</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  cuota.pagada 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                }`}>
                                  {cuota.pagada ? "Pagada" : "Pendiente"}
                                </span>
                              </div>

                              {/* Botón de acción */}
                              {!cuota.pagada && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => abrirConfirmacionPago(cuota.gastoId, cuota.descripcion, cuota.monto)}
                                  className="w-full"
                                >
                                  Marcar como Pagada
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="futuras" className="min-h-[300px]">
          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6">
              {cuotasFuturas.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-sm sm:text-base">No hay cuotas futuras pendientes</p>
                  <p className="text-xs sm:text-sm mt-2">Todas las cuotas están al día o no hay gastos en cuotas registrados</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {cuotasFuturas.map((cuota) => (
                    <Card key={`${cuota.gastoId}-${cuota.cuotaIndex}`} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600">
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="flex justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
                              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm sm:text-base truncate">{cuota.descripcion}</p>
                              <p className="text-xs text-muted-foreground">
                                {tarjetas.find(t => t.id === cuota.tarjetaId)?.nombre}
                              </p>
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3 sm:space-y-4">
                          {/* Monto de la cuota */}
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Monto por Cuota
                            </p>
                            <p className="text-lg sm:text-xl font-bold text-blue-600">
                              {formatCurrency(cuota.monto)}
                            </p>
                          </div>

                          {/* Fecha de vencimiento */}
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vencimiento
                            </p>
                            <p className="font-medium text-sm">
                              {formatDate(cuota.fecha.toISOString())}
                            </p>
                          </div>

                          {/* Botón de acción */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirConfirmacionPago(cuota.gastoId, cuota.descripcion, cuota.monto)}
                            className="w-full"
                          >
                            Marcar como Pagada
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Componente Toast para notificaciones */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Diálogo de confirmación para marcar cuota como pagada */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setCuotaAMarcar(null)
        }}
        onConfirm={marcarCuotaComoPagada}
        title="Confirmar pago de cuota"
        message={`¿Estás seguro de que deseas marcar como pagada la cuota de "${cuotaAMarcar?.descripcion}"?`}
        confirmText="Confirmar Pago"
        cancelText="Cancelar"
        variant="default"
      />
    </div>
  )
}
