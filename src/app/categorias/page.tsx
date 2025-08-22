"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toast, useToast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { MoreHorizontal, Plus, Pencil, Trash, Tag, FolderOpen } from "lucide-react"
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
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header mejorado para móvil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Categorías</h2>
        <Button onClick={abrirDialogoAgregar} className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      {/* Grid de categorías mejorado */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categorias.map((categoria) => (
          <Card key={categoria.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 hover:border-l-purple-600">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-2xl">
                    {categoria.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">{categoria.nombre}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Tag className="h-3 w-3" />
                      Categoría
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
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-purple-50 dark:bg-purple-950/30">
                    <FolderOpen className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">ID: {categoria.id}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {categoria.nombre.length} caracteres
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje cuando no hay categorías */}
      {categorias.length === 0 && (
        <div className="text-center py-8">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No hay categorías para mostrar</p>
          <p className="text-sm text-muted-foreground mt-2">Agrega tu primera categoría para organizar tus gastos</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {isEditMode ? "Editar Categoría" : "Agregar Nueva Categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium">Nombre de la Categoría</label>
              <Input
                value={nuevaCategoria.nombre}
                onChange={(e) => setNuevaCategoria({...nuevaCategoria, nombre: e.target.value})}
                placeholder="Ej: Alimentación"
                className="focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium">Emoji</label>
              <div className="flex items-center gap-3">
                <div className="text-2xl p-3 border rounded-lg w-16 h-16 flex items-center justify-center bg-purple-50 dark:bg-purple-950/30">
                  {nuevaCategoria.emoji}
                </div>
                <EmojiPicker 
                  onSelect={(emoji) => setNuevaCategoria({...nuevaCategoria, emoji})}
                  trigger={
                    <Button variant="outline" className="focus:ring-2 focus:ring-purple-500">
                      Cambiar Emoji
                    </Button>
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Selecciona un emoji que represente mejor tu categoría
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={guardarCategoria} className="w-full sm:w-auto">
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