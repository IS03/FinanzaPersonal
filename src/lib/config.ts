export const APP_CONFIG = {
  name: "Finly",
  description: "Sistema de control de finanzas personales",
  version: "1.0.0",
  author: "Finly Team",
  features: {
    expenses: true,
    income: true,
    creditCards: true,
    installments: true,
    debts: true,
    categories: true,
    filters: true,
    analytics: true
  },
  defaultCurrency: "ARS",
  dateFormat: "es-AR",
  storage: {
    prefix: "finly_",
    keys: {
      gastos: "gastos",
      ingresos: "ingresos",
      tarjetas: "tarjetas",
      categorias: "categorias",
      deudas: "deudas"
    }
  }
}

export const NAVIGATION_ITEMS = [
  {
    href: "/",
    label: "Resumen",
    description: "Dashboard principal con métricas financieras"
  },
  {
    href: "/gastos",
    label: "Gastos",
    description: "Registro y gestión de gastos"
  },
  {
    href: "/ingresos",
    label: "Ingresos",
    description: "Control de ingresos por fuentes"
  },
  {
    href: "/tarjetas",
    label: "Tarjetas",
    description: "Gestión de tarjetas de crédito"
  },
  {
    href: "/cuotas",
    label: "Cuotas",
    description: "Seguimiento de pagos en cuotas"
  },
  {
    href: "/deudas",
    label: "Deudas",
    description: "Control de deudas por cobrar y pagar"
  },
  {
    href: "/categorias",
    label: "Categorías",
    description: "Personalización de categorías"
  }
]
