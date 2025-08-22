"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatCurrency, formatDate, cleanDuplicateData } from "@/lib/utils"
import { validarCamposObligatorios, validarMonto, validarFecha } from "@/lib/validations"
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Deudas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              Agregar Deuda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Editar Deuda" : "Nueva Deuda"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>Descripción</label>
                <Input
                  value={nuevaDeuda.descripcion}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, descripcion: e.target.value})}
                  placeholder="Ej: Préstamo personal"
                />
              </div>
              <div className="space-y-2">
                <label>Monto</label>
                <Input
                  type="number"
                  value={nuevaDeuda.monto}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, monto: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label>Tipo</label>
                <Select
                  value={nuevaDeuda.tipo}
                  onValueChange={(value) => setNuevaDeuda({...nuevaDeuda, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] scrollbar-hidden">
                    <SelectItem value="porPagar">Por Pagar</SelectItem>
                    <SelectItem value="porCobrar">Por Cobrar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Persona</label>
                <Input
                  value={nuevaDeuda.persona}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, persona: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <label>Fecha</label>
                <Input
                  type="date"
                  value={nuevaDeuda.fecha}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, fecha: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label>Fecha de Vencimiento (opcional)</label>
                <Input
                  type="date"
                  value={nuevaDeuda.fechaVencimiento}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, fechaVencimiento: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label>Notas (opcional)</label>
                <Input
                  value={nuevaDeuda.notas}
                  onChange={(e) => setNuevaDeuda({...nuevaDeuda, notas: e.target.value})}
                  placeholder="Notas adicionales"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={guardarDeuda}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="pagadas">Pagadas</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes" className="min-h-[300px]">
          <Card>
            <CardHeader>
              <CardTitle>Deudas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {deudasPendientes.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-sm sm:text-base">No hay deudas pendientes</p>
                  <p className="text-xs sm:text-sm mt-2">¡Excelente! Todas tus deudas están pagadas o no tienes deudas registradas</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Persona</TableHead>
                        <TableHead>Monto Total</TableHead>
                        <TableHead>Pagado</TableHead>
                        <TableHead>Pendiente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deudasPendientes.map((deuda) => (
                      <TableRow key={deuda.id}>
                        <TableCell>{deuda.descripcion}</TableCell>
                        <TableCell>{deuda.persona}</TableCell>
                        <TableCell>{formatCurrency(deuda.monto)}</TableCell>
                        <TableCell>{formatCurrency(deuda.montoPagado)}</TableCell>
                        <TableCell>{formatCurrency(deuda.monto - deuda.montoPagado)}</TableCell>
                        <TableCell>{formatDate(deuda.fecha)}</TableCell>
                        <TableCell>{deuda.fechaVencimiento ? formatDate(deuda.fechaVencimiento) : '-'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setDeudaSeleccionada(deuda)
                                setIsPagoDialogOpen(true)
                              }}
                            >
                              Registrar Pago
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => abrirDialogoEditar(deuda)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => abrirConfirmacionEliminar(deuda)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pagadas" className="min-h-[300px]">
          <Card>
            <CardHeader>
              <CardTitle>Deudas Pagadas</CardTitle>
            </CardHeader>
            <CardContent>
              {deudasPagadas.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-sm sm:text-base">No hay deudas pagadas aún</p>
                  <p className="text-xs sm:text-sm mt-2">Aquí aparecerán las deudas que hayas marcado como pagadas</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Persona</TableHead>
                        <TableHead>Monto Total</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Historial de Pagos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deudasPagadas.map((deuda) => (
                      <TableRow key={deuda.id}>
                        <TableCell>{deuda.descripcion}</TableCell>
                        <TableCell>{deuda.persona}</TableCell>
                        <TableCell>{formatCurrency(deuda.monto)}</TableCell>
                        <TableCell>{formatDate(deuda.fecha)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {deuda.historialPagos.map((pago) => (
                              <div key={pago.id} className="text-sm">
                                {formatCurrency(pago.monto)} - {formatDate(pago.fecha)}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deudaSeleccionada && (
              <>
                <div className="space-y-2">
                  <label>Deuda</label>
                  <p className="font-medium">{deudaSeleccionada.descripcion}</p>
                </div>
                <div className="space-y-2">
                  <label>Monto Total</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto)}</p>
                </div>
                <div className="space-y-2">
                  <label>Monto Pagado</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.montoPagado)}</p>
                </div>
                <div className="space-y-2">
                  <label>Monto Pendiente</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto - deudaSeleccionada.montoPagado)}</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsPagoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={() => {
              setIsPagoDialogOpen(false)
              setIsPagoParcialDialogOpen(true)
            }}>
              Pago Parcial
            </Button>
            <Button onClick={registrarPagoTotal}>
              Pago Total
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPagoParcialDialogOpen} onOpenChange={setIsPagoParcialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago Parcial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deudaSeleccionada && (
              <>
                <div className="space-y-2">
                  <label>Deuda</label>
                  <p className="font-medium">{deudaSeleccionada.descripcion}</p>
                </div>
                <div className="space-y-2">
                  <label>Monto Total</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto)}</p>
                </div>
                <div className="space-y-2">
                  <label>Monto Pagado</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.montoPagado)}</p>
                </div>
                <div className="space-y-2">
                  <label>Monto Pendiente</label>
                  <p className="font-medium">{formatCurrency(deudaSeleccionada.monto - deudaSeleccionada.montoPagado)}</p>
                </div>
                <div className="space-y-2">
                  <label>Monto del Pago</label>
                  <Input
                    type="number"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPagoParcialDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={registrarPagoParcial}>
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