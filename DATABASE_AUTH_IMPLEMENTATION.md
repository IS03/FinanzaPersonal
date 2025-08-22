# 🗄️ Implementación de Base de Datos y Autenticación con Google

## 📋 Tabla de Contenidos

- [🎯 Objetivo](#-objetivo)
- [🏗️ Arquitectura Propuesta](#️-arquitectura-propuesta)
- [🗄️ Base de Datos](#-base-de-datos)
- [🔐 Autenticación con Google](#-autenticación-con-google)
- [🚀 Implementación Paso a Paso](#-implementación-paso-a-paso)
- [📊 Migración de Datos](#-migración-de-datos)
- [🔒 Seguridad](#-seguridad)
- [📱 PWA y Offline](#-pwa-y-offline)
- [🧪 Testing](#-testing)
- [📈 Deployment](#-deployment)

---

## 🎯 Objetivo

Transformar Findly de una aplicación local (localStorage) a una aplicación completa con:
- **🗄️ Base de datos en la nube** - Persistencia y sincronización
- **🔐 Autenticación con Google** - Login seguro y fácil
- **📱 Sincronización multi-dispositivo** - Datos en todos tus dispositivos
- **☁️ Backup automático** - Seguridad de datos

---

## 🏗️ Arquitectura Propuesta

### Stack Tecnológico Recomendado

```mermaid
graph TD
    A[Frontend - Next.js] --> B[API Routes]
    B --> C[Prisma ORM]
    C --> D[PostgreSQL/Supabase]
    D --> E[Google OAuth]
    E --> F[NextAuth.js]
    F --> G[JWT Tokens]
    G --> H[PWA Service Worker]
```

### Opciones de Base de Datos

| Opción | Ventajas | Desventajas | Recomendación |
|--------|----------|-------------|---------------|
| **Supabase** | Fácil setup, PostgreSQL, Auth incluido | Menos control | ⭐ **Recomendado** |
| **PlanetScale** | Serverless MySQL, escalable | Menos features | ✅ Alternativa |
| **Vercel Postgres** | Integración perfecta con Vercel | Solo Vercel | ✅ Si usas Vercel |
| **MongoDB Atlas** | Flexible, JSON nativo | No SQL | ⚠️ Menos recomendado |

---

## 🗄️ Base de Datos

### Esquema de Base de Datos (PostgreSQL)

```sql
-- Usuarios (manejado por NextAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  color VARCHAR(7),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Tarjetas de crédito
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  bank VARCHAR(100) NOT NULL,
  limit_amount DECIMAL(12,2) NOT NULL,
  closing_day INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  used_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gastos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  payment_method VARCHAR(50) NOT NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  installments INTEGER DEFAULT 1,
  paid_installments INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ingresos
CREATE TABLE incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  source VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deudas
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('porPagar', 'porCobrar')),
  person VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_incomes_user_date ON incomes(user_id, date);
CREATE INDEX idx_debts_user_date ON debts(user_id, date);
CREATE INDEX idx_cards_user ON cards(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
```

### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  categories Category[]
  cards      Card[]
  expenses   Expense[]
  incomes    Income[]
  debts      Debt[]

  @@map("users")
}

model Category {
  id        String   @id @default(cuid())
  userId    String
  name      String
  emoji     String
  color     String?
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses Expense[]

  @@unique([userId, name])
  @@map("categories")
}

model Card {
  id           String   @id @default(cuid())
  userId       String
  name         String
  bank         String
  limitAmount  Decimal  @db.Decimal(12, 2)
  closingDay   Int
  dueDay       Int
  usedAmount   Decimal  @db.Decimal(12, 2) @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relaciones
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses Expense[]

  @@map("cards")
}

model Expense {
  id                String   @id @default(cuid())
  userId            String
  description       String
  amount            Decimal  @db.Decimal(12, 2)
  categoryId        String?
  paymentMethod     String
  cardId            String?
  installments      Int      @default(1)
  paidInstallments  Int      @default(0)
  date              DateTime @db.Date
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relaciones
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  card     Card?    @relation(fields: [cardId], references: [id], onDelete: SetNull)

  @@map("expenses")
}

model Income {
  id          String   @id @default(cuid())
  userId      String
  description String
  amount      Decimal  @db.Decimal(12, 2)
  source      String
  date        DateTime @db.Date
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("incomes")
}

model Debt {
  id          String   @id @default(cuid())
  userId      String
  description String
  amount      Decimal  @db.Decimal(12, 2)
  type        DebtType
  person      String
  date        DateTime @db.Date
  dueDate     DateTime? @db.Date
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("debts")
}

enum DebtType {
  porPagar
  porCobrar
}
```

---

## 🔐 Autenticación con Google

### Configuración de NextAuth.js

```bash
npm install next-auth @auth/prisma-adapter
```

### Configuración de Google OAuth

1. **Crear proyecto en Google Cloud Console**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API de Google+ 

2. **Configurar OAuth 2.0**
   - Ve a "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Tipo: "Web application"
   - URIs autorizados:
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)
     - `https://tu-dominio.com/api/auth/callback/google` (producción)

### Configuración de NextAuth

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
```

### Variables de Entorno

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/findly"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-super-seguro"
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
```

---

## 🚀 Implementación Paso a Paso

### 1. Configuración Inicial

```bash
# Instalar dependencias
npm install @prisma/client prisma next-auth @auth/prisma-adapter

# Inicializar Prisma
npx prisma init

# Generar cliente Prisma
npx prisma generate
```

### 2. Configurar Base de Datos

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3. API Routes

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### 4. Context de Autenticación

```typescript
// src/app/context/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

interface AuthContextType {
  user: any
  loading: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(status === 'loading')
  }, [status])

  const value = {
    user: session?.user,
    loading,
    signIn: () => signIn('google'),
    signOut: () => signOut(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 5. Servicios de Datos

```typescript
// src/lib/services/expenses.ts
import { prisma } from '../prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'

export class ExpenseService {
  static async getExpenses(userId: string) {
    return await prisma.expense.findMany({
      where: { userId },
      include: {
        category: true,
        card: true,
      },
      orderBy: { date: 'desc' },
    })
  }

  static async createExpense(data: any, userId: string) {
    return await prisma.expense.create({
      data: {
        ...data,
        userId,
      },
      include: {
        category: true,
        card: true,
      },
    })
  }

  static async updateExpense(id: string, data: any, userId: string) {
    return await prisma.expense.update({
      where: { id, userId },
      data,
      include: {
        category: true,
        card: true,
      },
    })
  }

  static async deleteExpense(id: string, userId: string) {
    return await prisma.expense.delete({
      where: { id, userId },
    })
  }
}
```

### 6. API Endpoints

```typescript
// src/app/api/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ExpenseService } from '@/lib/services/expenses'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const expenses = await ExpenseService.getExpenses(session.user.id)
    return NextResponse.json(expenses)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const expense = await ExpenseService.createExpense(data, session.user.id)
    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
```

---

## 📊 Migración de Datos

### Script de Migración

```typescript
// scripts/migrate-local-to-db.ts
import { prisma } from '../src/lib/prisma'

async function migrateUserData(userId: string, localData: any) {
  try {
    // Migrar categorías
    for (const category of localData.categories || []) {
      await prisma.category.create({
        data: {
          userId,
          name: category.nombre,
          emoji: category.emoji,
          color: category.color,
          isDefault: category.isDefault || false,
        },
      })
    }

    // Migrar tarjetas
    for (const card of localData.tarjetas || []) {
      await prisma.card.create({
        data: {
          userId,
          name: card.nombre,
          bank: card.banco,
          limitAmount: card.limite,
          closingDay: card.diaCierre,
          dueDay: card.diaVencimiento,
          usedAmount: card.saldoUsado || 0,
        },
      })
    }

    // Migrar gastos
    for (const expense of localData.gastos || []) {
      await prisma.expense.create({
        data: {
          userId,
          description: expense.descripcion,
          amount: expense.monto,
          categoryId: expense.categoriaId,
          paymentMethod: expense.medioPago,
          cardId: expense.tarjetaId,
          installments: expense.cuotas || 1,
          paidInstallments: expense.cuotasPagadas || 0,
          date: new Date(expense.fecha),
        },
      })
    }

    console.log('Migración completada exitosamente')
  } catch (error) {
    console.error('Error en migración:', error)
  }
}
```

### Componente de Migración

```typescript
// src/components/MigrationModal.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'

export function MigrationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const { user } = useAuth()

  const handleMigration = async () => {
    setMigrating(true)
    try {
      // Obtener datos locales
      const localData = {
        gastos: JSON.parse(localStorage.getItem('gastos') || '[]'),
        tarjetas: JSON.parse(localStorage.getItem('tarjetas') || '[]'),
        categorias: JSON.parse(localStorage.getItem('categorias') || '[]'),
        ingresos: JSON.parse(localStorage.getItem('ingresos') || '[]'),
        deudas: JSON.parse(localStorage.getItem('deudas') || '[]'),
      }

      // Enviar a API para migración
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData),
      })

      if (response.ok) {
        // Limpiar localStorage después de migración exitosa
        localStorage.clear()
        setIsOpen(false)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error en migración:', error)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Migrar Datos Locales</h2>
        <p className="mb-4">
          ¿Deseas migrar tus datos locales a la nube para sincronizarlos en todos tus dispositivos?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleMigration}
            disabled={migrating}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {migrating ? 'Migrando...' : 'Migrar'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔒 Seguridad

### Middleware de Autenticación

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Lógica adicional de middleware si es necesaria
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/gastos/:path*",
    "/ingresos/:path*",
    "/tarjetas/:path*",
    "/cuotas/:path*",
    "/deudas/:path*",
    "/categorias/:path*",
  ],
}
```

### Validación de Datos

```typescript
// src/lib/validations/expense.ts
import { z } from 'zod'

export const expenseSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').max(255),
  amount: z.number().positive('El monto debe ser positivo'),
  categoryId: z.string().optional(),
  paymentMethod: z.enum(['efectivo', 'debito', 'credito', 'transferencia']),
  cardId: z.string().optional(),
  installments: z.number().min(1).max(60).optional(),
  date: z.string().datetime(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
```

### Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function rateLimit(request: NextRequest, limit: number = 100, window: number = 60000) {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowStart = now - window

  const requestCounts = rateLimitMap.get(ip) || []
  const recentRequests = requestCounts.filter((timestamp: number) => timestamp > windowStart)

  if (recentRequests.length >= limit) {
    return false
  }

  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)
  return true
}
```

---

## 📱 PWA y Offline

### Service Worker

```typescript
// public/sw.js
const CACHE_NAME = 'findly-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})
```

### Sincronización Offline

```typescript
// src/lib/offline-sync.ts
class OfflineSync {
  private queue: any[] = []

  async addToQueue(action: any) {
    this.queue.push(action)
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue))
  }

  async processQueue() {
    if (!navigator.onLine) return

    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]')
    
    for (const action of queue) {
      try {
        await this.processAction(action)
      } catch (error) {
        console.error('Error procesando acción offline:', error)
      }
    }

    localStorage.removeItem('offlineQueue')
    this.queue = []
  }

  private async processAction(action: any) {
    const response = await fetch(action.url, {
      method: action.method,
      headers: action.headers,
      body: action.body,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }
}

export const offlineSync = new OfflineSync()
```

---

## 🧪 Testing

### Tests de API

```typescript
// __tests__/api/expenses.test.ts
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/expenses/route'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma')
jest.mock('next-auth')

describe('/api/expenses', () => {
  it('GET returns 401 when not authenticated', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await GET(req)

    expect(res._getStatusCode()).toBe(401)
  })

  it('POST creates new expense', async () => {
    const mockUser = { id: 'user-1' }
    const mockExpense = { id: 'expense-1', description: 'Test' }

    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: mockUser,
    })

    jest.spyOn(prisma.expense, 'create').mockResolvedValue(mockExpense as any)

    const { req, res } = createMocks({
      method: 'POST',
      body: { description: 'Test', amount: 100 },
    })

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(mockExpense)
  })
})
```

### Tests de Componentes

```typescript
// __tests__/components/ExpenseForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExpenseForm } from '@/components/ExpenseForm'

describe('ExpenseForm', () => {
  it('submits form with correct data', async () => {
    const mockSubmit = jest.fn()
    
    render(<ExpenseForm onSubmit={mockSubmit} />)

    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Test expense' },
    })
    
    fireEvent.change(screen.getByLabelText('Monto'), {
      target: { value: '100' },
    })

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        description: 'Test expense',
        amount: 100,
      })
    })
  })
})
```

---

## 📈 Deployment

### Vercel (Recomendado)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret"
  }
}
```

### Variables de Entorno en Producción

```bash
# Vercel Environment Variables
DATABASE_URL=postgresql://user:password@host:5432/findly
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu-secret-super-seguro
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### Scripts de Deployment

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed"
  }
}
```

---

## 🎯 Próximos Pasos

1. **Configurar Supabase** - Crear proyecto y configurar PostgreSQL
2. **Implementar NextAuth** - Configurar autenticación con Google
3. **Migrar Contextos** - Adaptar contextos existentes para usar API
4. **Implementar Offline Sync** - Sincronización cuando vuelve la conexión
5. **Testing** - Agregar tests unitarios y de integración
6. **Deployment** - Desplegar en Vercel con variables de entorno

---

## 📚 Recursos Adicionales

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

---

**¡Con esta implementación tendrás una aplicación completa con autenticación, base de datos y sincronización multi-dispositivo! 🚀**
