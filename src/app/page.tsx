"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, getCurrentMonth, calculateMonthlyStats } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Gasto, Tarjeta } from "@/app/types/types"

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]')
      const savedTarjetas = JSON.parse(localStorage.getItem('tarjetas') || '[]')
      setGastos(savedGastos)
      setTarjetas(savedTarjetas)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const gastosDelMes = gastos.filter(gasto => {
    try {
      const fechaGasto = new Date(gasto.fecha)
      return fechaGasto.getMonth() === selectedMonth && fechaGasto.getFullYear() === selectedYear
    } catch (error) {
      console.error("Error al procesar fecha:", gasto.fecha, error)
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
            monto: montoPorCuota
          }
        }).filter(cuota => 
          cuota.fecha.getMonth() === selectedMonth && 
          cuota.fecha.getFullYear() === selectedYear
        )
        return total + cuotasPendientes.reduce((acc, cuota) => acc + cuota.monto, 0)
      } catch (error) {
        console.error("Error al calcular cuotas para gasto:", gasto.id, error)
        return total
      }
    }, 0)
  }

  const stats = calculateMonthlyStats(gastosDelMes, [])
  const cuotasPendientes = calcularCuotasPendientes()

  // Generar meses para el selector
  const meses = Array.from({ length: 12 }, (_, i) => {
    const fecha = new Date(2024, i)
    return {
      value: i.toString(),
      label: fecha.toLocaleDateString('es', { month: 'long' })
    }
  })

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
        <h2 className="text-3xl font-bold tracking-tight">Resumen Financiero</h2>
        <div className="flex gap-4">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona mes" />
            </SelectTrigger>
            <SelectContent>
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
            <SelectContent>
              {años.map((año) => (
                <SelectItem key={año.value} value={año.value}>
                  {año.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos del Mes
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
              Cuotas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(cuotasPendientes)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vencimientos del mes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cuotas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cuotas">Cuotas</TabsTrigger>
        </TabsList>
        <TabsContent value="cuotas" className="space-y-4">
          {tarjetas.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No hay tarjetas registradas. Ve a la sección "Tarjetas" para agregar tarjetas de crédito.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tarjetas.map(tarjeta => {
                const gastosDeTarjeta = gastosEnCuotas.filter(gasto => gasto.tarjetaId === tarjeta.id)
                const cuotasPendientesTarjeta = gastosDeTarjeta.reduce((total, gasto) => {
                  try {
                    const fechaGasto = new Date(gasto.fecha)
                    const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
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
                        monto: montoPorCuota
                      }
                    }).filter(cuota => 
                      cuota.fecha.getMonth() === selectedMonth && 
                      cuota.fecha.getFullYear() === selectedYear
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
                                monto: montoPorCuota
                              }
                            }).filter(cuota => 
                              cuota.fecha.getMonth() === selectedMonth && 
                              cuota.fecha.getFullYear() === selectedYear
                            )

                            if (cuotasPendientes.length === 0) return null

                            return (
                              <div key={gasto.id} className="flex justify-between items-center text-sm">
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
      </Tabs>
    </div>
  )
}
