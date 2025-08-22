"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatCurrency, formatDate, cleanDuplicateData } from "@/lib/utils"
import { validarCamposObligatorios, validarMonto, validarFecha } from "@/lib/validations"
import { TrendingDown, DollarSign, Calendar, User, Plus, Trash, Pencil, CheckCircle, Clock, AlertTriangle, Handshake } from "lucide-react"
import type { Deuda, PagoDeuda } from "@/app/types/types"

export default function DeudasPage() {
  const { toast, showToast, hideToast } = useToast()
  const [deudas, setDeudas] = useState<Deuda[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false)
  const [isPagoParcialDialogOpen, setIsPagoParcialDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<Deuda | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [deudaAEliminar, setDeudaAEliminar] = useState<Deuda | null>(null)
  const [montoPago, setMontoPago] = useState("")
  const [nuevaDeuda, setNuevaDeuda] = useState({
    descripcion: "",
    monto: "",
    tipo: "porPagar",
    persona: "",
    fecha: new Date().toISOString().split('T')[0],
    fechaVencimiento: "",
    notas: ""
  })

  useEffect(() => {
    const savedDeudas = JSON.parse(localStorage.getItem('deudas') || '[]')
    
    // Validar deudas
    const validDeudas = savedDeudas.filter((deuda: unknown) => 
      deuda && typeof deuda === 'object' && 
      deuda !== null &&
      'id' in deuda && typeof (deuda as Record<string, unknown>).id === 'number' &&
      'descripcion' in deuda && typeof (deuda as Record<string, unknown>).descripcion === 'string' &&
      'monto' in deuda && typeof (deuda as Record<string, unknown>).monto === 'number' &&
      'montoPagado' in deuda && typeof (deuda as Record<string, unknown>).montoPagado === 'number' &&
      'tipo' in deuda && typeof (deuda as Record<string, unknown>).tipo === 'string' &&
      'persona' in deuda && typeof (deuda as Record<string, unknown>).persona === 'string' &&
      'fecha' in deuda && typeof (deuda as Record<string, unknown>).fecha === 'string' &&
      'estado' in deuda && typeof (deuda as Record<string, unknown>).estado === 'string' &&
      'historialPagos' in deuda && Array.isArray((deuda as Record<string, unknown>).historialPagos)
    ) as Deuda[]
    
    const cleanedDeudas = cleanDuplicateData(validDeudas)
    setDeudas(cleanedDeudas)
  }, [])

  const guardarDeuda = () => {
    // Validar campos obligatorios
    const validacionCampos = validarCamposObligatorios({
      descripcion: nuevaDeuda.descripcion,
      monto: nuevaDeuda.monto,
      persona: nuevaDeuda.persona
    })

    if (!validacionCampos.esValido) {
      const camposFaltantes = validacionCampos.camposFaltantes.join(", ")
      showToast(`Por favor, completa los campos: ${camposFaltantes}`, "error")
      return
    }

    // Validar monto
    const validacionMonto = validarMonto(nuevaDeuda.monto)
    if (!validacionMonto.esValido) {
      showToast(validacionMonto.mensaje, "error")
      return
    }

    // Validar fecha si se proporcionó
    if (nuevaDeuda.fechaVencimiento) {
      const validacionFecha = validarFecha(nuevaDeuda.fechaVencimiento)
      if (!validacionFecha.esValido) {
        showToast(validacionFecha.mensaje, "error")
        return
      }
    }

    if (isEditMode && deudaSeleccionada) {
      const deudasActualizadas = deudas.map(deuda => {
        if (deuda.id === deudaSeleccionada.id) {
          return {
            ...deuda,
            descripcion: nuevaDeuda.descripcion,
            monto: validacionMonto.valor!,
            tipo: nuevaDeuda.tipo as 'porCobrar' | 'porPagar',
            persona: nuevaDeuda.persona,
            fecha: nuevaDeuda.fecha,
            fechaVencimiento: nuevaDeuda.fechaVencimiento || undefined,
            notas: nuevaDeuda.notas || undefined
          }
        }
        return deuda
      })
      setDeudas(deudasActualizadas)
      localStorage.setItem('deudas', JSON.stringify(deudasActualizadas))
    } else {
      const deuda: Deuda = {
        id: Math.max(...deudas.map(d => d.id), 0) + 1,
        descripcion: nuevaDeuda.descripcion,
        monto: validacionMonto.valor!,
        montoPagado: 0,
        tipo: nuevaDeuda.tipo as 'porCobrar' | 'porPagar',
        persona: nuevaDeuda.persona,
        fecha: nuevaDeuda.fecha,
        estado: 'pendiente',
        fechaVencimiento: nuevaDeuda.fechaVencimiento || undefined,
        notas: nuevaDeuda.notas || undefined,
        historialPagos: []
      }

      const nuevasDeudas = [...deudas, deuda]
      setDeudas(nuevasDeudas)
      localStorage.setItem('deudas', JSON.stringify(nuevasDeudas))
    }
    
    setNuevaDeuda({
      descripcion: "",
      monto: "",
      tipo: "porPagar",
      persona: "",
      fecha: new Date().toISOString().split('T')[0],
      fechaVencimiento: "",
      notas: ""
    })
    setIsDialogOpen(false)
    setIsEditMode(false)
    setDeudaSeleccionada(null)
    
    // Mostrar mensaje de éxito
    const mensaje = isEditMode ? "Deuda actualizada con éxito ✅" : "Deuda agregada con éxito ✅"
    showToast(mensaje, "success")
  }

  const registrarPago = (monto: number) => {
    if (!deudaSeleccionada) return

    const montoPagoNum = monto
    if (isNaN(montoPagoNum) || montoPagoNum <= 0) {
      showToast("Por favor, ingresa un monto válido", "error")
      return
    }

    const montoPendiente = deudaSeleccionada.monto - deudaSeleccionada.montoPagado
    if (montoPagoNum > montoPendiente) {
      showToast(`No puedes pagar más de ${formatCurrency(montoPendiente)} que es el monto pendiente`, "error")
      return
    }

    const nuevoMontoPagado = deudaSeleccionada.montoPagado + montoPagoNum
    const estado: 'pendiente' | 'pagada' | 'parcial' = nuevoMontoPagado >= deudaSeleccionada.monto ? 'pagada' : 'parcial'
    
    const deudasActualizadas = deudas.map(deuda => {
      if (deuda.id === deudaSeleccionada.id) {
        const nuevoPago: PagoDeuda = {
          id: Math.max(...deuda.historialPagos.map(p => p.id), 0) + 1,
          monto: montoPagoNum,
          fecha: new Date().toISOString(),
          notas: `Pago ${deuda.historialPagos.length + 1}`
        }

        return {
          ...deuda,
          montoPagado: nuevoMontoPagado,
          estado,
          historialPagos: [...deuda.historialPagos, nuevoPago]
        }
      }
      return deuda
    })

    setDeudas(deudasActualizadas)
    localStorage.setItem('deudas', JSON.stringify(deudasActualizadas))
    setMontoPago("")
    setDeudaSeleccionada(null)
    setIsPagoDialogOpen(false)
    setIsPagoParcialDialogOpen(false)
    
    // Mostrar mensaje de éxito
    const mensaje = estado === 'pagada' 
      ? `Deuda "${deudaSeleccionada.descripcion}" pagada completamente ✅`
      : `Pago de ${formatCurrency(montoPagoNum)} registrado con éxito ✅`
    showToast(mensaje, "success")
  }

  const registrarPagoTotal = () => {
    if (!deudaSeleccionada) return
    const montoPendiente = deudaSeleccionada.monto - deudaSeleccionada.montoPagado
    registrarPago(montoPendiente)
  }

  const registrarPagoParcial = () => {
    if (!deudaSeleccionada || !montoPago) return
    registrarPago(parseFloat(montoPago))
  }

  const abrirDialogoEditar = (deuda: Deuda) => {
    setDeudaSeleccionada(deuda)
    setNuevaDeuda({
      descripcion: deuda.descripcion,
      monto: deuda.monto.toString(),
      tipo: deuda.tipo,
      persona: deuda.persona,
      fecha: deuda.fecha,
      fechaVencimiento: deuda.fechaVencimiento || "",
      notas: deuda.notas || ""
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const abrirConfirmacionEliminar = (deuda: Deuda) => {
    setDeudaAEliminar(deuda)
    setIsConfirmDialogOpen(true)
  }

  const eliminarDeuda = () => {
    if (!deudaAEliminar) return

    const nuevasDeudas = deudas.filter(d => d.id !== deudaAEliminar.id)
    setDeudas(nuevasDeudas)
    localStorage.setItem('deudas', JSON.stringify(nuevasDeudas))
    
    // Mostrar mensaje de éxito
    showToast("Deuda eliminada con éxito ✅", "success")
    
    // Limpiar estado
    setDeudaAEliminar(null)
  }

  const deudasPendientes = deudas.filter(d => d.estado !== 'pagada')
  const deudasPagadas = deudas.filter(d => d.estado === 'pagada')

  // Función para obtener el color del tipo de deuda
  const getTipoDeudaColor = (tipo: string) => {
    switch (tipo) {
      case 'porPagar':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'porCobrar':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'parcial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'pendiente':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header mejorado para móvil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Deudas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Deuda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                {isEditMode ? "Editar Deuda" : "Nueva Deuda"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Descripción</label>
                <Input
                  value={nuevaDeuda.descripcion}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, descripcion: e.target.value})}
                  placeholder="Ej: Préstamo personal"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Monto</label>
                <Input
                  type="number"
                  value={nuevaDeuda.monto}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, monto: e.target.value})}
                  placeholder="0.00"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Tipo</label>
                <Select
                  value={nuevaDeuda.tipo}
                  onValueChange={(value) => setNuevaDeuda({...nuevaDeuda, tipo: value})}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] scrollbar-hidden">
                    <SelectItem value="porPagar">Por Pagar</SelectItem>
                    <SelectItem value="porCobrar">Por Cobrar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Persona</label>
                <Input
                  value={nuevaDeuda.persona}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, persona: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Fecha</label>
                <Input
                  type="date"
                  value={nuevaDeuda.fecha}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, fecha: e.target.value})}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Fecha de Vencimiento (opcional)</label>
                <Input
                  type="date"
                  value={nuevaDeuda.fechaVencimiento}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, fechaVencimiento: e.target.value})}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium">Notas (opcional)</label>
                <Input
                  value={nuevaDeuda.notas}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, notas: e.target.value})}
                  placeholder="Notas adicionales"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={guardarDeuda} className="w-full sm:w-auto">
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 shadow-sm">
          <TabsTrigger value="pendientes" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="pagadas" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Pagadas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes" className="min-h-[300px]">
          {deudasPendientes.length === 0 ? (
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-6 text-center">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">No hay deudas pendientes</p>
                <p className="text-xs sm:text-sm mt-2 text-muted-foreground">¡Excelente! Todas tus deudas están pagadas o no tienes deudas registradas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {deudasPendientes.map((deuda) => (
                <Card key={deuda.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500 hover:border-l-red-600">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/20">
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{deuda.descripcion}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3" />
                            {deuda.persona}
                          </p>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Monto total */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Monto Total
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600">
                          {formatCurrency(deuda.monto)}
                        </p>
                      </div>

                      {/* Información de pagos */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Pagado</p>
                          <p className="font-medium text-sm text-green-600">{formatCurrency(deuda.montoPagado)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Pendiente</p>
                          <p className="font-medium text-sm text-orange-600">{formatCurrency(deuda.monto - deuda.montoPagado)}</p>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Fecha
                            </p>
                            <p className="font-medium text-sm">{formatDate(deuda.fecha)}</p>
                          </div>
                          {deuda.fechaVencimiento && (
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">Vencimiento</p>
                              <p className="font-medium text-sm">{formatDate(deuda.fechaVencimiento)}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Tipo</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoDeudaColor(deuda.tipo)}`}>
                              {deuda.tipo === 'porPagar' ? 'Por Pagar' : 'Por Cobrar'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Estado</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(deuda.estado)}`}>
                              {deuda.estado === 'pendiente' ? 'Pendiente' : 'Parcial'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setDeudaSeleccionada(deuda)
                            setIsPagoDialogOpen(true)
                          }}
                          className="flex-1"
                        >
                          Registrar Pago
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirDialogoEditar(deuda)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => abrirConfirmacionEliminar(deuda)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pagadas" className="min-h-[300px]">
          {deudasPagadas.length === 0 ? (
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">No hay deudas pagadas aún</p>
                <p className="text-xs sm:text-sm mt-2 text-muted-foreground">Aquí aparecerán las deudas que hayas marcado como pagadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {deudasPagadas.map((deuda) => (
                <Card key={deuda.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500 hover:border-l-green-600">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base truncate">{deuda.descripcion}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3" />
                            {deuda.persona}
                          </p>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Monto total */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Monto Total
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          {formatCurrency(deuda.monto)}
                        </p>
                      </div>

                      {/* Información adicional */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Fecha
                            </p>
                            <p className="font-medium text-sm">{formatDate(deuda.fecha)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Tipo</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoDeudaColor(deuda.tipo)}`}>
                              {deuda.tipo === 'porPagar' ? 'Por Pagar' : 'Por Cobrar'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Estado</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(deuda.estado)}`}>
                              Pagada
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Historial de pagos */}
                      {deuda.historialPagos.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">Historial de Pagos</p>
                          <div className="space-y-1">
                            {deuda.historialPagos.map((pago) => (
                              <div key={pago.id} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{formatDate(pago.fecha)}</span>
                                <span className="font-medium text-green-600">{formatCurrency(pago.monto)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Registrar Pago
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deudaSeleccionada && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deuda</label>
                  <p className="font-medium">{deudaSeleccionada.descripcion}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Total</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Pagado</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.montoPagado)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Pendiente</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto - deudaSeleccionada.montoPagado)}</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPagoDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="outline" onClick={() => {
              setIsPagoDialogOpen(false)
              setIsPagoParcialDialogOpen(true)
            }} className="w-full sm:w-auto">
              Pago Parcial
            </Button>
            <Button onClick={registrarPagoTotal} className="w-full sm:w-auto">
              Pago Total
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPagoParcialDialogOpen} onOpenChange={setIsPagoParcialDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Registrar Pago Parcial
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deudaSeleccionada && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deuda</label>
                  <p className="font-medium">{deudaSeleccionada.descripcion}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Total</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Pagado</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.montoPagado)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Pendiente</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto - deudaSeleccionada.montoPagado)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto del Pago</label>
                  <Input
                    type="number"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    placeholder="0.00"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPagoParcialDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={registrarPagoParcial} className="w-full sm:w-auto">
              Registrar Pago
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

      {/* Diálogo de confirmación para eliminar deuda */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setDeudaAEliminar(null)
        }}
        onConfirm={eliminarDeuda}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar la deuda "${deudaAEliminar?.descripcion}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
} 