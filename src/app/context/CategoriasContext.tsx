"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Categoria } from '@/app/types/types'
import { cleanDuplicateData } from '@/lib/utils'

interface CategoriasContextType {
  categorias: Categoria[]
  setCategorias: (categorias: Categoria[]) => void
  agregarCategoria: (categoria: Categoria) => void
  actualizarCategoria: (categoria: Categoria) => void
  eliminarCategoria: (id: number) => void
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined)

const categoriasPredefinidas = [
  { nombre: "Alimentación", emoji: "🍽️" },
  { nombre: "Transporte", emoji: "🚗" },
  { nombre: "Vivienda", emoji: "🏠" },
  { nombre: "Servicios", emoji: "💡" },
  { nombre: "Entretenimiento", emoji: "🎮" },
  { nombre: "Salud", emoji: "💊" },
  { nombre: "Educación", emoji: "📚" },
  { nombre: "Ropa", emoji: "👕" },
  { nombre: "Otros", emoji: "📦" }
]

export function CategoriasProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  // Cargar categorías desde localStorage al iniciar
  useEffect(() => {
    const savedCategorias = JSON.parse(localStorage.getItem('categorias') || '[]')
    if (savedCategorias.length === 0) {
      const categoriasConIds = categoriasPredefinidas.map((cat, index) => ({
        ...cat,
        id: index + 1
      }))
      setCategorias(categoriasConIds)
    } else {
      const cleanedCategorias = cleanDuplicateData(savedCategorias)
      setCategorias(cleanedCategorias)
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