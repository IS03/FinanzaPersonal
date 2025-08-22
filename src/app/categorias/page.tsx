"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MoreHorizontal, Plus, Pencil, Trash } from "lucide-react"
import { validarCamposObligatorios } from "@/lib/validations"
import { useCategorias } from "@/app/context/CategoriasContext"
import { EmojiPicker } from "@/components/ui/emoji-picker"

export default function CategoriasPage() {
  const { toast, showToast, hideToast } = useToast()
  const { categorias, agregarCategoria, actualizarCategoria, eliminarCategoria } = useCategorias()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<{ id: number; nombre: string; emoji: string } | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<{ id: number; nombre: string; emoji: string } | null>(null)
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    emoji: "📦"
  })

  const resetForm = () => {
    setNuevaCategoria({
      nombre: "",
      emoji: "📦"
    })
    setIsEditMode(false)
    setCategoriaEditando(null)
  }

  const abrirDialogoEditar = (categoria: { id: number; nombre: string; emoji: string }) => {
    setCategoriaEditando(categoria)
    setNuevaCategoria({
      nombre: categoria.nombre,
      emoji: categoria.emoji
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const abrirDialogoAgregar = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const abrirConfirmacionEliminar = (categoria: { id: number; nombre: string; emoji: string }) => {
    setCategoriaAEliminar(categoria)
    setIsConfirmDialogOpen(true)
  }

  const eliminarCategoriaHandler = () => {
    if (!categoriaAEliminar) return

    eliminarCategoria(categoriaAEliminar.id)
    
    // Mostrar mensaje de éxito
    showToast("Categoría eliminada con éxito ✅", "success")
    
    // Limpiar estado
    setCategoriaAEliminar(null)
  }

  const guardarCategoria = () => {
    // Validar campos obligatorios
    const validacionCampos = validarCamposObligatorios({
      nombre: nuevaCategoria.nombre
    })

    if (!validacionCampos.esValido) {
      const camposFaltantes = validacionCampos.camposFaltantes.join(", ")
      showToast(`Por favor, completa los campos: ${camposFaltantes}`, "error")
      return
    }

    // Validar que el nombre no esté duplicado
    const nombreExiste = categorias.some(cat => 
      cat.nombre.toLowerCase() === nuevaCategoria.nombre.toLowerCase() && 
      (!isEditMode || cat.id !== categoriaEditando?.id)
    )

    if (nombreExiste) {
      showToast("Ya existe una categoría con ese nombre", "error")
      return
    }

    if (isEditMode && categoriaEditando) {
      const categoriaActualizada = {
        ...categoriaEditando,
        nombre: nuevaCategoria.nombre,
        emoji: nuevaCategoria.emoji
      }
      actualizarCategoria(categoriaActualizada)
    } else {
      const categoria = {
        id: Math.max(...categorias.map(c => c.id), 0) + 1,
        nombre: nuevaCategoria.nombre,
        emoji: nuevaCategoria.emoji
      }
      agregarCategoria(categoria)
    }
    
    resetForm()
    setIsDialogOpen(false)
    
    // Mostrar mensaje de éxito
    const mensaje = isEditMode ? "Categoría actualizada con éxito ✅" : "Categoría agregada con éxito ✅"
    showToast(mensaje, "success")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
        <Button onClick={abrirDialogoAgregar}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emoji</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="text-2xl">{categoria.emoji}</TableCell>
                  <TableCell>{categoria.nombre}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => abrirDialogoEditar(categoria)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => abrirConfirmacionEliminar(categoria)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Categoría" : "Agregar Nueva Categoría"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Nombre</label>
              <Input
                value={nuevaCategoria.nombre}
                onChange={(e) => setNuevaCategoria({...nuevaCategoria, nombre: e.target.value})}
                placeholder="Ej: Alimentación"
              />
            </div>
            <div className="space-y-2">
              <label>Emoji</label>
              <div className="flex items-center gap-2">
                <div className="text-2xl p-2 border rounded w-12 h-12 flex items-center justify-center">
                  {nuevaCategoria.emoji}
                </div>
                <EmojiPicker 
                  onSelect={(emoji) => setNuevaCategoria({...nuevaCategoria, emoji})}
                  trigger={
                    <Button variant="outline">
                      Cambiar Emoji
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarCategoria}>
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

      {/* Diálogo de confirmación para eliminar categoría */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setCategoriaAEliminar(null)
        }}
        onConfirm={eliminarCategoriaHandler}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar la categoría "${categoriaAEliminar?.emoji} ${categoriaAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
} 