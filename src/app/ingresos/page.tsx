"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FilterSelect } from "@/components/ui/filter-select"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatCurrency, formatDate, cleanDuplicateData } from "@/lib/utils"
import { validarCamposObligatorios, validarMonto } from "@/lib/validations"
import { TrendingUp, DollarSign, Calendar, User, Wallet, Plus, Trash, Filter } from "lucide-react"
import type { Ingreso } from "@/app/types/types"

const fuentes = [
  'salario',
  'freelance',
  'inversiones',
  'alquiler',
  'otros'
]

export default function IngresosPage() {
  const { toast, showToast, hideToast } = useToast()
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [descripcion, setDescripcion] = useState("")
  const [monto, setMonto] = useState("")
  const [fuente, setFuente] = useState("")
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth())
  const [filtroFuente, setFiltroFuente] = useState<string>("todas")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [ingresoAEliminar, setIngresoAEliminar] = useState<Ingreso | null>(null)

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
    // Validar campos obligatorios
    const validacionCampos = validarCamposObligatorios({
      descripcion,
      monto,
      fuente
    })

    if (!validacionCampos.esValido) {
      const camposFaltantes = validacionCampos.camposFaltantes.join(", ")
      showToast(`Por favor, completa los campos: ${camposFaltantes}`, "error")
      return
    }

    // Validar monto
    const validacionMonto = validarMonto(monto)
    if (!validacionMonto.esValido) {
      showToast(validacionMonto.mensaje, "error")
      return
    }

    const nuevoIngreso: Ingreso = {
      id: Math.max(...ingresos.map(i => i.id), 0) + 1,
      descripcion,
      monto: validacionMonto.valor!,
      fuente,
      fecha: new Date().toISOString()
    }

    const nuevosIngresos = [...ingresos, nuevoIngreso]
    setIngresos(nuevosIngresos)
    localStorage.setItem('ingresos', JSON.stringify(nuevosIngresos))
    
    setDescripcion("")
    setMonto("")
    setFuente("")
    
    // Mostrar mensaje de éxito
    showToast("Ingreso agregado con éxito ✅", "success")
  }

  const abrirConfirmacionEliminar = (ingreso: Ingreso) => {
    setIngresoAEliminar(ingreso)
    setIsConfirmDialogOpen(true)
  }

  const eliminarIngreso = () => {
    if (!ingresoAEliminar) return

    const nuevosIngresos = ingresos.filter(ingreso => ingreso.id !== ingresoAEliminar.id)
    setIngresos(nuevosIngresos)
    localStorage.setItem('ingresos', JSON.stringify(nuevosIngresos))
    
    // Mostrar mensaje de éxito
    showToast("Ingreso eliminado con éxito ✅", "success")
    
    // Limpiar estado
    setIngresoAEliminar(null)
  }

  const ingresosFiltrados = ingresos.filter(ingreso => {
    const ingresoDate = new Date(ingreso.fecha)
    const coincideMes = ingresoDate.getMonth() === filtroMes
    const coincideFuente = filtroFuente === "todas" || ingreso.fuente === filtroFuente
    return coincideMes && coincideFuente
  })

  const totalIngresosFiltrados = ingresosFiltrados.reduce((acc, ingreso) => acc + ingreso.monto, 0)

  // Función para obtener el color de la fuente
  const getFuenteColor = (fuente: string) => {
    switch (fuente) {
      case 'salario':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'freelance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'inversiones':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'alquiler':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header mejorado para móvil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Ingresos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Card para agregar ingreso */}
        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 hover:border-l-green-600">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Agregar Nuevo Ingreso
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                Descripción
              </label>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del ingreso"
                className="focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Monto
              </label>
              <Input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Fuente
              </label>
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
            <Button onClick={agregarIngreso} className="w-full shadow-sm hover:shadow-md transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ingreso
            </Button>
          </CardContent>
        </Card>

        {/* Card de estadísticas */}
        <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 hover:border-l-blue-600">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Resumen de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {formatCurrency(totalIngresosFiltrados)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total del mes seleccionado
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FilterSelect
                  value={filtroMes.toString()}
                  onValueChange={(v) => setFiltroMes(parseInt(v))}
                  placeholder="Selecciona mes"
                  label="Mes"
                  options={Array.from({ length: 12 }, (_, i) => {
                    const monthName = new Date(2024, i).toLocaleDateString('es', { month: 'long' })
                    return {
                      value: i.toString(),
                      label: monthName.charAt(0).toUpperCase() + monthName.slice(1)
                    }
                  })}
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de ingresos mejorado */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {ingresosFiltrados.map((ingreso) => (
          <Card key={ingreso.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 hover:border-l-green-600">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">{ingreso.descripcion}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {formatDate(ingreso.fecha)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => abrirConfirmacionEliminar(ingreso)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
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
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatCurrency(ingreso.monto)}
                  </p>
                </div>

                {/* Información de fuente */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Fuente
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFuenteColor(ingreso.fuente)}`}>
                    {ingreso.fuente.charAt(0).toUpperCase() + ingreso.fuente.slice(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje cuando no hay ingresos */}
      {ingresosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No hay ingresos para mostrar</p>
          <p className="text-sm text-muted-foreground mt-2">
            {ingresos.length === 0 
              ? "Agrega tu primer ingreso para comenzar a registrar tus ingresos" 
              : "No se encontraron ingresos con los filtros aplicados"
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

      {/* Diálogo de confirmación para eliminar ingreso */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setIngresoAEliminar(null)
        }}
        onConfirm={eliminarIngreso}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar el ingreso "${ingresoAEliminar?.descripcion}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
} 