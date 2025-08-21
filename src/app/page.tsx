"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, calculateMonthlyStats, cleanDuplicateData } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Gasto, Tarjeta, Ingreso } from "@/app/types/types"

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]')
      const savedTarjetas = JSON.parse(localStorage.getItem('tarjetas') || '[]')
      const savedIngresos = JSON.parse(localStorage.getItem('ingresos') || '[]')
      const cleanedGastos = cleanDuplicateData(savedGastos)
      const cleanedTarjetas = cleanDuplicateData(savedTarjetas)
      const cleanedIngresos = cleanDuplicateData(savedIngresos)
      setGastos(cleanedGastos)
      setTarjetas(cleanedTarjetas)
      setIngresos(cleanedIngresos)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const gastosDelMes = gastos.filter(gasto => {
    try {
      const fechaGasto = new Date(gasto.fecha)
      const coincideMes = selectedMonth === null || fechaGasto.getMonth() === selectedMonth
      return coincideMes && fechaGasto.getFullYear() === selectedYear
    } catch (error) {
      console.error("Error al procesar fecha:", gasto.fecha, error)
      return false
    }
  })

  const ingresosDelMes = ingresos.filter(ingreso => {
    try {
      const fechaIngreso = new Date(ingreso.fecha)
      const coincideMes = selectedMonth === null || fechaIngreso.getMonth() === selectedMonth
      return coincideMes && fechaIngreso.getFullYear() === selectedYear
    } catch (error) {
      console.error("Error al procesar fecha de ingreso:", ingreso.fecha, error)
      return false
    }
  })

  const gastosEnCuotas = gastos.filter(gasto => 
    gasto.medioPago === 'credito' && gasto.cuotas && gasto.tarjetaId
  )

  const calcularCuotasPendientes = () => {
    return gastosEnCuotas.reduce((total, gasto) => {
      try {
        const fechaGasto = new Date(gasto.fecha)
        const tarjeta = tarjetas.find(t => t.id === gasto.tarjetaId)
        if (!tarjeta) return total

        const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
        const cuotasPagadas = gasto.cuotasPagadas || 0
        
        const cuotasPendientes = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
          const fechaCuota = new Date(fechaGasto)
          
          // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
          if (fechaGasto.getDate() > tarjeta.diaCierre) {
            fechaCuota.setMonth(fechaCuota.getMonth() + 1)
          }
          
          // Añadimos los meses correspondientes a la cuota
          fechaCuota.setMonth(fechaCuota.getMonth() + i)
          
          // Establecemos la fecha de vencimiento
          fechaCuota.setDate(tarjeta.diaVencimiento)
          
          return {
            fecha: fechaCuota,
            monto: montoPorCuota,
            cuotaIndex: i
          }
        }).filter(cuota => 
          (selectedMonth === null || cuota.fecha.getMonth() === selectedMonth) && 
          cuota.fecha.getFullYear() === selectedYear &&
          cuota.cuotaIndex >= cuotasPagadas // Solo cuotas no pagadas
        )
        return total + cuotasPendientes.reduce((acc, cuota) => acc + cuota.monto, 0)
      } catch (error) {
        console.error("Error al calcular cuotas para gasto:", gasto.id, error)
        return total
      }
    }, 0)
  }

  const stats = calculateMonthlyStats(gastosDelMes, ingresosDelMes)
  const cuotasPendientes = calcularCuotasPendientes()

  const calcularCuotasPagadas = () => {
    return gastosEnCuotas.reduce((total, gasto) => {
      try {
        const fechaGasto = new Date(gasto.fecha)
        const tarjeta = tarjetas.find(t => t.id === gasto.tarjetaId)
        if (!tarjeta) return total

        const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
        const cuotasPagadas = gasto.cuotasPagadas || 0
        
        const cuotasPagadasDelPeriodo = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
          const fechaCuota = new Date(fechaGasto)
          
          // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
          if (fechaGasto.getDate() > tarjeta.diaCierre) {
            fechaCuota.setMonth(fechaCuota.getMonth() + 1)
          }
          
          // Añadimos los meses correspondientes a la cuota
          fechaCuota.setMonth(fechaCuota.getMonth() + i)
          
          // Establecemos la fecha de vencimiento
          fechaCuota.setDate(tarjeta.diaVencimiento)
          
          return {
            fecha: fechaCuota,
            monto: montoPorCuota,
            cuotaIndex: i
          }
        }).filter(cuota => 
          (selectedMonth === null || cuota.fecha.getMonth() === selectedMonth) && 
          cuota.fecha.getFullYear() === selectedYear &&
          cuota.cuotaIndex < cuotasPagadas // Solo cuotas pagadas
        )
        return total + cuotasPagadasDelPeriodo.reduce((acc, cuota) => acc + cuota.monto, 0)
      } catch (error) {
        console.error("Error al calcular cuotas pagadas para gasto:", gasto.id, error)
        return total
      }
    }, 0)
  }

  const cuotasPagadas = calcularCuotasPagadas()

  // Generar meses para el selector
  const meses = [
    { value: 'year', label: 'Año completo' },
    ...Array.from({ length: 12 }, (_, i) => {
      const fecha = new Date(2024, i)
      return {
        value: i.toString(),
        label: fecha.toLocaleDateString('es', { month: 'long' })
      }
    })
  ]

  // Generar años para el selector (desde el año actual hasta 5 años en el futuro)
  const añoActual = new Date().getFullYear()
  const años = Array.from({ length: 5 }, (_, i) => {
    const año = añoActual + i
    return {
      value: año.toString(),
      label: año.toString()
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Finly - Resumen Financiero</h2>
        <div className="flex gap-4">
          <Select 
            value={selectedMonth === null ? 'year' : selectedMonth.toString()} 
            onValueChange={(v) => setSelectedMonth(v === 'year' ? null : parseInt(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona mes" />
            </SelectTrigger>
            <SelectContent className="max-h-[100px] scrollbar-hidden">
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedYear.toString()} 
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Selecciona año" />
            </SelectTrigger>
            <SelectContent className="max-h-[100px] scrollbar-hidden">
              {años.map((año) => (
                <SelectItem key={año.value} value={año.value}>
                  {año.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedMonth === null ? 'Gastos del Año' : 'Gastos del Mes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalGastos)}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastosDelMes.length} gastos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedMonth === null ? 'Cuotas Pendientes del Año' : 'Cuotas Pendientes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(cuotasPendientes)}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth === null ? 'Vencimientos del año' : 'Vencimientos del mes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedMonth === null ? 'Ingresos del Año' : 'Ingresos del Mes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalIngresos)}
            </div>
            <p className="text-xs text-muted-foreground">
              {ingresosDelMes.length} ingresos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedMonth === null ? 'Balance del Año' : 'Balance del Mes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.balance >= 0 ? 'Superávit' : 'Déficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedMonth === null ? 'Cuotas Pagadas del Año' : 'Cuotas Pagadas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(cuotasPagadas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMonth === null ? 'Pagadas del año' : 'Pagadas del mes'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendientes">Cuotas Pendientes</TabsTrigger>
          <TabsTrigger value="pagadas">Cuotas Pagadas</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes" className="space-y-4">
          {tarjetas.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No hay tarjetas registradas. Ve a la sección &quot;Tarjetas&quot; para agregar tarjetas de crédito.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tarjetas.filter((tarjeta, index, self) => 
                index === self.findIndex(t => t.id === tarjeta.id)
              ).map(tarjeta => {
                const gastosDeTarjeta = gastosEnCuotas.filter(gasto => gasto.tarjetaId === tarjeta.id)
                const cuotasPendientesTarjeta = gastosDeTarjeta.reduce((total, gasto) => {
                  try {
                    const fechaGasto = new Date(gasto.fecha)
                    const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
                    const cuotasPagadas = gasto.cuotasPagadas || 0
                    const cuotasPendientes = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
                      const fechaCuota = new Date(fechaGasto)
                      
                      // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
                      if (fechaGasto.getDate() > tarjeta.diaCierre) {
                        fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                      }
                      
                      // Añadimos los meses correspondientes a la cuota
                      fechaCuota.setMonth(fechaCuota.getMonth() + i)
                      
                      // Establecemos la fecha de vencimiento
                      fechaCuota.setDate(tarjeta.diaVencimiento)
                      
                      return {
                        fecha: fechaCuota,
                        monto: montoPorCuota,
                        cuotaIndex: i
                      }
                    }).filter(cuota => 
                      (selectedMonth === null || cuota.fecha.getMonth() === selectedMonth) && 
                      cuota.fecha.getFullYear() === selectedYear &&
                      cuota.cuotaIndex >= cuotasPagadas // Solo cuotas no pagadas
                    )
                    return total + cuotasPendientes.reduce((acc, cuota) => acc + cuota.monto, 0)
                  } catch (error) {
                    console.error("Error al calcular cuotas para tarjeta:", tarjeta.id, error)
                    return total
                  }
                }, 0)

                if (cuotasPendientesTarjeta === 0) return null

                return (
                  <Card key={tarjeta.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {tarjeta.nombre} - {tarjeta.banco}
                        <span className="text-lg text-orange-600">
                          {formatCurrency(cuotasPendientesTarjeta)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {gastosDeTarjeta.map(gasto => {
                          try {
                            const fechaGasto = new Date(gasto.fecha)
                            const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
                            const cuotasPagadas = gasto.cuotasPagadas || 0
                            const cuotasPendientes = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
                              const fechaCuota = new Date(fechaGasto)
                              
                              // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
                              if (fechaGasto.getDate() > tarjeta.diaCierre) {
                                fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                              }
                              
                              // Añadimos los meses correspondientes a la cuota
                              fechaCuota.setMonth(fechaCuota.getMonth() + i)
                              
                              // Establecemos la fecha de vencimiento
                              fechaCuota.setDate(tarjeta.diaVencimiento)
                              
                              return {
                                fecha: fechaCuota,
                                monto: montoPorCuota,
                                cuotaIndex: i
                              }
                            }).filter(cuota => 
                              (selectedMonth === null || cuota.fecha.getMonth() === selectedMonth) && 
                              cuota.fecha.getFullYear() === selectedYear &&
                              cuota.cuotaIndex >= cuotasPagadas // Solo cuotas no pagadas
                            )

                            if (cuotasPendientes.length === 0) return null

                            return (
                              <div key={`gasto-${gasto.id}-${selectedMonth ?? 'year'}-${selectedYear}`} className="flex justify-between items-center text-sm">
                                <span>{gasto.descripcion}</span>
                                <span className="text-orange-600">
                                  {formatCurrency(cuotasPendientes.reduce((acc, cuota) => acc + cuota.monto, 0))}
                                </span>
                              </div>
                            )
                          } catch (error) {
                            console.error("Error al procesar gasto:", gasto.id, error)
                            return null
                          }
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pagadas" className="space-y-4">
          {tarjetas.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No hay tarjetas registradas. Ve a la sección &quot;Tarjetas&quot; para agregar tarjetas de crédito.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tarjetas.filter((tarjeta, index, self) => 
                index === self.findIndex(t => t.id === tarjeta.id)
              ).map(tarjeta => {
                const gastosDeTarjeta = gastosEnCuotas.filter(gasto => gasto.tarjetaId === tarjeta.id)
                const cuotasPagadasTarjeta = gastosDeTarjeta.reduce((total, gasto) => {
                  try {
                    const fechaGasto = new Date(gasto.fecha)
                    const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
                    const cuotasPagadas = gasto.cuotasPagadas || 0
                    const cuotasPagadasDelPeriodo = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
                      const fechaCuota = new Date(fechaGasto)
                      
                      // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
                      if (fechaGasto.getDate() > tarjeta.diaCierre) {
                        fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                      }
                      
                      // Añadimos los meses correspondientes a la cuota
                      fechaCuota.setMonth(fechaCuota.getMonth() + i)
                      
                      // Establecemos la fecha de vencimiento
                      fechaCuota.setDate(tarjeta.diaVencimiento)
                      
                      return {
                        fecha: fechaCuota,
                        monto: montoPorCuota,
                        cuotaIndex: i
                      }
                    }).filter(cuota => 
                      (selectedMonth === null || cuota.fecha.getMonth() === selectedMonth) && 
                      cuota.fecha.getFullYear() === selectedYear &&
                      cuota.cuotaIndex < cuotasPagadas // Solo cuotas pagadas
                    )
                    return total + cuotasPagadasDelPeriodo.reduce((acc, cuota) => acc + cuota.monto, 0)
                  } catch (error) {
                    console.error("Error al calcular cuotas pagadas para tarjeta:", tarjeta.id, error)
                    return total
                  }
                }, 0)

                if (cuotasPagadasTarjeta === 0) return null

                return (
                  <Card key={tarjeta.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {tarjeta.nombre} - {tarjeta.banco}
                        <span className="text-lg text-blue-600">
                          {formatCurrency(cuotasPagadasTarjeta)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {gastosDeTarjeta.map(gasto => {
                          try {
                            const fechaGasto = new Date(gasto.fecha)
                            const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
                            const cuotasPagadas = gasto.cuotasPagadas || 0
                            const cuotasPagadasDelPeriodo = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
                              const fechaCuota = new Date(fechaGasto)
                              
                              // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
                              if (fechaGasto.getDate() > tarjeta.diaCierre) {
                                fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                              }
                              
                              // Añadimos los meses correspondientes a la cuota
                              fechaCuota.setMonth(fechaCuota.getMonth() + i)
                              
                              // Establecemos la fecha de vencimiento
                              fechaCuota.setDate(tarjeta.diaVencimiento)
                              
                              return {
                                fecha: fechaCuota,
                                monto: montoPorCuota,
                                cuotaIndex: i
                              }
                            }).filter(cuota => 
                              (selectedMonth === null || cuota.fecha.getMonth() === selectedMonth) && 
                              cuota.fecha.getFullYear() === selectedYear &&
                              cuota.cuotaIndex < cuotasPagadas // Solo cuotas pagadas
                            )

                            if (cuotasPagadasDelPeriodo.length === 0) return null

                            return (
                              <div key={`gasto-pagado-${gasto.id}-${selectedMonth ?? 'year'}-${selectedYear}`} className="flex justify-between items-center text-sm">
                                <span>{gasto.descripcion}</span>
                                <span className="text-blue-600">
                                  {formatCurrency(cuotasPagadasDelPeriodo.reduce((acc, cuota) => acc + cuota.monto, 0))}
                                </span>
                              </div>
                            )
                          } catch (error) {
                            console.error("Error al procesar gasto pagado:", gasto.id, error)
                            return null
                          }
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
