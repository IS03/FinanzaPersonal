"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FilterSelect } from "@/components/ui/filter-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatCurrency, formatDate, cleanDuplicateData } from "@/lib/utils"
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
  const [filtroFuente, setFiltroFuente] = useState<string>("todas")

  useEffect(() => {
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
  }, [])

  const agregarIngreso = () => {
    if (!descripcion || !monto || !fuente) {
      alert("Por favor, completa todos los campos")
      return
    }

    const nuevoIngreso: Ingreso = {
              id: Math.max(...ingresos.map(i => i.id), 0) + 1,
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
    const coincideMes = ingresoDate.getMonth() === filtroMes
    const coincideFuente = filtroFuente === "todas" || ingreso.fuente === filtroFuente
    return coincideMes && coincideFuente
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
              <FilterSelect
                value={fuente}
                onValueChange={setFuente}
                placeholder="Selecciona la fuente"
                options={fuentes.map((f) => ({
                  value: f,
                  label: f.charAt(0).toUpperCase() + f.slice(1)
                }))}
              />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilterSelect
                  value={filtroMes.toString()}
                  onValueChange={(v) => setFiltroMes(parseInt(v))}
                  placeholder="Selecciona mes"
                  label="Mes"
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: i.toString(),
                    label: new Date(2024, i).toLocaleDateString('es', { month: 'long' })
                  }))}
                />

                <FilterSelect
                  value={filtroFuente}
                  onValueChange={setFiltroFuente}
                  placeholder="Todas las fuentes"
                  label="Fuente"
                  options={[
                    { value: "todas", label: "Todas las fuentes" },
                    ...fuentes.map((f) => ({
                      value: f,
                      label: f.charAt(0).toUpperCase() + f.slice(1)
                    }))
                  ]}
                />
              </div>

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