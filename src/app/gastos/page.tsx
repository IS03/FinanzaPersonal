"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FilterSelect } from "@/components/ui/filter-select"
import { MoreHorizontal, Plus, Pencil, Trash, Filter } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Gasto, MedioPago } from "../types/types"
import { useTarjetas } from "@/app/context/TarjetasContext"
import { useCategorias } from "@/app/context/CategoriasContext"
import { cleanDuplicateData } from "@/lib/utils"

export default function GastosPage() {
  const { tarjetas, actualizarSaldosTarjetas } = useTarjetas()
  const { categorias } = useCategorias()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null)
  
  // Estados para filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>("todos")
  const [filtroMes, setFiltroMes] = useState<string>("todos")
  const [filtroTipoGasto, setFiltroTipoGasto] = useState<string>("todos")
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false)
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
    
    const cleanedGastos = cleanDuplicateData(validGastos)
    setGastos(cleanedGastos)
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
        id: Math.max(...gastos.map(g => g.id), 0) + 1,
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

  // Lógica de filtrado
  const gastosFiltrados = gastos.filter(gasto => {
    // Filtro por categoría
    if (filtroCategoria !== "todas" && gasto.categoriaId.toString() !== filtroCategoria) {
      return false
    }
    
    // Filtro por medio de pago
    if (filtroMedioPago !== "todos" && gasto.medioPago !== filtroMedioPago) {
      return false
    }
    
    // Filtro por mes
    if (filtroMes !== "todos") {
      const fechaGasto = new Date(gasto.fecha)
      const mesGasto = fechaGasto.getMonth().toString()
      if (mesGasto !== filtroMes) {
        return false
      }
    }
    
    // Filtro por tipo de gasto (cuotas vs no cuotas)
    if (filtroTipoGasto !== "todos") {
      if (filtroTipoGasto === "cuotas" && !gasto.cuotas) {
        return false
      }
      if (filtroTipoGasto === "sin-cuotas" && gasto.cuotas) {
        return false
      }
    }
    
    return true
  })

  // Generar opciones para filtros
  const meses = [
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
  ]

  const mediosPago = [
    { value: "efectivo", label: "Efectivo" },
    { value: "debito", label: "Débito" },
    { value: "credito", label: "Crédito" },
    { value: "transferencia", label: "Transferencia" },
    { value: "otro", label: "Otro" }
  ]

  const tiposGasto = [
    { value: "cuotas", label: "Con Cuotas" },
    { value: "sin-cuotas", label: "Sin Cuotas" }
  ]

  return (
    <div className="space-y-6 overflow-y-auto scrollbar-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
        <div className="flex gap-2">
          <Button 
            variant={mostrarFiltros ? "default" : "outline"}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 transition-all duration-200"
          >
            <Filter className={`h-4 w-4 transition-transform duration-200 ${mostrarFiltros ? 'rotate-180' : ''}`} />
            Filtros
          </Button>
          <Button onClick={abrirDialogoAgregar}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Gasto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 transition-all duration-300 ease-in-out overflow-hidden ${
            mostrarFiltros 
              ? 'max-h-96 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}>
            {/* Filtro por Categoría */}
            <FilterSelect
              value={filtroCategoria}
              onValueChange={setFiltroCategoria}
              placeholder="Todas las categorías"
              label="Categoría"
              size="category"
              options={[
                { value: "todas", label: "Todas las categorías" },
                ...categorias.map((categoria) => ({
                  value: categoria.id.toString(),
                  label: `${categoria.emoji} ${categoria.nombre}`
                }))
              ]}
            />

            {/* Filtro por Medio de Pago */}
            <FilterSelect
              value={filtroMedioPago}
              onValueChange={setFiltroMedioPago}
              placeholder="Todos los medios"
              label="Medio de Pago"
              options={[
                { value: "todos", label: "Todos los medios" },
                ...mediosPago.map((medio) => ({
                  value: medio.value,
                  label: medio.label
                }))
              ]}
            />

            {/* Filtro por Mes */}
            <FilterSelect
              value={filtroMes}
              onValueChange={setFiltroMes}
              placeholder="Todos los meses"
              label="Mes"
              options={[
                { value: "todos", label: "Todos los meses" },
                ...meses.map((mes) => ({
                  value: mes.value,
                  label: mes.label
                }))
              ]}
            />

            {/* Filtro por Tipo de Gasto */}
            <FilterSelect
              value={filtroTipoGasto}
              onValueChange={setFiltroTipoGasto}
              placeholder="Todos los tipos"
              label="Tipo de Gasto"
              options={[
                { value: "todos", label: "Todos los tipos" },
                ...tiposGasto.map((tipo) => ({
                  value: tipo.value,
                  label: tipo.label
                }))
              ]}
            />
          </div>

          {/* Botón para limpiar filtros */}
          <div className={`mb-4 transition-all duration-300 ease-in-out overflow-hidden ${
            mostrarFiltros && (filtroCategoria !== "todas" || filtroMedioPago !== "todos" || filtroMes !== "todos" || filtroTipoGasto !== "todos")
              ? 'max-h-20 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}>
            {(filtroCategoria !== "todas" || filtroMedioPago !== "todos" || filtroMes !== "todos" || filtroTipoGasto !== "todos") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroCategoria("todas")
                  setFiltroMedioPago("todos")
                  setFiltroMes("todos")
                  setFiltroTipoGasto("todos")
                }}
              >
                Limpiar Filtros
              </Button>
            )}
          </div>

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
              {gastosFiltrados.map((gasto) => (
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
                  {tarjetas.filter((tarjeta, index, self) => 
                    index === self.findIndex(t => t.id === tarjeta.id)
                  ).map((tarjeta) => (
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