"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FilterSelect } from "@/components/ui/filter-select"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatCurrency, formatDate, cleanDuplicateData } from "@/lib/utils"
import type { Gasto, Tarjeta } from "@/app/types/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    <div className="space-y-4 sm:space-y-6 overflow-y-auto scrollbar-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Gastos en Cuotas</h2>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mes">Cuotas del Mes</TabsTrigger>
          <TabsTrigger value="futuras">Próximas Cuotas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mes" className="min-h-[300px]">
          {cuotasDelMes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm sm:text-base">No hay cuotas para el mes seleccionado</p>
                  <p className="text-xs sm:text-sm mt-2">Intenta seleccionar un mes diferente o agregar gastos en cuotas</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {cuotasDelMes.map(({ tarjeta, cuotas, totalPendiente }) => (
              <Card key={tarjeta.id}>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-sm sm:text-base">{tarjeta.nombre} - {tarjeta.banco}</span>
                    <span className="text-base sm:text-lg text-orange-600 font-semibold">
                      Pendiente: {formatCurrency(totalPendiente)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Vista móvil para cuotas */}
                  <div className="block sm:hidden space-y-3">
                    {cuotas.map((cuota) => (
                      <Card key={`${cuota.gastoId}-${cuota.cuotaIndex}`} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{cuota.descripcion}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              cuota.pagada 
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {cuota.pagada ? "Pagada" : "Pendiente"}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {formatCurrency(cuota.monto)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Vencimiento: {formatDate(cuota.fecha.toISOString())}
                          </div>
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
                      </Card>
                    ))}
                  </div>

                  {/* Vista desktop para cuotas */}
                  <div className="hidden sm:block">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Monto por Cuota</TableHead>
                            <TableHead>Fecha de Vencimiento</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cuotas.map((cuota) => (
                            <TableRow key={`${cuota.gastoId}-${cuota.cuotaIndex}`}>
                              <TableCell>{cuota.descripcion}</TableCell>
                              <TableCell>{formatCurrency(cuota.monto)}</TableCell>
                              <TableCell>{formatDate(cuota.fecha.toISOString())}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  cuota.pagada 
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {cuota.pagada ? "Pagada" : "Pendiente"}
                                </span>
                              </TableCell>
                              <TableCell>
                                {!cuota.pagada && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => abrirConfirmacionPago(cuota.gastoId, cuota.descripcion, cuota.monto)}
                                  >
                                    Marcar como Pagada
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="futuras" className="min-h-[300px]">
          <Card>
            <CardContent className="pt-6">
              {/* Vista móvil para cuotas futuras */}
              <div className="block sm:hidden space-y-3">
                {cuotasFuturas.map((cuota) => (
                  <Card key={`${cuota.gastoId}-${cuota.cuotaIndex}`} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{cuota.descripcion}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tarjetas.find(t => t.id === cuota.tarjetaId)?.nombre}
                          </p>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(cuota.monto)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vencimiento: {formatDate(cuota.fecha.toISOString())}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirConfirmacionPago(cuota.gastoId, cuota.descripcion, cuota.monto)}
                        className="w-full"
                      >
                        Marcar como Pagada
                      </Button>
                    </div>
                  </Card>
                ))}
                {cuotasFuturas.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <p className="text-sm sm:text-base">No hay cuotas futuras pendientes</p>
                    <p className="text-xs sm:text-sm mt-2">Todas las cuotas están al día o no hay gastos en cuotas registrados</p>
                  </div>
                )}
              </div>

              {/* Vista desktop para cuotas futuras */}
              <div className="hidden sm:block">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Tarjeta</TableHead>
                        <TableHead>Monto por Cuota</TableHead>
                        <TableHead>Fecha de Vencimiento</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuotasFuturas.map((cuota) => (
                        <TableRow key={`${cuota.gastoId}-${cuota.cuotaIndex}`}>
                          <TableCell>{cuota.descripcion}</TableCell>
                          <TableCell>
                            {tarjetas.find(t => t.id === cuota.tarjetaId)?.nombre}
                          </TableCell>
                          <TableCell>{formatCurrency(cuota.monto)}</TableCell>
                          <TableCell>{formatDate(cuota.fecha.toISOString())}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirConfirmacionPago(cuota.gastoId, cuota.descripcion, cuota.monto)}
                            >
                              Marcar como Pagada
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {cuotasFuturas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                            <div>
                              <p className="text-sm sm:text-base">No hay cuotas futuras pendientes</p>
                              <p className="text-xs sm:text-sm mt-2">Todas las cuotas están al día o no hay gastos en cuotas registrados</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
