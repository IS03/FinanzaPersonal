"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, calculateMonthlyStats, cleanDuplicateData } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingDown, TrendingUp, CreditCard, DollarSign, Calendar, BarChart3, Receipt, Wallet } from "lucide-react"
import type { Ingreso } from "@/app/types/types"
import { useGastos } from "@/app/context/GastosContext"
import { useTarjetas } from "@/app/context/TarjetasContext"

export default function Home() {
  const { gastos } = useGastos()
  const { tarjetas } = useTarjetas()
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedIngresos = JSON.parse(localStorage.getItem('ingresos') || '[]')
      
      // Validar ingresos
      const validIngresos = savedIngresos.filter((ingreso: unknown) => 
        ingreso && typeof ingreso === 'object' && 
        ingreso !== null &&
        'id' in ingreso && typeof (ingreso as Record<string, unknown>).id === 'number' &&
        'descripcion' in ingreso && typeof (ingreso as Record<string, unknown>).descripcion === 'string' &&
        'monto' in ingreso && typeof (ingreso as Record<string, unknown>).monto === 'number' &&
        'fecha' in ingreso && typeof (ingreso as Record<string, unknown>).fecha === 'string' &&
        'fuente' in ingreso && typeof (ingreso as Record<string, unknown>).fuente === 'string'
      ) as Ingreso[]
      
      const cleanedIngresos = cleanDuplicateData(validIngresos)
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
          const cierre = tarjeta.diaCierre ?? 31 // 31 = no dispara el cambio de mes si falta
          if (fechaGasto.getDate() > cierre) {
            fechaCuota.setMonth(fechaCuota.getMonth() + 1)
          }
          
          // Añadimos los meses correspondientes a la cuota
          fechaCuota.setMonth(fechaCuota.getMonth() + i)
          
          // Establecemos la fecha de vencimiento
          const vencimiento = tarjeta.diaVencimiento ?? 10 // 10 = día 10 si no está definido
          fechaCuota.setDate(vencimiento)
          
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
          const cierre = tarjeta.diaCierre ?? 31 // 31 = no dispara el cambio de mes si falta
          if (fechaGasto.getDate() > cierre) {
            fechaCuota.setMonth(fechaCuota.getMonth() + 1)
          }
          
          // Añadimos los meses correspondientes a la cuota
          fechaCuota.setMonth(fechaCuota.getMonth() + i)
          
          // Establecemos la fecha de vencimiento
          const vencimiento = tarjeta.diaVencimiento ?? 10 // 10 = día 10 si no está definido
          fechaCuota.setDate(vencimiento)
          
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
        label: fecha.toLocaleDateString('es', { month: 'long' }).charAt(0).toUpperCase() + fecha.toLocaleDateString('es', { month: 'long' }).slice(1)
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
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header mejorado para móvil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Resumen Financiero</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Select 
            value={selectedMonth === null ? 'year' : selectedMonth.toString()} 
            onValueChange={(v) => setSelectedMonth(v === 'year' ? null : parseInt(v))}
          >
            <SelectTrigger className="w-full sm:w-[180px] shadow-sm">
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
            <SelectTrigger className="w-full sm:w-[120px] shadow-sm">
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

      {/* Cards de estadísticas mejoradas */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500 hover:border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              </div>
              {selectedMonth === null ? 'Gastos del Año' : 'Gastos del Mes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalGastos)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Receipt className="h-3 w-3" />
              {gastosDelMes.length} gastos registrados
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 hover:border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              {selectedMonth === null ? 'Ingresos del Año' : 'Ingresos del Mes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalIngresos)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Wallet className="h-3 w-3" />
              {ingresosDelMes.length} ingresos registrados
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 hover:border-l-orange-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/20">
                <CreditCard className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
              {selectedMonth === null ? 'Cuotas Pendientes del Año' : 'Cuotas Pendientes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {formatCurrency(cuotasPendientes)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              {selectedMonth === null ? 'Vencimientos del año' : 'Vencimientos del mes'}
            </p>
          </CardContent>
        </Card>

        <Card className={`group hover:shadow-lg transition-all duration-200 border-l-4 ${
          stats.balance >= 0 
            ? 'border-l-green-500 hover:border-l-green-600' 
            : 'border-l-red-500 hover:border-l-red-600'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${
                stats.balance >= 0 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <BarChart3 className={`h-3 w-3 ${
                  stats.balance >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
              {selectedMonth === null ? 'Balance del Año' : 'Balance del Mes'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-xl sm:text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <DollarSign className="h-3 w-3" />
              {stats.balance >= 0 ? 'Superávit' : 'Déficit'}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <CreditCard className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              {selectedMonth === null ? 'Cuotas Pagadas del Año' : 'Cuotas Pagadas'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {formatCurrency(cuotasPagadas)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Receipt className="h-3 w-3" />
              {selectedMonth === null ? 'Pagadas del año' : 'Pagadas del mes'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 shadow-sm items-center justify-center h-12">
          <TabsTrigger value="pendientes" className="flex items-center justify-center gap-2 h-full">
            <CreditCard className="h-4 w-4" />
            Cuotas Pendientes
          </TabsTrigger>
          <TabsTrigger value="pagadas" className="flex items-center justify-center gap-2 h-full">
            <Receipt className="h-4 w-4" />
            Cuotas Pagadas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes" className="space-y-4">
          {tarjetas.length === 0 ? (
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  No hay tarjetas registradas. Ve a la sección &quot;Tarjetas&quot; para agregar tarjetas de crédito.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
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
                      const cierre = tarjeta.diaCierre ?? 31 // 31 = no dispara el cambio de mes si falta
                      if (fechaGasto.getDate() > cierre) {
                        fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                      }
                      
                      // Añadimos los meses correspondientes a la cuota
                      fechaCuota.setMonth(fechaCuota.getMonth() + i)
                      
                      // Establecemos la fecha de vencimiento
                      const vencimiento = tarjeta.diaVencimiento ?? 10 // 10 = día 10 si no está definido
                      fechaCuota.setDate(vencimiento)
                      
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
                          {formatCurrency(cuotasPendientesTarjeta)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {gastosDeTarjeta.map(gasto => {
                          try {
                            const fechaGasto = new Date(gasto.fecha)
                            const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
                            const cuotasPagadas = gasto.cuotasPagadas || 0
                            const cuotasPendientes = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
                              const fechaCuota = new Date(fechaGasto)
                              
                              // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
                              const cierre = tarjeta.diaCierre ?? 31 // 31 = no dispara el cambio de mes si falta
                              if (fechaGasto.getDate() > cierre) {
                                fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                              }
                              
                              // Añadimos los meses correspondientes a la cuota
                              fechaCuota.setMonth(fechaCuota.getMonth() + i)
                              
                              // Establecemos la fecha de vencimiento
                              const vencimiento = tarjeta.diaVencimiento ?? 10 // 10 = día 10 si no está definido
                              fechaCuota.setDate(vencimiento)
                              
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
                              <div key={`gasto-${gasto.id}-${selectedMonth ?? 'year'}-${selectedYear}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                <span className="break-words flex-1">{gasto.descripcion}</span>
                                <span className="text-orange-600 font-medium">
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
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-6 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  No hay tarjetas registradas. Ve a la sección &quot;Tarjetas&quot; para agregar tarjetas de crédito.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
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
                      const cierre = tarjeta.diaCierre ?? 31 // 31 = no dispara el cambio de mes si falta
                      if (fechaGasto.getDate() > cierre) {
                        fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                      }
                      
                      // Añadimos los meses correspondientes a la cuota
                      fechaCuota.setMonth(fechaCuota.getMonth() + i)
                      
                      // Establecemos la fecha de vencimiento
                      const vencimiento = tarjeta.diaVencimiento ?? 10 // 10 = día 10 si no está definido
                      fechaCuota.setDate(vencimiento)
                      
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
                  <Card key={tarjeta.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base truncate">{tarjeta.nombre}</p>
                            <p className="text-xs text-muted-foreground">{tarjeta.banco}</p>
                          </div>
                        </div>
                        <span className="text-base sm:text-lg text-blue-600 font-semibold">
                          {formatCurrency(cuotasPagadasTarjeta)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {gastosDeTarjeta.map(gasto => {
                          try {
                            const fechaGasto = new Date(gasto.fecha)
                            const montoPorCuota = gasto.monto / (gasto.cuotas || 1)
                            const cuotasPagadas = gasto.cuotasPagadas || 0
                            const cuotasPagadasDelPeriodo = Array.from({ length: gasto.cuotas || 0 }, (_, i) => {
                              const fechaCuota = new Date(fechaGasto)
                              
                              // Si el gasto fue después del día de cierre, la primera cuota vence en el siguiente mes
                              const cierre = tarjeta.diaCierre ?? 31 // 31 = no dispara el cambio de mes si falta
                              if (fechaGasto.getDate() > cierre) {
                                fechaCuota.setMonth(fechaCuota.getMonth() + 1)
                              }
                              
                              // Añadimos los meses correspondientes a la cuota
                              fechaCuota.setMonth(fechaCuota.getMonth() + i)
                              
                              // Establecemos la fecha de vencimiento
                              const vencimiento = tarjeta.diaVencimiento ?? 10 // 10 = día 10 si no está definido
                              fechaCuota.setDate(vencimiento)
                              
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
                              <div key={`gasto-pagado-${gasto.id}-${selectedMonth ?? 'year'}-${selectedYear}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                <span className="break-words flex-1">{gasto.descripcion}</span>
                                <span className="text-blue-600 font-medium">
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
