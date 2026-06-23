---
name: frontend-react
description: Convenciones para trabajar en el frontend (carpeta Muli-Company/). Úsala al crear o editar páginas, componentes, features, servicios de API, queries, stores o formularios en React 19 + TypeScript + Vite. Cubre arquitectura por features (auth/erp/pos/wms/rrhh), capa de servicios, TanStack Query vs Zustand, smart/dumb components y formularios con RHF+Zod.
---

# Frontend React — IntegraCloud

Stack: **React 19 + TypeScript**, Vite, Tailwind CSS, ShadCN/ui, TanStack Router (lazy), TanStack Query, Zustand, React Hook Form + Zod, React Compiler, Vitest + Testing Library, ESLint + Prettier.

Referencia completa: `Muli-Company/docs/FRONTEND_ARCHITECTURE.md`.

## Regla de oro: separar UI / lógica / datos

Nunca `fetch` ni `useEffect` de datos dentro de un componente. La página solo renderiza.

```tsx
// ❌ EVITAR
useEffect(() => { fetch("/api/products").then(...).then(setProducts) }, [])

// ✅ CORRECTO
const { data } = useProducts()
```

## Capa de servicios (toda llamada a API pasa por aquí)

```
lib/api/client.ts          # instancia fetch/axios
lib/api/interceptors.ts    # auth headers, errores globales
features/<modulo>/services/<x>.service.ts   # llamadas API
features/<modulo>/queries/use<X>.ts         # hooks TanStack Query
features/<modulo>/types/<x>.ts              # interfaces
```

El componente nunca toca `client.ts`: usa el hook de query, que usa el service. Cambiar axios↔fetch solo toca `lib/api/client.ts`.

## Estado: Zustand vs TanStack Query

| Herramienta | Para |
|---|---|
| **TanStack Query** | Datos del servidor: productos, clientes, órdenes, facturas |
| **Zustand** | Estado UI compartido: auth, theme, sidebar |

**Nunca** guardes respuestas de API en Zustand (`productsStore` ✗). Stores globales en `src/stores/` solo para estado entre módulos; estado de un feature en `features/<modulo>/stores/`.

## Arquitectura por features (Domain Driven)

```
features/<modulo>/   # auth | erp | pos | wms | rrhh
├── routes.tsx
├── pages/        # default export, lazy-loaded
├── components/   # compuestos del módulo
├── services/     # *.service.ts
├── queries/      # use*.ts
├── stores/       # *Store.ts (Zustand, estado local del módulo)
└── types/        # interfaces
```

**Barrera obligatoria:** ningún módulo importa de otro (ERP ✗→ POS). La comunicación cruzada solo vía stores globales (`src/stores/`), navegación (TanStack Router) o API compartida (`lib/api/`).

## Smart vs Dumb components

- **Dumb** (`features/*/components/`): solo renderizan props, sin lógica de negocio ni API.
- **Smart** (`features/*/pages/`): obtienen datos con hooks de query, manejan estado, los pasan a los dumb.
- `components/ui/` (ShadCN) es **intocable**: la lógica de negocio va en componentes compuestos del feature, nunca dentro de `ui/button.tsx`.

## Formularios: React Hook Form + Zod (obligatorio)

```tsx
const schema = z.object({ name: z.string().min(1, "requerido"), price: z.number().positive() })
type FormData = z.infer<typeof schema>
const form = useForm<FormData>({ resolver: zodResolver(schema) })
```

Usa `<Form>` / `<FormField>` de `components/ui/form`.

## Calidad de código

- **Tipado estricto**: nada de `any` ni `x as User` ni `.map` sin tipos. Define `interface` y genéricos (`ApiResponse<T>`).
- **Constantes centralizadas** en `lib/constants/` (`ROLES`, `API_ENDPOINTS`), no strings hardcodeados.
- **Tamaño**: <200 líneas normal, 200-300 revisar, >500 dividir obligatorio.
- **Estilos**: tokens de Tailwind (`p-4`, `text-sm`, `text-muted-foreground`), no valores arbitrarios (`p-[17px]`). Responsive con breakpoints `sm/md/lg/xl`.
- **Rendimiento**: medir antes de optimizar. No `memo`/`useMemo`/`useCallback` en todos lados — React 19 + React Compiler memoiza solo.
- **Evita prop drilling**: usa Zustand (`useAuthStore`) en vez de pasar `user`/`theme` por 5 niveles.
- **Rutas**: TanStack Router con `lazy(() => import(...))` por módulo.

## Convenciones de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `ProductTable.tsx` |
| Hooks / Queries | camelCase + `use` | `useProducts.ts` |
| Stores | camelCase + `Store` | `authStore.ts` |
| Servicios | kebab-case + `.service` | `products.service.ts` |
| Tipos/Interfaces | PascalCase | `UserProfile` |
| Directorios | kebab-case | `dropdown-menu/` |

Exports: `export default` solo en páginas; named exports para todo lo demás. Imports ordenados: externas → UI → módulo actual → hooks/stores → utilidades.

## Scripts

`npm run dev` · `npm run build` (tsc + build) · `npm run lint` · `npm run test` · `npm run preview` (en `Muli-Company/`).
