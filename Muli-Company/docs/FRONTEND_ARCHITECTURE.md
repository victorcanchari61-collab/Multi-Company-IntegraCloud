# Frontend Architecture - IntegraCloud

## Stack Tecnológico

| Tecnología | Propósito |
|---|---|
| React 19 + TypeScript ~6.0 | UI Framework con tipado estático |
| Vite 8 | Build tool / Dev server |
| Tailwind CSS | Sistema de utilidades de estilos |
| ShadCN/ui | Componentes base reutilizables |
| TanStack Router | Enrutamiento type-safe con lazy loading |
| TanStack Query | Estado del servidor (API) |
| Zustand | Estado local global (UI, tema, sidebar) |
| React Hook Form + Zod | Formularios con validación |
| React Compiler | Memoización automática |
| Vitest + Testing Library | Tests unitarios y de componentes |
| ESLint + Prettier | Calidad de código |

---

## Regla de Oro: Separar UI, Lógica y Datos

Nunca mezcles todo en un componente.

```tsx
// ❌ EVITAR
function ProductsPage() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(setProducts)
  }, [])
  return (...)
}
```

```tsx
// ✅ CORRECTO
const { data } = useProducts()
// La página solo renderiza, no obtiene datos
```

---

## Capa de Servicios (API)

**Nunca llamar APIs desde componentes.** Toda comunicación con el backend pasa por una capa de servicios.

### Estructura

```
lib/
└── api/
    ├── client.ts          # Instancia de fetch/axios
    └── interceptors.ts    # Auth headers, errores globales

features/products/
├── services/
│   └── products.service.ts
├── queries/
│   └── useProducts.ts
├── types/
│   └── product.ts
```

### Ejemplo

```ts
// types/product.ts
export interface Product {
  id: string
  name: string
  price: number
  stock: number
}

// services/products.service.ts
import { api } from "@/lib/api/client"

export const getProducts = (): Promise<Product[]> =>
  api.get("/products")

export const getProductById = (id: string): Promise<Product> =>
  api.get(`/products/${id}`)

export const createProduct = (data: Omit<Product, "id">): Promise<Product> =>
  api.post("/products", data)

// queries/useProducts.ts
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "../services/products.service"

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  })
```

**Beneficio:** Cambiar Axios por Fetch (o viceversa) solo toca `lib/api/client.ts`. El resto del código no se entera.

---

## Estado Global: Zustand vs TanStack Query

| Herramienta | Para |
|---|---|
| **Zustand** | Estado local compartido: auth, theme, sidebar, UI state |
| **TanStack Query** | Datos del servidor: productos, clientes, órdenes, facturas |

```ts
// ❌ EVITAR - Guardar respuestas de API en Zustand
productsStore.ts  // ✗
customersStore.ts // ✗
ordersStore.ts    // ✗
```

```ts
// ✅ CORRECTO
authStore.ts   // Sesión del usuario
themeStore.ts  // Modo oscuro/claro
sidebarStore.ts // Estado de la sidebar
```

Zustand stores globales solo para estado compartido entre módulos. Estado específico de un feature va dentro de `features/<modulo>/stores/`.

---

## Estructura del Proyecto

```
Muli-Company/
├── public/
│   └── icons.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── assets/
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── components/
│   │   ├── ui/              # ShadCN (intocables)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── PageContainer.tsx
│   │       └── AppShell.tsx
│   │
│   ├── features/            # Domain Driven Frontend
│   │   ├── auth/
│   │   ├── erp/
│   │   ├── pos/
│   │   ├── wms/
│   │   └── rrhh/
│   │
│   ├── hooks/
│   │   ├── useMediaQuery.ts
│   │   └── useDebounce.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── interceptors.ts
│   │   ├── constants/
│   │   │   └── index.ts
│   │   └── utils.ts
│   │
│   ├── types/
│   │
│   └── router.tsx
│
├── components.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## Features (Domain Driven Frontend)

Cada módulo de negocio es independiente y contiene todo lo que necesita:

```
features/<modulo>/
├── routes.tsx             # Rutas del módulo
├── pages/                 # Páginas (default export, lazy-loaded)
│   └── ProductsPage.tsx
├── components/            # Componentes compuestos del módulo
│   ├── ProductTable.tsx
│   └── ProductForm.tsx
├── services/              # Llamadas API del módulo
│   └── products.service.ts
├── queries/               # Hooks TanStack Query del módulo
│   └── useProducts.ts
├── stores/                # Estado local del módulo (Zustand)
│   └── productFiltersStore.ts
└── types/                 # Interfaces del módulo
    └── product.ts
```

### Barreras entre módulos

**Regla obligatoria:** ningún módulo importa directamente de otro.

```
ERP ──✗──→ POS
WMS ──✗──→ RRHH
POS ──✗──→ WMS
```

La comunicación cruzada solo a través de:
- Stores globales (`src/stores/`)
- Navegación (TanStack Router)
- API compartida (`lib/api/`)

---

## Smart vs Dumb Components

### Dumb Components (Presentacionales)

Solo renderizan lo que reciben por props. No tienen lógica de negocio ni llamadas API.

```tsx
// features/products/components/ProductTable.tsx
interface Props {
  data: Product[]
  loading: boolean
  onEdit: (id: string) => void
}

export function ProductTable({ data, loading, onEdit }: Props) {
  if (loading) return <Skeleton />
  return <Table>...</Table>
}
```

### Smart Components (Contenedores)

Obtienen datos, manejan estado y se los pasan a dumb components.

```tsx
// features/products/pages/ProductsPage.tsx
export default function ProductsPage() {
  const { data, isLoading } = useProducts()
  const navigate = useNavigate()

  return (
    <ProductTable
      data={data ?? []}
      loading={isLoading}
      onEdit={(id) => navigate({ to: `/products/$id`, params: { id } })}
    />
  )
}
```

---

## Componentes Base Intocables

Los componentes en `components/ui/` (ShadCN) **deben modificarse muy poco**. Si necesitas lógica de negocio, créala en `features/*/components/`, nunca en `components/ui/button.tsx`.

```tsx
// ✅ CORRECTO - Componente compuesto en el feature
// features/products/components/ProductForm.tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ProductForm() {
  return (
    <form>
      <Input name="name" />
      <Button type="submit">Guardar</Button>
    </form>
  )
}
```

---

## Tamaño de Componentes

| Líneas | Acción |
|---|---|
| < 200 | Normal |
| 200-300 | Revisar si se puede dividir |
| > 500 | **Obligatorio dividir** |

---

## Formularios: React Hook Form + Zod

Stack obligatorio para formularios:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField } from "@/components/ui/form"

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().positive("El precio debe ser positivo"),
})

type ProductFormData = z.infer<typeof productSchema>

export function ProductForm() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" render={...} />
        <FormField name="price" render={...} />
      </form>
    </Form>
  )
}
```

---

## Tipado Estricto

```tsx
// ❌ EVITAR
any
unknown as User
data?.items?.map(...)  // sin tipos

// ✅ CORRECTO
interface Product {
  id: string
  name: string
  price: number
}

interface ApiResponse<T> {
  data: T
  meta: { total: number; page: number }
}
```

---

## Constantes Centralizadas

```ts
// lib/constants/index.ts
export const ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  WAREHOUSE: "warehouse",
} as const

export const API_ENDPOINTS = {
  PRODUCTS: "/products",
  CUSTOMERS: "/customers",
  INVOICES: "/invoices",
} as const

// ❌ EVITAR
if (user.role === "admin")           // repetido 100 veces
fetch("/products")                    // string hardcodeado
```

---

## Sistema de Estilos

### Tailwind + ShadCN

- **Utilidades atómicas** para estilos directos
- **Design tokens consistentes:** usa los valores predefinidos de Tailwind

```tsx
// ✅ Usar tokens del sistema
<p className="text-sm text-muted-foreground p-4" />

// ❌ EVITAR valores arbitrarios repetidos
<p className="text-[13px] text-[#666] p-[17px]" />
```

### Design System (documentado)

| Token | Valores permitidos |
|---|---|
| Spacing | `p-2 p-4 p-6 p-8` (no `p-[13px]`) |
| Font size | `text-sm text-base text-lg text-xl` |
| Color | `text-primary text-muted-foreground` |
| Radius | `rounded-md rounded-lg rounded-xl` |

### Responsive Design

Breakpoints de Tailwind:

| Breakpoint | Prefijo | Ancho |
|---|---|---|
| Mobile | `sm:` | 640px |
| Tablet | `md:` | 768px |
| Desktop | `lg:` | 1024px |
| Wide | `xl:` | 1280px |

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Sidebar className="hidden md:block w-64" />
  <main className="flex-1 p-4 sm:p-6 lg:p-8">
    contenido
  </main>
</div>
```

---

## Enrutamiento (TanStack Router) + Lazy Loading

```tsx
// router.tsx
const router = createRouter({
  routeTree: rootRoute({
    component: AppShell,
    children: [authRoute, erpRoute, posRoute, wmsRoute, rrhhRoute],
  }),
})

// features/erp/routes.tsx
export const erpRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "erp",
  component: () => <Outlet />,
  children: [
    new Route({ path: "/", component: lazy(() => import("./pages/Dashboard")) }),
    new Route({ path: "/products", component: lazy(() => import("./pages/Products")) }),
  ],
})
```

TanStack Router soporta lazy loading nativo. Cada módulo se carga bajo demanda.

---

## Evitar Prop Drilling

Si tienes una cadena de componentes como `App → Layout → Sidebar → Menu → Item`, no pases `user`, `setUser`, `permissions`, `theme` por props. Usa Zustand:

```tsx
// ✅
const user = useAuthStore((s) => s.user)

// ❌
<Sidebar user={user} permissions={permissions} theme={theme} ... />
```

---

## Convenciones

### Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos React | PascalCase | `Button.tsx`, `ProductTable.tsx` |
| Hooks | camelCase + `use` | `useMediaQuery.ts` |
| Stores | camelCase + `Store` | `authStore.ts` |
| Tipos/Interfaces | PascalCase | `UserProfile` |
| Servicios | kebab-case + `.service` | `products.service.ts` |
| Queries | camelCase + `use` | `useProducts.ts` |
| Directorios | kebab-case | `dropdown-menu/` |

### Exportaciones

```tsx
export default function ProductsPage() { ... }   // solo páginas
export function Button() { ... }                  // named exports para lo demás
```

### Organización de imports

```tsx
// 1. Externas
import { useForm } from "react-hook-form"

// 2. UI
import { Button } from "@/components/ui/button"

// 3. Módulo actual
import { ProductTable } from "../components/ProductTable"

// 4. Hooks y stores
import { useProducts } from "../queries/useProducts"

// 5. Utilidades
import { cn } from "@/lib/utils"
```

---

## Regla de Rendimiento

Antes de optimizar, **medir**. No uses `memo`, `useMemo` o `useCallback` en todos lados. React 19 + React Compiler maneja muchas optimizaciones automáticamente.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | TypeScript check + build producción |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run test` | Vitest + Testing Library |
| `npm run preview` | Preview del build de producción |
