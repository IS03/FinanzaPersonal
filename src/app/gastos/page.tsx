"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FilterSelect } from "@/components/ui/filter-select"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MoreHorizontal, Plus, Pencil, Trash, Filter } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Gasto } from "../types/types"
import { useTarjetas } from "@/app/context/TarjetasContext"
import { useCategorias } from "@/app/context/CategoriasContext"
import { useGastoModal } from "@/app/context/GastoModalContext"
import { cleanDuplicateData } from "@/lib/utils"

export default function GastosPage() {
  const { tarjetas, actualizarSaldosTarjetas } = useTarjetas()
  const { categorias } = useCategorias()
  const { openModal } = useGastoModal()
  const { toast, showToast, hideToast } = useToast()
  const [gastos, setGastos] = useState<Gasto[]>([])

  
  // Estados para filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>("todos")
  const [filtroMes, setFiltroMes] = useState<string>("todos")
  const [filtroTipoGasto, setFiltroTipoGasto] = useState<string>("todos")
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [gastoAEliminar, setGastoAEliminar] = useState<Gasto | null>(null)


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



  const abrirDialogoEditar = (gasto: Gasto) => {
    // TODO: Implementar edición de gastos
    console.log('Editar gasto:', gasto)
  }

  const abrirDialogoAgregar = () => {
    openModal()
  }

  const abrirConfirmacionEliminar = (gasto: Gasto) => {
    setGastoAEliminar(gasto)
    setIsConfirmDialogOpen(true)
  }

  const eliminarGasto = () => {
    if (!gastoAEliminar) return

    const nuevosGastos = gastos.filter(g => g.id !== gastoAEliminar.id)
    setGastos(nuevosGastos)
    localStorage.setItem('gastos', JSON.stringify(nuevosGastos))
    
    // Actualizar los saldos de las tarjetas después de eliminar el gasto
    if (gastoAEliminar.tarjetaId) {
      actualizarSaldosTarjetas(nuevosGastos)
    }

    // Mostrar mensaje de éxito
    showToast("Gasto eliminado con éxito ✅", "success")
    
    // Limpiar estado
    setGastoAEliminar(null)
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
    <div className="space-y-4 sm:space-y-6 overflow-y-auto scrollbar-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Gastos</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant={mostrarFiltros ? "default" : "outline"}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 transition-all duration-200 w-full sm:w-auto"
          >
            <Filter className={`h-4 w-4 transition-transform duration-200 ${mostrarFiltros ? 'rotate-180' : ''}`} />
            Filtros
          </Button>
          <Button onClick={abrirDialogoAgregar} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Gasto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 transition-all duration-300 ease-in-out overflow-hidden ${
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
                className="w-full sm:w-auto"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>

          {/* Vista móvil para gastos */}
          <div className="block sm:hidden space-y-3">
            {gastosFiltrados.map((gasto) => (
              <Card key={gasto.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm">{gasto.descripcion}</h3>
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
                        <DropdownMenuItem onClick={() => abrirConfirmacionEliminar(gasto)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(gasto.monto)}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>
                      {categorias.find(c => c.id === gasto.categoriaId)?.emoji}{" "}
                      {categorias.find(c => c.id === gasto.categoriaId)?.nombre}
                    </span>
                    <span>•</span>
                    <span>{gasto.fecha}</span>
                    <span>•</span>
                    <span>{gasto.medioPago}</span>
                    {gasto.cuotas && (
                      <>
                        <span>•</span>
                        <span>{gasto.cuotas} cuotas</span>
                      </>
                    )}
                  </div>
                  {tarjetas.find(t => t.id === gasto.tarjetaId) && (
                    <div className="text-xs text-muted-foreground">
                      Tarjeta: {tarjetas.find(t => t.id === gasto.tarjetaId)?.nombre}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Vista desktop para gastos */}
          <div className="hidden sm:block">
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
                          <DropdownMenuItem onClick={() => abrirConfirmacionEliminar(gasto)}>
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
          </div>
        </CardContent>
      </Card>


      
      {/* Componente Toast para notificaciones */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Diálogo de confirmación para eliminar gasto */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setGastoAEliminar(null)
        }}
        onConfirm={eliminarGasto}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar el gasto "${gastoAEliminar?.descripcion}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
} 