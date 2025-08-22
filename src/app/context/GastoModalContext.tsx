"use client"

import React, { createContext, useContext, useState } from 'react'

interface GastoModalContextType {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const GastoModalContext = createContext<GastoModalContextType | undefined>(undefined)

export function GastoModalProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <GastoModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </GastoModalContext.Provider>
  )
}

export function useGastoModal() {
  const context = useContext(GastoModalContext)
  if (context === undefined) {
    throw new Error('useGastoModal must be used within a GastoModalProvider')
  }
  return context
}
