"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FilterSelect } from "@/components/ui/filter-select"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MoreHorizontal, Plus, Pencil, Trash, CreditCard } from "lucide-react"
import { formatCurrency, cleanDuplicateData } from "@/lib/utils"
import { validarCamposObligatorios, validarMonto } from "@/lib/validations"
import type { Tarjeta, Gasto } from "@/app/types/types"
import { useTarjetas } from "@/app/context/TarjetasContext"

const tarjetasPredefinidas = [
  {
    nombre: "Visa Gold",
    banco: "Banco Nación",
    tipo: "credito" as const,
    limite: 150000,
    diaCierre: 15,
    diaVencimiento: 25,
    saldoUsado: 0,
    saldoDisponible: 150000
  },
  {
    nombre: "Mastercard Platinum",
    banco: "Banco Ciudad",
    tipo: "credito" as const,
    limite: 200000,
    diaCierre: 20,
    diaVencimiento: 30,
    saldoUsado: 0,
    saldoDisponible: 200000
  },
  {
    nombre: "Débito Principal",
    banco: "Banco Nación",
    tipo: "debito" as const,
    limite: 50000,
    saldoUsado: 0,
    saldoDisponible: 50000
  },
  {
    nombre: "Débito Secundaria",
    banco: "Banco Ciudad",
    tipo: "debito" as const,
    limite: 30000,
    saldoUsado: 0,
    saldoDisponible: 30000
  }
]

export default function TarjetasPage() {
  const { tarjetas, agregarTarjeta, actualizarTarjeta, eliminarTarjeta, actualizarSaldosTarjetas } = useTarjetas()
  const { toast, showToast, hideToast } = useToast()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [tarjetaEditando, setTarjetaEditando] = useState<Tarjeta | null>(null)
  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    nombre: "",
    banco: "",
    tipo: "credito" as "credito" | "debito",
    limite: "",
    diaCierre: "",
    diaVencimiento: ""
  })
  const [ordenamiento, setOrdenamiento] = useState<string>("nombre")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [tarjetaAEliminar, setTarjetaAEliminar] = useState<Tarjeta | null>(null)

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
    
    // Migrar tarjetas existentes al nuevo formato
    const savedTarjetas = JSON.parse(localStorage.getItem('tarjetas') || '[]')
    const tarjetasNecesitanMigracion = savedTarjetas.some((t: unknown) => 
      t && typeof t === 'object' && t !== null && !('tipo' in t)
    )
    
    if (tarjetasNecesitanMigracion) {
      // Limpiar tarjetas existentes y usar las predefinidas
      localStorage.removeItem('tarjetas')
      const tarjetasIniciales = tarjetasPredefinidas.map((t, index) => ({
        ...t,
        id: index + 1,
        saldoUsado: 0,
        saldoDisponible: t.limite
      }))
      tarjetasIniciales.forEach(t => agregarTarjeta(t))
    } else if (tarjetas.length === 0) {
      // Si no hay tarjetas, inicializar con las predefinidas
      const tarjetasIniciales = tarjetasPredefinidas.map((t, index) => ({
        ...t,
        id: index + 1,
        saldoUsado: 0,
        saldoDisponible: t.limite
      }))
      tarjetasIniciales.forEach(t => agregarTarjeta(t))
    }
  }, [tarjetas.length, agregarTarjeta])

  useEffect(() => {
    if (gastos.length > 0) {
      actualizarSaldosTarjetas(gastos)
    }
  }, [gastos, actualizarSaldosTarjetas])

  const resetForm = () => {
    setNuevaTarjeta({
      nombre: "",
      banco: "",
      tipo: "credito" as "credito" | "debito",
      limite: "",
      diaCierre: "",
      diaVencimiento: ""
    })
    setIsEditMode(false)
    setTarjetaEditando(null)
  }

  const abrirDialogoEditar = (tarjeta: Tarjeta) => {
    setTarjetaEditando(tarjeta)
    setNuevaTarjeta({
      nombre: tarjeta.nombre,
      banco: tarjeta.banco,
      tipo: tarjeta.tipo,
      limite: tarjeta.limite.toString(),
      diaCierre: tarjeta.diaCierre?.toString() || "",
      diaVencimiento: tarjeta.diaVencimiento?.toString() || ""
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const abrirDialogoAgregar = () => {
    resetForm()
    setIsDialogOpen(true)
  }

    const abrirConfirmacionEliminar = (tarjeta: Tarjeta) => {
    setTarjetaAEliminar(tarjeta)
    setIsConfirmDialogOpen(true)
  }

  const eliminarTarjetaHandler = () => {
    if (!tarjetaAEliminar) return

    eliminarTarjeta(tarjetaAEliminar.id)
    
    // Mostrar mensaje de éxito
    showToast("Tarjeta eliminada con éxito ✅", "success")
    
    // Limpiar estado
    setTarjetaAEliminar(null)
  }

  const guardarTarjeta = () => {
    // Validar campos obligatorios
    const camposObligatorios: Record<string, string> = {
      nombre: nuevaTarjeta.nombre,
      banco: nuevaTarjeta.banco,
      limite: nuevaTarjeta.limite
    }
    
    // Solo validar campos de cierre y vencimiento para tarjetas de crédito
    if (nuevaTarjeta.tipo === 'credito') {
      camposObligatorios.diaCierre = nuevaTarjeta.diaCierre
      camposObligatorios.diaVencimiento = nuevaTarjeta.diaVencimiento
    }
    
    const validacionCampos = validarCamposObligatorios(camposObligatorios)

    if (!validacionCampos.esValido) {
      const camposFaltantes = validacionCampos.camposFaltantes.join(", ")
      showToast(`Por favor, completa los campos: ${camposFaltantes}`, "error")
      return
    }

    // Validar monto del límite
    const validacionLimite = validarMonto(nuevaTarjeta.limite)
    if (!validacionLimite.esValido) {
      showToast(validacionLimite.mensaje, "error")
      return
    }

    const limite = validacionLimite.valor!

    // Solo validar días para tarjetas de crédito
    let diaCierre: number | undefined
    let diaVencimiento: number | undefined
    
    if (nuevaTarjeta.tipo === 'credito') {
      diaCierre = parseInt(nuevaTarjeta.diaCierre)
      diaVencimiento = parseInt(nuevaTarjeta.diaVencimiento)
      
      if (diaCierre < 1 || diaCierre > 31 || diaVencimiento < 1 || diaVencimiento > 31) {
        showToast("Los días deben estar entre 1 y 31", "error")
        return
      }
    }

    if (isEditMode && tarjetaEditando) {
      const tarjetaActualizada = {
        ...tarjetaEditando,
        nombre: nuevaTarjeta.nombre,
        banco: nuevaTarjeta.banco,
        tipo: nuevaTarjeta.tipo,
        limite: limite,
        diaCierre: nuevaTarjeta.tipo === 'credito' ? diaCierre : undefined,
        diaVencimiento: nuevaTarjeta.tipo === 'credito' ? diaVencimiento : undefined,
        saldoDisponible: limite - tarjetaEditando.saldoUsado
      }
      actualizarTarjeta(tarjetaActualizada)
    } else {
      const tarjeta: Tarjeta = {
        id: Math.max(...tarjetas.map(t => t.id), 0) + 1,
        nombre: nuevaTarjeta.nombre,
        banco: nuevaTarjeta.banco,
        tipo: nuevaTarjeta.tipo,
        limite: limite,
        diaCierre: nuevaTarjeta.tipo === 'credito' ? diaCierre : undefined,
        diaVencimiento: nuevaTarjeta.tipo === 'credito' ? diaVencimiento : undefined,
        saldoUsado: 0,
        saldoDisponible: limite
      }
      agregarTarjeta(tarjeta)
    }
    
    resetForm()
    setIsDialogOpen(false)
    
    // Mostrar mensaje de éxito
    const mensaje = isEditMode ? "Tarjeta actualizada con éxito ✅" : "Tarjeta agregada con éxito ✅"
    showToast(mensaje, "success")
  }

  // Lógica de filtrado y ordenamiento
  const tarjetasFiltradas = tarjetas.filter(tarjeta => {
    if (filtroTipo === "todos") return true
    return tarjeta.tipo === filtroTipo
  })

  const tarjetasOrdenadas = [...tarjetasFiltradas].sort((a, b) => {
    switch (ordenamiento) {
      case "saldoDisponible":
        return b.saldoDisponible - a.saldoDisponible
      case "saldoUsado":
        return b.saldoUsado - a.saldoUsado
      case "limite":
        return b.limite - a.limite
      case "banco":
        return a.banco.localeCompare(b.banco)
      case "tipo":
        return a.tipo.localeCompare(b.tipo)
      case "nombre":
      default:
        return a.nombre.localeCompare(b.nombre)
    }
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Tarjetas</h2>
        <Button onClick={abrirDialogoAgregar} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tarjeta
        </Button>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <FilterSelect
            value={filtroTipo}
            onValueChange={setFiltroTipo}
            placeholder="Todos los tipos"
            label="Filtrar por tipo"
            size="wide"
            options={[
              { value: "todos", label: "Todos los tipos" },
              { value: "credito", label: "Crédito" },
              { value: "debito", label: "Débito" }
            ]}
          />
          <FilterSelect
            value={ordenamiento}
            onValueChange={setOrdenamiento}
            placeholder="Ordenar por"
            label="Ordenar por"
            size="wide"
            options={[
              { value: "nombre", label: "Nombre" },
              { value: "banco", label: "Banco" },
              { value: "tipo", label: "Tipo" },
              { value: "limite", label: "Límite" },
              { value: "saldoDisponible", label: "Saldo Disponible" },
              { value: "saldoUsado", label: "Saldo Usado" }
            ]}
          />
        </div>
      </div>

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {tarjetasOrdenadas.filter((tarjeta, index, self) => 
            index === self.findIndex(t => t.id === tarjeta.id)
          ).map((tarjeta) => (
          <Card key={tarjeta.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {tarjeta.nombre}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => abrirDialogoEditar(tarjeta)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => abrirConfirmacionEliminar(tarjeta)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Banco</p>
                  <p className="font-medium">{tarjeta.banco}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Límite</p>
                  <p className="font-medium">{formatCurrency(tarjeta.limite)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Usado</p>
                  <p className="font-medium text-orange-600">{formatCurrency(tarjeta.saldoUsado)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Disponible</p>
                  <p className="font-medium text-green-600">{formatCurrency(tarjeta.saldoDisponible)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">{tarjeta.tipo}</p>
                </div>
                {tarjeta.tipo === 'credito' && tarjeta.diaCierre && tarjeta.diaVencimiento && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Cierre</p>
                      <p className="font-medium">Día {tarjeta.diaCierre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vencimiento</p>
                      <p className="font-medium">Día {tarjeta.diaVencimiento}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{isEditMode ? "Editar Tarjeta" : "Agregar Nueva Tarjeta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm sm:text-base">Nombre de la Tarjeta</label>
              <Input
                value={nuevaTarjeta.nombre}
                onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, nombre: e.target.value})}
                placeholder="Ej: Visa Gold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base">Banco</label>
              <Input
                value={nuevaTarjeta.banco}
                onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, banco: e.target.value})}
                placeholder="Ej: Banco Nación"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base">Tipo de Tarjeta</label>
              <select
                value={nuevaTarjeta.tipo}
                onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, tipo: e.target.value as "credito" | "debito"})}
                className="w-full p-2 border rounded-md"
              >
                <option value="credito">Crédito</option>
                <option value="debito">Débito</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base">{nuevaTarjeta.tipo === 'credito' ? 'Límite de Crédito' : 'Saldo Disponible'}</label>
              <Input
                type="number"
                value={nuevaTarjeta.limite}
                onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, limite: e.target.value})}
                placeholder="0.00"
              />
            </div>
            {nuevaTarjeta.tipo === 'credito' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm sm:text-base">Día de Cierre</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={nuevaTarjeta.diaCierre}
                    onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, diaCierre: e.target.value})}
                    placeholder="Ej: 15"
                  />
                  <p className="text-xs text-muted-foreground">
                    Día del mes en que cierra el resumen de la tarjeta
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm sm:text-base">Día de Vencimiento</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={nuevaTarjeta.diaVencimiento}
                    onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, diaVencimiento: e.target.value})}
                    placeholder="Ej: 25"
                  />
                  <p className="text-xs text-muted-foreground">
                    Día del mes en que vence el pago
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={guardarTarjeta} className="w-full sm:w-auto">
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Componente Toast para notificaciones */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Diálogo de confirmación para eliminar tarjeta */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setTarjetaAEliminar(null)
        }}
        onConfirm={eliminarTarjetaHandler}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar la tarjeta "${tarjetaAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
} 