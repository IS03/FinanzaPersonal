"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Categoria } from '@/app/types/types'

interface CategoriasContextType {
  categorias: Categoria[]
  setCategorias: (categorias: Categoria[]) => void
  agregarCategoria: (categoria: Categoria) => void
  actualizarCategoria: (categoria: Categoria) => void
  eliminarCategoria: (id: number) => void
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined)

const categoriasPredefinidas: Categoria[] = [
  { id: 1, nombre: "Alimentación", emoji: "🍽️" },
  { id: 2, nombre: "Transporte", emoji: "🚗" },
  { id: 3, nombre: "Vivienda", emoji: "🏠" },
  { id: 4, nombre: "Servicios", emoji: "💡" },
  { id: 5, nombre: "Entretenimiento", emoji: "🎮" },
  { id: 6, nombre: "Salud", emoji: "💊" },
  { id: 7, nombre: "Educación", emoji: "📚" },
  { id: 8, nombre: "Ropa", emoji: "👕" },
  { id: 9, nombre: "Otros", emoji: "📦" }
]

export function CategoriasProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  // Cargar categorías desde localStorage al iniciar
  useEffect(() => {
    const savedCategorias = JSON.parse(localStorage.getItem('categorias') || '[]')
    if (savedCategorias.length === 0) {
      setCategorias(categoriasPredefinidas)
    } else {
      setCategorias(savedCategorias)
    }
  }, [])

  // Guardar categorías en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('categorias', JSON.stringify(categorias))
  }, [categorias])

  const agregarCategoria = (categoria: Categoria) => {
    setCategorias(prevCategorias => [...prevCategorias, categoria])
  }

  const actualizarCategoria = (categoriaActualizada: Categoria) => {
    setCategorias(prevCategorias => 
      prevCategorias.map(c => c.id === categoriaActualizada.id ? categoriaActualizada : c)
    )
  }

  const eliminarCategoria = (id: number) => {
    setCategorias(prevCategorias => prevCategorias.filter(c => c.id !== id))
  }

  return (
    <CategoriasContext.Provider value={{ 
      categorias, 
      setCategorias, 
      agregarCategoria, 
      actualizarCategoria, 
      eliminarCategoria
    }}>
      {children}
    </CategoriasContext.Provider>
  )
}

export function useCategorias() {
  const context = useContext(CategoriasContext)
  if (context === undefined) {
    throw new Error('useCategorias debe ser usado dentro de un CategoriasProvider')
  }
  return context
} 