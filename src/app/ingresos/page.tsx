"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Ingreso } from "@/app/types/types"

const fuentes = [
  'salario',
  'freelance',
  'inversiones',
  'alquiler',
  'otros'
]

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [descripcion, setDescripcion] = useState("")
  const [monto, setMonto] = useState("")
  const [fuente, setFuente] = useState("")
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth())

  useEffect(() => {
    const savedIngresos = JSON.parse(localStorage.getItem('ingresos') || '[]')
    setIngresos(savedIngresos)
  }, [])

  const agregarIngreso = () => {
    if (!descripcion || !monto || !fuente) {
      alert("Por favor, completa todos los campos")
      return
    }

    const nuevoIngreso: Ingreso = {
      id: Date.now(),
      descripcion,
      monto: parseFloat(monto),
      fuente,
      fecha: new Date().toISOString()
    }

    const nuevosIngresos = [...ingresos, nuevoIngreso]
    setIngresos(nuevosIngresos)
    localStorage.setItem('ingresos', JSON.stringify(nuevosIngresos))
    
    setDescripcion("")
    setMonto("")
    setFuente("")
  }

  const eliminarIngreso = (id: number) => {
    const nuevosIngresos = ingresos.filter(ingreso => ingreso.id !== id)
    setIngresos(nuevosIngresos)
    localStorage.setItem('ingresos', JSON.stringify(nuevosIngresos))
  }

  const ingresosFiltrados = ingresos.filter(ingreso => {
    const ingresoDate = new Date(ingreso.fecha)
    return ingresoDate.getMonth() === filtroMes
  })

  const totalIngresosFiltrados = ingresosFiltrados.reduce((acc, ingreso) => acc + ingreso.monto, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Ingresos</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Ingreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label>Descripción</label>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del ingreso"
              />
            </div>
            <div className="space-y-2">
              <label>Monto</label>
              <Input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label>Fuente</label>
              <Select value={fuente} onValueChange={setFuente}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la fuente" />
                </SelectTrigger>
                <SelectContent>
                  {fuentes.map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={agregarIngreso} className="w-full">
              Agregar Ingreso
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Lista de Ingresos
              <span className="text-lg">
                Total: {formatCurrency(totalIngresosFiltrados)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={filtroMes.toString()} onValueChange={(v) => setFiltroMes(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona mes" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {new Date(2024, i).toLocaleDateString('es', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingresosFiltrados.map((ingreso) => (
                      <TableRow key={ingreso.id}>
                        <TableCell>{ingreso.descripcion}</TableCell>
                        <TableCell>{formatCurrency(ingreso.monto)}</TableCell>
                        <TableCell className="capitalize">{ingreso.fuente}</TableCell>
                        <TableCell>{formatDate(ingreso.fecha)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Eliminar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>¿Confirmar eliminación?</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => eliminarIngreso(ingreso.id)}>
                                  Eliminar
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 