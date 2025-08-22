"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Toast, useToast } from "@/components/ui/toast"
import { validarSaldoTarjeta, validarCamposObligatorios, validarMonto, validarFecha, validarCuotas } from "@/lib/validations"
import type { Gasto, MedioPago } from "@/app/types/types"
import { useTarjetas } from "@/app/context/TarjetasContext"
import { useCategorias } from "@/app/context/CategoriasContext"
import { useGastoModal } from "@/app/context/GastoModalContext"

export function GastoModal() {
  const { isModalOpen, closeModal } = useGastoModal()
  const { tarjetas, actualizarSaldosTarjetas } = useTarjetas()
  const { categorias } = useCategorias()
  const { toast, showToast, hideToast } = useToast()
  
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
  }

  const handleClose = () => {
    resetForm()
    closeModal()
  }

  const guardarGasto = () => {
    // Validar campos obligatorios
    const validacionCampos = validarCamposObligatorios({
      descripcion: nuevoGasto.descripcion,
      monto: nuevoGasto.monto,
      categoriaId: nuevoGasto.categoriaId,
      fecha: nuevoGasto.fecha
    })

    if (!validacionCampos.esValido) {
      const camposFaltantes = validacionCampos.camposFaltantes.join(", ")
      showToast(`Por favor, completa los campos: ${camposFaltantes}`, "error")
      return
    }

    // Validar monto
    const validacionMonto = validarMonto(nuevoGasto.monto)
    if (!validacionMonto.esValido) {
      showToast(validacionMonto.mensaje, "error")
      return
    }

    // Validar fecha
    const validacionFecha = validarFecha(nuevoGasto.fecha)
    if (!validacionFecha.esValido) {
      showToast(validacionFecha.mensaje, "error")
      return
    }

    // Validar cuotas si es crédito
    const validacionCuotas = validarCuotas(nuevoGasto.cuotas, nuevoGasto.medioPago)
    if (!validacionCuotas.esValido) {
      showToast(validacionCuotas.mensaje, "error")
      return
    }

    const monto = validacionMonto.valor!
    const cuotas = validacionCuotas.valor
    const tarjetaId = nuevoGasto.tarjetaId ? parseInt(nuevoGasto.tarjetaId) : undefined
    const categoriaId = parseInt(nuevoGasto.categoriaId)

    // Crear objeto gasto temporal para validar saldo de tarjeta
    const gastoTemp: Gasto = {
      id: 0,
      descripcion: nuevoGasto.descripcion,
      monto: monto,
      categoriaId: categoriaId,
      fecha: nuevoGasto.fecha,
      medioPago: nuevoGasto.medioPago,
      tarjetaId: tarjetaId,
      cuotas: cuotas
    }

    // Validar saldo de tarjeta si es crédito
    const validacionSaldo = validarSaldoTarjeta(gastoTemp, tarjetas)
    if (!validacionSaldo.esValido) {
      showToast(validacionSaldo.mensaje, "error")
      return
    }

    // Obtener gastos existentes
    const gastosExistentes = JSON.parse(localStorage.getItem('gastos') || '[]')
    
    const gasto: Gasto = {
      id: Math.max(...gastosExistentes.map((g: Gasto) => g.id), 0) + 1,
      descripcion: nuevoGasto.descripcion,
      monto: monto,
      categoriaId: categoriaId,
      fecha: nuevoGasto.fecha,
      medioPago: nuevoGasto.medioPago,
      tarjetaId: tarjetaId,
      cuotas: cuotas
    }

    const nuevosGastos = [...gastosExistentes, gasto]
    localStorage.setItem('gastos', JSON.stringify(nuevosGastos))
    
    // Actualizar saldos de tarjetas
    actualizarSaldosTarjetas(nuevosGastos)
    
    resetForm()
    closeModal()
    
    // Mostrar mensaje de éxito
    showToast("Gasto agregado con éxito ✅", "success")
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Agregar Gasto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="descripcion" className="text-sm sm:text-right">
                Descripción
              </label>
              <Input
                id="descripcion"
                value={nuevoGasto.descripcion}
                onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="monto" className="text-sm sm:text-right">
                Monto
              </label>
              <Input
                id="monto"
                type="number"
                value={nuevoGasto.monto}
                onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="categoria" className="text-sm sm:text-right">
                Categoría
              </label>
              <select
                id="categoria"
                value={nuevoGasto.categoriaId}
                onChange={(e) => setNuevoGasto({...nuevoGasto, categoriaId: e.target.value})}
                className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.emoji} {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="fecha" className="text-sm sm:text-right">
                Fecha
              </label>
              <Input
                id="fecha"
                type="date"
                value={nuevoGasto.fecha}
                onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
                className="col-span-1 sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="medioPago" className="text-sm sm:text-right">
                Medio de Pago
              </label>
              <select
                id="medioPago"
                value={nuevoGasto.medioPago}
                onChange={(e) => setNuevoGasto({...nuevoGasto, medioPago: e.target.value as MedioPago})}
                className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="efectivo">Efectivo</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            {(nuevoGasto.medioPago === "credito" || nuevoGasto.medioPago === "debito") && (
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <label htmlFor="tarjeta" className="text-sm sm:text-right">
                  Tarjeta
                </label>
                <select
                  id="tarjeta"
                  value={nuevoGasto.tarjetaId}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, tarjetaId: e.target.value})}
                  className="col-span-1 sm:col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona una tarjeta</option>
                  {tarjetas
                    .filter((tarjeta, index, self) => 
                      index === self.findIndex(t => t.id === tarjeta.id)
                    )
                    .filter(tarjeta => {
                      if (nuevoGasto.medioPago === "credito") {
                        return tarjeta.tipo === "credito"
                      } else if (nuevoGasto.medioPago === "debito") {
                        return tarjeta.tipo === "debito"
                      }
                      return true
                    })
                    .map((tarjeta) => (
                      <option key={tarjeta.id} value={tarjeta.id}>
                        {tarjeta.nombre} - {tarjeta.banco} ({tarjeta.tipo})
                      </option>
                    ))}
                </select>
              </div>
            )}
            {nuevoGasto.medioPago === "credito" && (
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <label htmlFor="cuotas" className="text-sm sm:text-right">
                  Cuotas
                </label>
                <Input
                  id="cuotas"
                  type="number"
                  value={nuevoGasto.cuotas}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, cuotas: e.target.value})}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={guardarGasto} className="w-full sm:w-auto">
              Agregar Gasto
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
    </>
  )
}
