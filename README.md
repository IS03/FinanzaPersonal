# 📊 Finly - Control de Finanzas Personales

Una aplicación web completa para el control y gestión de finanzas personales, desarrollada con Next.js, TypeScript y Tailwind CSS.

## 🚀 Características Principales

### 💰 Gestión Financiera Completa
- **Gastos**: Registro y categorización de gastos con múltiples medios de pago
- **Ingresos**: Control de ingresos por diferentes fuentes
- **Tarjetas de Crédito**: Gestión de límites, saldos y fechas de vencimiento
- **Cuotas**: Seguimiento de pagos en cuotas con estado pendiente/pagado
- **Deudas**: Control de deudas por cobrar y por pagar
- **Categorías**: Sistema de categorización personalizable con emojis

### 📈 Resumen Financiero Inteligente
- **Dashboard principal** con métricas en tiempo real
- **Filtrado por mes/año** o vista anual completa
- **Balance automático** (ingresos - gastos)
- **Cuotas pendientes y pagadas** separadas
- **Estadísticas visuales** con colores diferenciados

### 🎯 Funcionalidades Avanzadas
- **Persistencia local**: Datos guardados en localStorage
- **Responsive design**: Optimizado para móviles y desktop
- **Interfaz intuitiva**: UI moderna con componentes reutilizables
- **Validaciones**: Prevención de errores y datos inconsistentes

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15.3.0**: Framework React con App Router
- **React 19.0.0**: Biblioteca de interfaz de usuario
- **TypeScript 5**: Tipado estático para mayor robustez
- **Tailwind CSS 4**: Framework CSS utility-first
- **Radix UI**: Componentes de interfaz accesibles
- **Lucide React**: Iconografía moderna

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **PostCSS**: Procesamiento de CSS
- **Turbopack**: Bundler rápido para desarrollo

### Gestión de Estado
- **React Context API**: Estado global para categorías y tarjetas
- **useState/useEffect**: Estado local y efectos secundarios
- **localStorage**: Persistencia de datos en el navegador

## 📁 Estructura del Proyecto

```
finly/
├── src/
│   ├── app/
│   │   ├── context/
│   │   │   ├── CategoriasContext.tsx    # Estado global de categorías
│   │   │   └── TarjetasContext.tsx      # Estado global de tarjetas
│   │   ├── types/
│   │   │   └── types.ts                 # Definiciones de tipos TypeScript
│   │   ├── categorias/
│   │   │   └── page.tsx                 # Gestión de categorías
│   │   ├── cuotas/
│   │   │   └── page.tsx                 # Gestión de cuotas
│   │   ├── deudas/
│   │   │   └── page.tsx                 # Gestión de deudas
│   │   ├── gastos/
│   │   │   └── page.tsx                 # Gestión de gastos
│   │   ├── ingresos/
│   │   │   └── page.tsx                 # Gestión de ingresos
│   │   ├── tarjetas/
│   │   │   └── page.tsx                 # Gestión de tarjetas
│   │   ├── layout.tsx                   # Layout principal
│   │   └── page.tsx                     # Dashboard principal
│   ├── components/
│   │   ├── ui/                          # Componentes UI reutilizables
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── emoji-picker.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── nav.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── tabs.tsx
│   │   └── nav.tsx                      # Navegación principal
│   └── lib/
│       └── utils.ts                     # Utilidades y funciones helper
├── public/                              # Archivos estáticos
├── package.json                         # Dependencias y scripts
├── tsconfig.json                        # Configuración TypeScript
├── tailwind.config.js                   # Configuración Tailwind
└── next.config.ts                       # Configuración Next.js
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/finly.git
cd finly
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo con Turbopack
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar ESLint
```

## 📊 Guía de Uso

### 🏠 Dashboard Principal

El dashboard muestra un resumen completo de tus finanzas:

#### Paneles de Información
- **Gastos**: Total de gastos del período seleccionado
- **Ingresos**: Total de ingresos del período seleccionado
- **Balance**: Diferencia entre ingresos y gastos (superávit/déficit)
- **Cuotas Pendientes**: Monto total de cuotas por pagar
- **Cuotas Pagadas**: Monto total de cuotas ya pagadas

#### Filtros de Período
- **Selector de Mes**: Enero a Diciembre o "Año completo"
- **Selector de Año**: Años disponibles (actual + 4 años futuros)

### 💳 Gestión de Tarjetas

#### Agregar Tarjeta
1. Ve a la sección "Tarjetas"
2. Haz clic en "Agregar Tarjeta"
3. Completa los datos:
   - **Nombre**: Nombre de la tarjeta
   - **Banco**: Entidad bancaria
   - **Límite**: Límite de crédito
   - **Día de Cierre**: Día del mes que cierra el resumen
   - **Día de Vencimiento**: Día del mes que vence el pago

#### Tarjetas Predefinidas
La aplicación incluye dos tarjetas de ejemplo:
- Visa Gold (Banco Nación) - $150,000
- Mastercard Platinum (Banco Ciudad) - $200,000

### 📝 Registro de Gastos

#### Agregar Gasto
1. Ve a la sección "Gastos"
2. Haz clic en "Agregar Gasto"
3. Completa los campos:
   - **Descripción**: Concepto del gasto
   - **Monto**: Cantidad gastada
   - **Categoría**: Selecciona una categoría existente
   - **Fecha**: Fecha del gasto
   - **Medio de Pago**: Efectivo, Débito, Crédito, Transferencia, Otro
   - **Tarjeta**: (Solo si es crédito/débito)
   - **Cuotas**: (Solo si es crédito)

#### Categorías Disponibles
- 🍽️ Alimentación
- 🚗 Transporte
- 🏠 Vivienda
- 💡 Servicios
- 🎮 Entretenimiento
- 💊 Salud
- 📚 Educación
- 👕 Ropa
- 📦 Otros

### 💰 Registro de Ingresos

#### Agregar Ingreso
1. Ve a la sección "Ingresos"
2. Completa los campos:
   - **Descripción**: Concepto del ingreso
   - **Monto**: Cantidad recibida
   - **Fuente**: Salario, Freelance, Inversiones, Alquiler, Otros

### 💳 Gestión de Cuotas

#### Ver Cuotas
1. Ve a la sección "Cuotas"
2. Usa las pestañas:
   - **Cuotas Pendientes**: Cuotas por pagar
   - **Cuotas Pagadas**: Cuotas ya pagadas

#### Marcar Cuota como Pagada
1. En la pestaña "Cuotas Pendientes"
2. Haz clic en "Marcar como Pagada"
3. La cuota se moverá automáticamente a "Cuotas Pagadas"

### 📋 Gestión de Deudas

#### Tipos de Deudas
- **Por Pagar**: Dinero que debes a otros
- **Por Cobrar**: Dinero que otros te deben

#### Agregar Deuda
1. Ve a la sección "Deudas"
2. Completa los datos:
   - **Descripción**: Concepto de la deuda
   - **Monto**: Cantidad de la deuda
   - **Tipo**: Por pagar o por cobrar
   - **Persona**: Con quién es la deuda
   - **Fecha**: Fecha de la deuda
   - **Fecha de Vencimiento**: (Opcional)
   - **Notas**: Información adicional

#### Registrar Pagos
- **Pago Total**: Paga toda la deuda pendiente
- **Pago Parcial**: Paga una cantidad específica

## 🔧 Desarrollo

### Arquitectura del Proyecto

#### Patrón de Diseño
- **Component-Based Architecture**: Componentes reutilizables
- **Context API**: Estado global compartido
- **Custom Hooks**: Lógica reutilizable
- **TypeScript**: Tipado estático para mayor robustez

#### Gestión de Estado
```typescript
// Context para categorías
const CategoriasContext = createContext<CategoriasContextType>()

// Context para tarjetas
const TarjetasContext = createContext<TarjetasContextType>()
```

#### Persistencia de Datos
- **localStorage**: Almacenamiento local del navegador
- **Sincronización automática**: Los cambios se guardan inmediatamente
- **Limpieza de datos**: Eliminación automática de duplicados

### Tipos de Datos

```typescript
interface Gasto {
  id: number
  descripcion: string
  monto: number
  categoriaId: number
  medioPago: MedioPago
  fecha: string
  cuotas?: number
  cuotasPagadas?: number
  tarjetaId?: number
  estado?: 'pendiente' | 'pagada'
}

interface Tarjeta {
  id: number
  nombre: string
  banco: string
  limite: number
  diaCierre: number
  diaVencimiento: number
  saldoUsado: number
  saldoDisponible: number
}
```

### Funciones Utilitarias

#### Formateo de Moneda
```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
```

#### Limpieza de Datos
```typescript
export function cleanDuplicateData<T extends { id: number }>(data: T[]): T[] {
  // Elimina duplicados y asigna IDs únicos
}
```

### Componentes Principales

#### Dashboard (page.tsx)
- **Estado local**: Gastos, tarjetas, ingresos, filtros
- **Cálculos**: Estadísticas en tiempo real
- **Filtros**: Por mes/año o año completo
- **Renderizado condicional**: Paneles dinámicos

#### Context Providers
- **CategoriasProvider**: Gestión de categorías predefinidas y personalizadas
- **TarjetasProvider**: Gestión de tarjetas con cálculo de saldos

### Optimizaciones Implementadas

#### Performance
- **useCallback**: Prevención de re-renders innecesarios
- **Memoización**: Cálculos optimizados
- **Lazy loading**: Carga diferida de componentes

#### UX/UI
- **Responsive design**: Adaptable a todos los dispositivos
- **Accesibilidad**: Componentes Radix UI
- **Feedback visual**: Estados de carga y errores
- **Validaciones**: Prevención de datos incorrectos

## 🐛 Solución de Problemas

### Errores Comunes

#### "Encountered two children with the same key"
- **Causa**: IDs duplicados en datos
- **Solución**: La función `cleanDuplicateData` elimina automáticamente duplicados

#### "Maximum update depth exceeded"
- **Causa**: Bucles infinitos en useEffect
- **Solución**: Uso de `useCallback` con dependencias correctas

#### Datos no se guardan
- **Causa**: localStorage no disponible
- **Solución**: Verificar que el navegador soporte localStorage

### Debugging

#### Herramientas de Desarrollo
- **React DevTools**: Inspección de componentes y estado
- **Browser DevTools**: Console para errores y localStorage
- **TypeScript**: Verificación de tipos en tiempo de compilación

#### Logs de Debug
```typescript
console.error("Error al cargar datos:", error)
console.error("Error al procesar fecha:", gasto.fecha, error)
```

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] **Exportación de datos**: PDF, Excel, CSV
- [ ] **Gráficos y estadísticas**: Visualizaciones avanzadas
- [ ] **Presupuestos**: Planificación mensual/anual
- [ ] **Metas financieras**: Objetivos de ahorro
- [ ] **Recordatorios**: Notificaciones de vencimientos
- [ ] **Sincronización en la nube**: Backup automático
- [ ] **Múltiples monedas**: Soporte para diferentes divisas
- [ ] **Análisis de tendencias**: Comparación entre períodos

### Mejoras Técnicas
- [ ] **PWA**: Aplicación web progresiva
- [ ] **Offline support**: Funcionamiento sin conexión
- [ ] **Testing**: Unit tests y integration tests
- [ ] **CI/CD**: Pipeline de despliegue automático
- [ ] **Performance**: Optimizaciones adicionales

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:

- **Issues**: Abre un issue en GitHub
- **Documentación**: Revisa este README
- **Código**: Explora el código fuente

## 🙏 Agradecimientos

- **Next.js Team**: Framework increíble
- **Tailwind CSS**: Sistema de diseño utility-first
- **Radix UI**: Componentes accesibles
- **Lucide**: Iconografía moderna
- **Comunidad React**: Inspiración y recursos

---

**Desarrollado con ❤️ para el control financiero personal**
