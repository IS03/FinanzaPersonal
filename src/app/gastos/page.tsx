"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Gasto, MedioPago } from "../types/types"
import { useTarjetas } from "@/app/context/TarjetasContext"
import { useCategorias } from "@/app/context/CategoriasContext"

export default function GastosPage() {
  const { tarjetas, actualizarSaldosTarjetas } = useTarjetas()
  const { categorias } = useCategorias()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null)
  const [nuevoGasto, setNuevoGasto] = useState<{
    descripcion: string;
    monto: string;
    categoriaId: string;
    fecha: string;
    medioPago: MedioPago;
    tarjetaId: string;
    cuotas: string;
  }>({
    descripcion: "",
    monto: "",
    categoriaId: "",
    fecha: new Date().toISOString().split('T')[0],
    medioPago: "efectivo",
    tarjetaId: "",
    cuotas: ""
  })

  useEffect(() => {
    const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]')
    setGastos(savedGastos)
  }, [])

  useEffect(() => {
    if (gastos.length > 0) {
      actualizarSaldosTarjetas(gastos)
    }
  }, [gastos, actualizarSaldosTarjetas])

  const resetForm = () => {
    setNuevoGasto({
      descripcion: "",
      monto: "",
      categoriaId: "",
      fecha: new Date().toISOString().split('T')[0],
      medioPago: "efectivo",
      tarjetaId: "",
      cuotas: ""
    })
    setIsEditMode(false)
    setGastoEditando(null)
  }

  const abrirDialogoEditar = (gasto: Gasto) => {
    setGastoEditando(gasto)
    setNuevoGasto({
      descripcion: gasto.descripcion,
      monto: gasto.monto.toString(),
      categoriaId: gasto.categoriaId.toString(),
      fecha: gasto.fecha,
      medioPago: gasto.medioPago,
      tarjetaId: gasto.tarjetaId?.toString() || "",
      cuotas: gasto.cuotas?.toString() || ""
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const abrirDialogoAgregar = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const eliminarGasto = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este gasto?")) {
      const gastoAEliminar = gastos.find(g => g.id === id)
      const nuevosGastos = gastos.filter(g => g.id !== id)
      setGastos(nuevosGastos)
      localStorage.setItem('gastos', JSON.stringify(nuevosGastos))
      
      // Actualizar los saldos de las tarjetas después de eliminar el gasto
      if (gastoAEliminar && gastoAEliminar.tarjetaId) {
        actualizarSaldosTarjetas(nuevosGastos)
      }
    }
  }

  const guardarGasto = () => {
    if (!nuevoGasto.descripcion || !nuevoGasto.monto || !nuevoGasto.categoriaId || !nuevoGasto.fecha) {
      alert("Por favor, completa todos los campos obligatorios")
      return
    }

    const monto = parseFloat(nuevoGasto.monto)
    const cuotas = nuevoGasto.cuotas ? parseInt(nuevoGasto.cuotas) : undefined
    const tarjetaId = nuevoGasto.tarjetaId ? parseInt(nuevoGasto.tarjetaId) : undefined
    const categoriaId = parseInt(nuevoGasto.categoriaId)

    if (isEditMode && gastoEditando) {
      const gastosActualizados = gastos.map(g => 
        g.id === gastoEditando.id 
          ? {
              ...g,
              descripcion: nuevoGasto.descripcion,
              monto: monto,
              categoriaId: categoriaId,
              fecha: nuevoGasto.fecha,
              medioPago: nuevoGasto.medioPago,
              tarjetaId: tarjetaId,
              cuotas: cuotas
            }
          : g
      )
      setGastos(gastosActualizados)
      localStorage.setItem('gastos', JSON.stringify(gastosActualizados))
    } else {
      const gasto: Gasto = {
        id: Date.now(),
        descripcion: nuevoGasto.descripcion,
        monto: monto,
        categoriaId: categoriaId,
        fecha: nuevoGasto.fecha,
        medioPago: nuevoGasto.medioPago,
        tarjetaId: tarjetaId,
        cuotas: cuotas
      }

      const nuevosGastos = [...gastos, gasto]
      setGastos(nuevosGastos)
      localStorage.setItem('gastos', JSON.stringify(nuevosGastos))
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
        <Button onClick={abrirDialogoAgregar}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Gasto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Medio de Pago</TableHead>
                <TableHead>Tarjeta</TableHead>
                <TableHead>Cuotas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>{gasto.descripcion}</TableCell>
                  <TableCell>{formatCurrency(gasto.monto)}</TableCell>
                  <TableCell>
                    {categorias.find(c => c.id === gasto.categoriaId)?.emoji}{" "}
                    {categorias.find(c => c.id === gasto.categoriaId)?.nombre}
                  </TableCell>
                  <TableCell>{gasto.fecha}</TableCell>
                  <TableCell>{gasto.medioPago}</TableCell>
                  <TableCell>
                    {tarjetas.find(t => t.id === gasto.tarjetaId)?.nombre}
                  </TableCell>
                  <TableCell>{gasto.cuotas || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => abrirDialogoEditar(gasto)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => eliminarGasto(gasto.id)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Gasto" : "Agregar Gasto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="descripcion" className="text-right">
                Descripción
              </label>
              <Input
                id="descripcion"
                value={nuevoGasto.descripcion}
                onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="monto" className="text-right">
                Monto
              </label>
              <Input
                id="monto"
                type="number"
                value={nuevoGasto.monto}
                onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="categoria" className="text-right">
                Categoría
              </label>
              <select
                id="categoria"
                value={nuevoGasto.categoriaId}
                onChange={(e) => setNuevoGasto({...nuevoGasto, categoriaId: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.emoji} {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="fecha" className="text-right">
                Fecha
              </label>
              <Input
                id="fecha"
                type="date"
                value={nuevoGasto.fecha}
                onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="medioPago" className="text-right">
                Medio de Pago
              </label>
              <select
                id="medioPago"
                value={nuevoGasto.medioPago}
                onChange={(e) => setNuevoGasto({...nuevoGasto, medioPago: e.target.value as MedioPago})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="efectivo">Efectivo</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            {(nuevoGasto.medioPago === "credito" || nuevoGasto.medioPago === "debito") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="tarjeta" className="text-right">
                  Tarjeta
                </label>
                <select
                  id="tarjeta"
                  value={nuevoGasto.tarjetaId}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, tarjetaId: e.target.value})}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona una tarjeta</option>
                  {tarjetas.map((tarjeta) => (
                    <option key={tarjeta.id} value={tarjeta.id}>
                      {tarjeta.nombre} - {tarjeta.banco}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {nuevoGasto.medioPago === "credito" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="cuotas" className="text-right">
                  Cuotas
                </label>
                <Input
                  id="cuotas"
                  type="number"
                  value={nuevoGasto.cuotas}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, cuotas: e.target.value})}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={guardarGasto}>
              {isEditMode ? "Guardar Cambios" : "Agregar Gasto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 