"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FilterSelect } from "@/components/ui/filter-select"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MoreHorizontal, Plus, Pencil, Trash, Filter, Receipt, Calendar, CreditCard, DollarSign, Tag, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Gasto } from "../types/types"
import { useTarjetas } from "@/app/context/TarjetasContext"
import { useCategorias } from "@/app/context/CategoriasContext"
import { useGastos } from "@/app/context/GastosContext"
import { useGastoModal } from "@/app/context/GastoModalContext"


export default function GastosPage() {
  const { tarjetas, actualizarSaldosTarjetas } = useTarjetas()
  const { categorias } = useCategorias()
  const { gastos, eliminarGasto, setGastoEnEdicion } = useGastos()
  const { openModal } = useGastoModal()
  const { toast, showToast, hideToast } = useToast()

  
  // Estados para filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroMedioPago, setFiltroMedioPago] = useState<string>("todos")
  const [filtroMes, setFiltroMes] = useState<string>("todos")
  const [filtroTipoGasto, setFiltroTipoGasto] = useState<string>("todos")
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [gastoAEliminar, setGastoAEliminar] = useState<Gasto | null>(null)

  useEffect(() => {
    if (gastos.length > 0) {
      actualizarSaldosTarjetas(gastos)
    }
  }, [gastos, actualizarSaldosTarjetas])

  const abrirDialogoEditar = (gasto: Gasto) => {
    setGastoEnEdicion(gasto)
    openModal()
  }

  const abrirDialogoAgregar = () => {
    openModal()
  }

  const abrirConfirmacionEliminar = (gasto: Gasto) => {
    setGastoAEliminar(gasto)
    setIsConfirmDialogOpen(true)
  }

  const eliminarGastoHandler = () => {
    if (!gastoAEliminar) return

    // Eliminar gasto usando el contexto
    eliminarGasto(gastoAEliminar.id)
    
    // Actualizar los saldos de las tarjetas después de eliminar el gasto
    if (gastoAEliminar.tarjetaId) {
      const nuevosGastos = gastos.filter(g => g.id !== gastoAEliminar.id)
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

  // Función para obtener el color del medio de pago
  const getMedioPagoColor = (medioPago: string) => {
    switch (medioPago) {
      case 'efectivo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'debito':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'credito':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'transferencia':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header mejorado para móvil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Gastos</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant={mostrarFiltros ? "default" : "outline"}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 transition-all duration-200 w-full sm:w-auto shadow-sm hover:shadow-md"
          >
            <Filter className={`h-4 w-4 transition-transform duration-200 ${mostrarFiltros ? 'rotate-180' : ''}`} />
            Filtros
          </Button>
          <Button onClick={abrirDialogoAgregar} className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Gasto
          </Button>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        mostrarFiltros 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0'
      }`}>
        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
            <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
              (filtroCategoria !== "todas" || filtroMedioPago !== "todos" || filtroMes !== "todos" || filtroTipoGasto !== "todos")
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
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de gastos mejorado */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {gastosFiltrados.map((gasto) => {
          const categoria = categorias.find(c => c.id === gasto.categoriaId)
          const tarjeta = tarjetas.find(t => t.id === gasto.tarjetaId)
          
          return (
            <Card key={gasto.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500 hover:border-l-red-600">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/20">
                      <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{gasto.descripcion}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {gasto.fecha}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {/* Monto principal */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Monto
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">
                      {formatCurrency(gasto.monto)}
                    </p>
                  </div>

                  {/* Información de categoría y medio de pago */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Categoría
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoria?.emoji}</span>
                        <p className="font-medium text-sm truncate">{categoria?.nombre}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Medio de Pago</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMedioPagoColor(gasto.medioPago)}`}>
                        {gasto.medioPago}
                      </span>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {(tarjeta || gasto.cuotas) && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="space-y-2">
                        {tarjeta && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              Tarjeta
                            </p>
                            <p className="font-medium text-sm">{tarjeta.nombre}</p>
                          </div>
                        )}
                        {gasto.cuotas && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Cuotas</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              {gasto.cuotas} cuotas
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mensaje cuando no hay gastos */}
      {gastosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No hay gastos para mostrar</p>
          <p className="text-sm text-muted-foreground mt-2">
            {gastos.length === 0 
              ? "Agrega tu primer gasto para comenzar a registrar tus gastos" 
              : "No se encontraron gastos con los filtros aplicados"
            }
          </p>
        </div>
      )}

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
        onConfirm={eliminarGastoHandler}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar el gasto "${gastoAEliminar?.descripcion}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
} 