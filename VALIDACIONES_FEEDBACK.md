# ✅ Sistema de Validaciones y Feedback

## 📋 Tabla de Contenidos

- [🎯 Objetivo](#-objetivo)
- [🔍 Validaciones](#-validaciones)
- [💬 Sistema de Feedback](#-sistema-de-feedback)
- [🎨 Componentes de UI](#-componentes-de-ui)
- [📱 Experiencia de Usuario](#-experiencia-de-usuario)
- [🧪 Testing](#-testing)
- [🔧 Configuración](#-configuración)

---

## 🎯 Objetivo

Implementar un sistema robusto de validaciones y feedback que garantice:
- **✅ Datos válidos** - Validación en tiempo real
- **💬 Feedback claro** - Mensajes de error y éxito
- **🎯 UX intuitiva** - Experiencia fluida sin frustraciones
- **🔒 Seguridad** - Prevención de datos maliciosos

---

## 🔍 Validaciones

### Esquemas de Validación (Zod)

```typescript
// src/lib/validations/schemas.ts
import { z } from 'zod'

// Validación de gastos
export const expenseSchema = z.object({
  description: z.string()
    .min(1, 'La descripción es requerida')
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .trim(),
  amount: z.number()
    .positive('El monto debe ser positivo')
    .max(999999999.99, 'El monto no puede exceder 999,999,999.99'),
  categoryId: z.string().optional(),
  paymentMethod: z.enum(['efectivo', 'debito', 'credito', 'transferencia'], {
    errorMap: () => ({ message: 'Método de pago inválido' })
  }),
  cardId: z.string().optional(),
  installments: z.number()
    .min(1, 'Mínimo 1 cuota')
    .max(60, 'Máximo 60 cuotas')
    .optional(),
  date: z.string()
    .datetime('Fecha inválida')
    .refine((date) => new Date(date) <= new Date(), {
      message: 'La fecha no puede ser futura'
    }),
})

// Validación de tarjetas
export const cardSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  bank: z.string()
    .min(1, 'El banco es requerido')
    .max(100, 'El banco no puede exceder 100 caracteres')
    .trim(),
  limitAmount: z.number()
    .positive('El límite debe ser positivo')
    .max(999999999.99, 'El límite no puede exceder 999,999,999.99'),
  closingDay: z.number()
    .min(1, 'Día de cierre debe ser entre 1 y 31')
    .max(31, 'Día de cierre debe ser entre 1 y 31'),
  dueDay: z.number()
    .min(1, 'Día de vencimiento debe ser entre 1 y 31')
    .max(31, 'Día de vencimiento debe ser entre 1 y 31'),
})

// Validación de categorías
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  emoji: z.string()
    .min(1, 'El emoji es requerido')
    .max(10, 'Emoji inválido'),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color inválido (formato: #RRGGBB)')
    .optional(),
})

// Validación de ingresos
export const incomeSchema = z.object({
  description: z.string()
    .min(1, 'La descripción es requerida')
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .trim(),
  amount: z.number()
    .positive('El monto debe ser positivo')
    .max(999999999.99, 'El monto no puede exceder 999,999,999.99'),
  source: z.string()
    .min(1, 'La fuente es requerida')
    .max(100, 'La fuente no puede exceder 100 caracteres')
    .trim(),
  date: z.string()
    .datetime('Fecha inválida')
    .refine((date) => new Date(date) <= new Date(), {
      message: 'La fecha no puede ser futura'
    }),
})

// Validación de deudas
export const debtSchema = z.object({
  description: z.string()
    .min(1, 'La descripción es requerida')
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .trim(),
  amount: z.number()
    .positive('El monto debe ser positivo')
    .max(999999999.99, 'El monto no puede exceder 999,999,999.99'),
  type: z.enum(['porPagar', 'porCobrar'], {
    errorMap: () => ({ message: 'Tipo de deuda inválido' })
  }),
  person: z.string()
    .min(1, 'La persona es requerida')
    .max(100, 'La persona no puede exceder 100 caracteres')
    .trim(),
  date: z.string()
    .datetime('Fecha inválida')
    .refine((date) => new Date(date) <= new Date(), {
      message: 'La fecha no puede ser futura'
    }),
  dueDate: z.string()
    .datetime('Fecha de vencimiento inválida')
    .optional(),
  notes: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
})
```

### Validaciones Personalizadas

```typescript
// src/lib/validations/custom.ts
import { z } from 'zod'

// Validación de formato de moneda
export const currencySchema = z.string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Formato de moneda inválido (ej: 100.50)')
  .transform((val) => parseFloat(val))

// Validación de fecha en formato específico
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
  .refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha inválida'
  })

// Validación de email
export const emailSchema = z.string()
  .email('Email inválido')
  .toLowerCase()
  .trim()

// Validación de contraseña
export const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial')

// Validación de tarjeta de crédito
export const creditCardSchema = z.string()
  .regex(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/, 'Número de tarjeta inválido')
  .transform((val) => val.replace(/[\s-]/g, ''))

// Validación de CVV
export const cvvSchema = z.string()
  .regex(/^\d{3,4}$/, 'CVV inválido (3 o 4 dígitos)')
```

### Validaciones de Negocio

```typescript
// src/lib/validations/business.ts
import { z } from 'zod'

// Validación de límite de tarjeta vs gastos
export const validateCardLimit = (limit: number, used: number, newAmount: number) => {
  if (used + newAmount > limit) {
    throw new Error(`El gasto excede el límite disponible de $${limit - used}`)
  }
  return true
}

// Validación de cuotas vs método de pago
export const validateInstallments = (method: string, installments: number) => {
  if (method === 'credito' && installments > 1) {
    return true
  }
  if (method !== 'credito' && installments > 1) {
    throw new Error('Las cuotas solo están disponibles para pagos con crédito')
  }
  return true
}

// Validación de fechas de tarjeta
export const validateCardDates = (closingDay: number, dueDay: number) => {
  if (closingDay === dueDay) {
    throw new Error('El día de cierre y vencimiento no pueden ser iguales')
  }
  return true
}

// Validación de saldo disponible
export const validateBalance = (income: number, expenses: number, newExpense: number) => {
  const available = income - expenses
  if (available - newExpense < 0) {
    throw new Error('Saldo insuficiente para este gasto')
  }
  return true
}
```

---

## 💬 Sistema de Feedback

### Tipos de Feedback

```typescript
// src/lib/types/feedback.ts
export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

export interface FeedbackMessage {
  id: string
  type: FeedbackType
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}
```

### Hook de Feedback

```typescript
// src/hooks/useFeedback.ts
import { useState, useCallback } from 'react'
import { FeedbackMessage, FeedbackType } from '@/lib/types/feedback'

export function useFeedback() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])

  const showFeedback = useCallback((
    type: FeedbackType,
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString()
    const newMessage: FeedbackMessage = {
      id,
      type,
      title,
      message,
      duration,
    }

    setMessages(prev => [...prev, newMessage])

    if (duration > 0) {
      setTimeout(() => {
        removeFeedback(id)
      }, duration)
    }
  }, [])

  const removeFeedback = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }, [])

  const showSuccess = useCallback((title: string, message: string) => {
    showFeedback('success', title, message)
  }, [showFeedback])

  const showError = useCallback((title: string, message: string) => {
    showFeedback('error', title, message, 0) // Los errores no se auto-ocultan
  }, [showFeedback])

  const showWarning = useCallback((title: string, message: string) => {
    showFeedback('warning', title, message)
  }, [showFeedback])

  const showInfo = useCallback((title: string, message: string) => {
    showFeedback('info', title, message)
  }, [showFeedback])

  return {
    messages,
    showFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeFeedback,
  }
}
```

### Componente de Toast

```typescript
// src/components/ui/Toast.tsx
'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { FeedbackMessage } from '@/lib/types/feedback'

interface ToastProps {
  message: FeedbackMessage
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function Toast({ message, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = icons[message.type]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(message.id), 300)
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        border rounded-lg shadow-lg p-4
        transform transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${colors[message.type]}
      `}
    >
      <div className="flex items-start">
        <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{message.title}</h4>
          <p className="text-sm mt-1">{message.message}</p>
          {message.action && (
            <button
              onClick={message.action.onClick}
              className="text-sm underline mt-2 hover:no-underline"
            >
              {message.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
```

### Componente de Validación de Formulario

```typescript
// src/components/ui/FormField.tsx
'use client'

import { useState, useEffect } from 'react'
import { ValidationError } from '@/lib/types/feedback'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  errors?: ValidationError[]
  value?: string | number
  onChange?: (value: string) => void
  onBlur?: () => void
  className?: string
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  errors = [],
  value,
  onChange,
  onBlur,
  className = '',
}: FormFieldProps) {
  const [isTouched, setIsTouched] = useState(false)
  const fieldErrors = errors.filter(error => error.field === name)
  const hasError = isTouched && fieldErrors.length > 0

  const handleBlur = () => {
    setIsTouched(true)
    onBlur?.()
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-2 border rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${hasError 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500'
          }
        `}
      />
      
      {hasError && (
        <div className="mt-1">
          {fieldErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🎨 Componentes de UI

### Botón con Estados

```typescript
// src/components/ui/Button.tsx
'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (loading || disabled) return
    
    setIsLoading(true)
    try {
      await onClick?.()
    } finally {
      setIsLoading(false)
    }
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const isDisabled = disabled || loading || isLoading

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {(loading || isLoading) && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  )
}
```

### Modal de Confirmación

```typescript
// src/components/ui/ConfirmDialog.tsx
'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const variants = {
    danger: 'text-red-600 bg-red-50',
    warning: 'text-yellow-600 bg-yellow-50',
    info: 'text-blue-600 bg-blue-50',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className={`flex items-center p-3 rounded-lg mb-4 ${variants[variant]}`}>
          <AlertTriangle className="w-6 h-6 mr-3" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 rounded-md font-medium
              ${variant === 'danger' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
              disabled:opacity-50
            `}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 📱 Experiencia de Usuario

### Validación en Tiempo Real

```typescript
// src/hooks/useFormValidation.ts
import { useState, useEffect } from 'react'
import { z } from 'zod'

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(false)

  const validate = (data: Partial<T>) => {
    try {
      schema.parse(data)
      setErrors({})
      setIsValid(true)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
        setIsValid(false)
      }
      return false
    }
  }

  const getFieldError = (field: string) => errors[field] || ''

  const clearErrors = () => {
    setErrors({})
    setIsValid(false)
  }

  return {
    errors,
    isValid,
    validate,
    getFieldError,
    clearErrors,
  }
}
```

### Feedback Contextual

```typescript
// src/components/ui/InlineFeedback.tsx
'use client'

import { CheckCircle, AlertCircle, Info } from 'lucide-react'

interface InlineFeedbackProps {
  type: 'success' | 'error' | 'info'
  message: string
  show?: boolean
}

export function InlineFeedback({ type, message, show = true }: InlineFeedbackProps) {
  if (!show) return null

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  }

  const Icon = icons[type]

  return (
    <div className={`flex items-center p-3 rounded-md border ${colors[type]}`}>
      <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}
```

### Indicadores de Carga

```typescript
// src/components/ui/LoadingStates.tsx
'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}
```

---

## 🧪 Testing

### Tests de Validación

```typescript
// __tests__/validations/expense.test.ts
import { expenseSchema } from '@/lib/validations/schemas'

describe('Expense Validation', () => {
  it('validates correct expense data', () => {
    const validData = {
      description: 'Comida',
      amount: 100.50,
      paymentMethod: 'efectivo',
      date: new Date().toISOString(),
    }

    const result = expenseSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects empty description', () => {
    const invalidData = {
      description: '',
      amount: 100,
      paymentMethod: 'efectivo',
      date: new Date().toISOString(),
    }

    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('La descripción es requerida')
    }
  })

  it('rejects negative amount', () => {
    const invalidData = {
      description: 'Comida',
      amount: -100,
      paymentMethod: 'efectivo',
      date: new Date().toISOString(),
    }

    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('El monto debe ser positivo')
    }
  })

  it('rejects future dates', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    const invalidData = {
      description: 'Comida',
      amount: 100,
      paymentMethod: 'efectivo',
      date: futureDate.toISOString(),
    }

    const result = expenseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('La fecha no puede ser futura')
    }
  })
})
```

### Tests de Feedback

```typescript
// __tests__/components/Toast.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Toast } from '@/components/ui/Toast'

describe('Toast Component', () => {
  const mockMessage = {
    id: '1',
    type: 'success' as const,
    title: 'Éxito',
    message: 'Operación completada',
  }

  const mockOnRemove = jest.fn()

  it('renders toast with correct content', () => {
    render(<Toast message={mockMessage} onRemove={mockOnRemove} />)
    
    expect(screen.getByText('Éxito')).toBeInTheDocument()
    expect(screen.getByText('Operación completada')).toBeInTheDocument()
  })

  it('calls onRemove when close button is clicked', () => {
    render(<Toast message={mockMessage} onRemove={mockOnRemove} />)
    
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    
    expect(mockOnRemove).toHaveBeenCalledWith('1')
  })

  it('applies correct styles for different types', () => {
    const { rerender } = render(
      <Toast message={mockMessage} onRemove={mockOnRemove} />
    )

    // Success toast
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50')

    // Error toast
    const errorMessage = { ...mockMessage, type: 'error' as const }
    rerender(<Toast message={errorMessage} onRemove={mockOnRemove} />)
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
  })
})
```

---

## 🔧 Configuración

### Configuración Global

```typescript
// src/lib/config/validation.ts
export const VALIDATION_CONFIG = {
  // Límites de caracteres
  limits: {
    description: 255,
    name: 100,
    notes: 1000,
    person: 100,
    source: 100,
  },
  
  // Límites numéricos
  amounts: {
    min: 0.01,
    max: 999999999.99,
  },
  
  // Límites de cuotas
  installments: {
    min: 1,
    max: 60,
  },
  
  // Días de tarjeta
  cardDays: {
    min: 1,
    max: 31,
  },
  
  // Configuración de feedback
  feedback: {
    defaultDuration: 5000,
    errorDuration: 0, // Los errores no se auto-ocultan
    maxToasts: 5,
  },
  
  // Configuración de validación en tiempo real
  realtime: {
    debounceMs: 300,
    validateOnBlur: true,
    validateOnChange: false,
  },
}
```

### Configuración de Mensajes

```typescript
// src/lib/config/messages.ts
export const VALIDATION_MESSAGES = {
  required: 'Este campo es requerido',
  email: 'Email inválido',
  minLength: (field: string, min: number) => 
    `${field} debe tener al menos ${min} caracteres`,
  maxLength: (field: string, max: number) => 
    `${field} no puede exceder ${max} caracteres`,
  positive: 'El valor debe ser positivo',
  futureDate: 'La fecha no puede ser futura',
  invalidFormat: 'Formato inválido',
  insufficientFunds: 'Saldo insuficiente',
  cardLimitExceeded: 'Límite de tarjeta excedido',
}

export const SUCCESS_MESSAGES = {
  expenseCreated: 'Gasto creado exitosamente',
  expenseUpdated: 'Gasto actualizado exitosamente',
  expenseDeleted: 'Gasto eliminado exitosamente',
  cardCreated: 'Tarjeta creada exitosamente',
  cardUpdated: 'Tarjeta actualizada exitosamente',
  cardDeleted: 'Tarjeta eliminada exitosamente',
  categoryCreated: 'Categoría creada exitosamente',
  categoryUpdated: 'Categoría actualizada exitosamente',
  categoryDeleted: 'Categoría eliminada exitosamente',
  dataMigrated: 'Datos migrados exitosamente',
}

export const ERROR_MESSAGES = {
  networkError: 'Error de conexión. Verifica tu internet.',
  serverError: 'Error del servidor. Intenta nuevamente.',
  unauthorized: 'No tienes permisos para realizar esta acción.',
  notFound: 'Recurso no encontrado.',
  validationError: 'Datos inválidos. Revisa los campos marcados.',
  unknownError: 'Error inesperado. Contacta soporte.',
}
```

---

## 🎯 Mejores Prácticas

### 1. Validación Progresiva
- Validar campos individuales al perder el foco
- Validar formulario completo al enviar
- Mostrar errores contextuales

### 2. Feedback Inmediato
- Confirmar acciones exitosas
- Explicar errores claramente
- Ofrecer sugerencias de corrección

### 3. UX Consistente
- Usar iconos consistentes
- Mantener colores coherentes
- Animaciones suaves y apropiadas

### 4. Accesibilidad
- Mensajes de error asociados a campos
- Navegación por teclado
- Soporte para lectores de pantalla

### 5. Performance
- Debounce en validaciones en tiempo real
- Lazy loading de componentes pesados
- Optimización de re-renders

---

**¡Con este sistema de validaciones y feedback tendrás una experiencia de usuario excepcional! 🚀**
