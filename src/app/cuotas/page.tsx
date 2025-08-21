"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Gasto, Tarjeta } from "@/app/types/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CuotasPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]')
    const savedTarjetas = JSON.parse(localStorage.getItem('tarjetas') || '[]')
    setGastos(savedGastos)
    setTarjetas(savedTarjetas)
  }, [])

  const gastosEnCuotas = gastos.filter(gasto => 
    gasto.medioPago === 'credito' && gasto.cuotas && gasto.tarjetaId
  )

  const marcarCuotaComoPagada = (gastoId: number, _cuotaIndex: number) => {
    const gastosActualizados = gastos.map(gasto => {
      if (gasto.id === gastoId) {
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
  }

  // Función para calcular la fecha de vencimiento basada en la fecha de cierre
  const calcularFechaVencimiento = (fechaGasto: Date, tarjeta: Tarjeta, cuotaIndex: number) => {
    const fechaCierre = new Date(fechaGasto)
    fechaCierre.setDate(tarjeta.diaCierre)
    
    // Si la fecha de cierre es anterior a la fecha del gasto, avanzamos un mes
    if (fechaCierre < fechaGasto) {
      fechaCierre.setMonth(fechaCierre.getMonth() + 1)
    }
    
    // Añadimos los meses correspondientes a la cuota
    fechaCierre.setMonth(fechaCierre.getMonth() + cuotaIndex)
    
    // Establecemos la fecha de vencimiento (día de vencimiento)
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
    <div className="space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gastos en Cuotas</h2>
        <div className="flex gap-4">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona el mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Enero</SelectItem>
              <SelectItem value="1">Febrero</SelectItem>
              <SelectItem value="2">Marzo</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Mayo</SelectItem>
              <SelectItem value="5">Junio</SelectItem>
              <SelectItem value="6">Julio</SelectItem>
              <SelectItem value="7">Agosto</SelectItem>
              <SelectItem value="8">Septiembre</SelectItem>
              <SelectItem value="9">Octubre</SelectItem>
              <SelectItem value="10">Noviembre</SelectItem>
              <SelectItem value="11">Diciembre</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona el año" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="mes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mes">Cuotas del Mes</TabsTrigger>
          <TabsTrigger value="futuras">Próximas Cuotas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mes">
          <div className="grid gap-6">
            {cuotasDelMes.map(({ tarjeta, cuotas, totalPendiente }) => (
              <Card key={tarjeta.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {tarjeta.nombre} - {tarjeta.banco}
                    <span className="text-lg text-orange-600">
                      Pendiente: {formatCurrency(totalPendiente)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                                  onClick={() => marcarCuotaComoPagada(cuota.gastoId, cuota.cuotaIndex)}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="futuras">
          <Card>
            <CardContent className="pt-6">
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
                            onClick={() => marcarCuotaComoPagada(cuota.gastoId, cuota.cuotaIndex)}
                          >
                            Marcar como Pagada
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 