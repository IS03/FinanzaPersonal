"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Tarjeta, Gasto } from "@/app/types/types"
import { useTarjetas } from "@/app/context/TarjetasContext"

const tarjetasPredefinidas: Tarjeta[] = [
  {
    id: 1,
    nombre: "Visa Gold",
    banco: "Banco Nación",
    limite: 150000,
    diaCierre: 15,
    diaVencimiento: 25,
    saldoUsado: 0,
    saldoDisponible: 150000
  },
  {
    id: 2,
    nombre: "Mastercard Platinum",
    banco: "Banco Ciudad",
    limite: 200000,
    diaCierre: 20,
    diaVencimiento: 30,
    saldoUsado: 0,
    saldoDisponible: 200000
  }
]

export default function TarjetasPage() {
  const { tarjetas, agregarTarjeta, actualizarTarjeta, eliminarTarjeta, actualizarSaldosTarjetas } = useTarjetas()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [tarjetaEditando, setTarjetaEditando] = useState<Tarjeta | null>(null)
  const [nuevaTarjeta, setNuevaTarjeta] = useState({
    nombre: "",
    banco: "",
    limite: "",
    diaCierre: "",
    diaVencimiento: ""
  })

  useEffect(() => {
    const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]')
    setGastos(savedGastos)
    
    // Si no hay tarjetas, inicializar con las predefinidas
    if (tarjetas.length === 0) {
      const tarjetasIniciales = tarjetasPredefinidas.map(t => ({
        ...t,
        saldoUsado: 0,
        saldoDisponible: t.limite
      }))
      tarjetasIniciales.forEach(t => agregarTarjeta(t))
    }
  }, [])

  useEffect(() => {
    if (gastos.length > 0) {
      actualizarSaldosTarjetas(gastos)
    }
  }, [gastos])

  const resetForm = () => {
    setNuevaTarjeta({
      nombre: "",
      banco: "",
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
      limite: tarjeta.limite.toString(),
      diaCierre: tarjeta.diaCierre.toString(),
      diaVencimiento: tarjeta.diaVencimiento.toString()
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const abrirDialogoAgregar = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const eliminarTarjetaHandler = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta tarjeta?")) {
      eliminarTarjeta(id)
    }
  }

  const guardarTarjeta = () => {
    if (!nuevaTarjeta.nombre || !nuevaTarjeta.banco || !nuevaTarjeta.limite || 
        !nuevaTarjeta.diaCierre || !nuevaTarjeta.diaVencimiento) {
      alert("Por favor, completa todos los campos")
      return
    }

    const diaCierre = parseInt(nuevaTarjeta.diaCierre)
    const diaVencimiento = parseInt(nuevaTarjeta.diaVencimiento)
    const limite = parseFloat(nuevaTarjeta.limite)

    if (diaCierre < 1 || diaCierre > 31 || diaVencimiento < 1 || diaVencimiento > 31) {
      alert("Los días deben estar entre 1 y 31")
      return
    }

    if (isEditMode && tarjetaEditando) {
      const tarjetaActualizada = {
        ...tarjetaEditando,
        nombre: nuevaTarjeta.nombre,
        banco: nuevaTarjeta.banco,
        limite: limite,
        diaCierre: diaCierre,
        diaVencimiento: diaVencimiento,
        saldoDisponible: limite - tarjetaEditando.saldoUsado
      }
      actualizarTarjeta(tarjetaActualizada)
    } else {
      const tarjeta: Tarjeta = {
        id: Date.now(),
        nombre: nuevaTarjeta.nombre,
        banco: nuevaTarjeta.banco,
        limite: limite,
        diaCierre: diaCierre,
        diaVencimiento: diaVencimiento,
        saldoUsado: 0,
        saldoDisponible: limite
      }
      agregarTarjeta(tarjeta)
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Tarjetas de Crédito</h2>
        <Button onClick={abrirDialogoAgregar}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tarjeta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((tarjeta) => (
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
                    <DropdownMenuItem onClick={() => eliminarTarjetaHandler(tarjeta.id)}>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Tarjeta" : "Agregar Nueva Tarjeta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Nombre de la Tarjeta</label>
              <Input
                value={nuevaTarjeta.nombre}
                onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, nombre: e.target.value})}
                placeholder="Ej: Visa Gold"
              />
            </div>
            <div className="space-y-2">
              <label>Banco</label>
              <Input
                value={nuevaTarjeta.banco}
                onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, banco: e.target.value})}
                placeholder="Ej: Banco Nación"
              />
            </div>
            <div className="space-y-2">
              <label>Límite de Crédito</label>
              <Input
                type="number"
                value={nuevaTarjeta.limite}
                onChange={(e) => setNuevaTarjeta({...nuevaTarjeta, limite: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label>Día de Cierre</label>
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
              <label>Día de Vencimiento</label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarTarjeta}>
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 