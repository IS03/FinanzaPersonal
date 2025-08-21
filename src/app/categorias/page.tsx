"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash } from "lucide-react"
import { useCategorias } from "@/app/context/CategoriasContext"
import { EmojiPicker } from "@/components/ui/emoji-picker"

export default function CategoriasPage() {
  const { categorias, agregarCategoria, actualizarCategoria, eliminarCategoria } = useCategorias()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<{ id: number; nombre: string; emoji: string } | null>(null)
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

  const eliminarCategoriaHandler = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      eliminarCategoria(id)
    }
  }

  const guardarCategoria = () => {
    if (!nuevaCategoria.nombre) {
      alert("Por favor, ingresa un nombre para la categoría")
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
        id: Date.now(),
        nombre: nuevaCategoria.nombre,
        emoji: nuevaCategoria.emoji
      }
      agregarCategoria(categoria)
    }
    
    resetForm()
    setIsDialogOpen(false)
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
                        <DropdownMenuItem onClick={() => eliminarCategoriaHandler(categoria.id)}>
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
    </div>
  )
} 