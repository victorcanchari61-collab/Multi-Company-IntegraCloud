# Migración de frontend: React → Angular

## Estado

El frontend de la empresa se está migrando de **React** a **Angular**.

- **`fronten-MultiCompany/`** — nuevo frontend en **Angular** (v21, Angular CLI). Es el proyecto activo hacia adelante para la empresa.
- **`Muli-Company/`** — frontend anterior en **React + Vite**. Deja de evolucionar como aplicación y se conserva únicamente como **referencia de diseño** (estilos, componentes, layout) para guiar la implementación en Angular.

## Qué implica esto

- El desarrollo nuevo de funcionalidad para la empresa se hace en `fronten-MultiCompany/` (Angular).
- `Muli-Company/` no recibe nuevas features; se consulta solo para replicar diseño/UX (ver `Muli-Company/docs/FRONTEND_ARCHITECTURE.md` como referencia de la arquitectura previa).
- Al portar una pantalla o componente de React a Angular, el criterio es respetar el diseño visual de React pero implementar la lógica siguiendo las convenciones de Angular del proyecto nuevo.

## Arquitectura del frontend Angular

Estructura por dominio (Domain Driven Frontend), espejo de `Backend-Application/{IAM,ERP}`:

```
src/app/
  core/            # arranque único: interceptors, guards, state global, layout shell
  shared/          # componentes UI reutilizables (Tailwind puro) + forms + utils
  features/
    iam/           # auth, users, roles, companies, permissions, notifications, organigrama
    dashboard/
    erp/           # (pendiente)
```

| Capa | React (`Muli-Company`, referencia) | Angular (`fronten-MultiCompany`) |
|---|---|---|
| Server state | TanStack Query | `resource()` / `httpResource()` nativo (signals) |
| Estado UI global | Zustand | `signal()` en `core/state/` |
| Formularios | React Hook Form + Zod | Reactive Forms + Zod (`shared/forms/zod-validator.ts`) |
| Componentes base | ShadCN/ui | Tailwind puro, a mano en `shared/ui/` (aún no creado) |
| Routing | TanStack Router (lazy) | Angular Router (`loadComponent`/`loadChildren`) |

Decisión tomada por ser Angular un framework opinado con reactividad propia (signals): no se usa TanStack Query ni una librería de componentes de terceros, para no duplicar mecanismos que Angular ya resuelve nativamente.

## Estado del scaffold — IAM

El IAM real (visto en `Muli-Company/src/features/{auth,iam}`) es un módulo grande: auth, users, roles, companies (multi-tenant por slug), permissions, restrictions, notifications, organigrama y un editor visual de permisos ("config mode"). Se está construyendo por partes, empezando por la base (auth), que es la que desbloquea todo lo demás.

**Hecho (base = auth):**
- `core/state/auth.state.ts` — sesión global con signals, persistida en `localStorage` (equivalente a `stores/authStore.ts`).
- `core/interceptors/auth.interceptor.ts` — inyecta `Authorization: Bearer`, refresh de token en un solo vuelo ante 401, normaliza errores a `ApiError` (equivalente a `lib/api.ts`).
- `core/guards/auth.guard.ts` y `guest.guard.ts` — protegen rutas privadas / evitan ver `/login` ya autenticado.
- `features/iam/auth/` — `auth.service.ts`, `branding.service.ts` (login multi-tenant por subdominio/slug), `tenant.ts`, `login-page` funcional contra `POST /auth/login` + `GET /auth/me` + `GET /auth/me/permissions`. Montada directo en `app.routes.ts` como `/login` (sin wrapper `iam.routes.ts`: con una sola ruta era abstracción prematura; se crea cuando haya users/roles/companies que agrupar bajo `/iam/*`).
- `core/layout/shell/` — shell mínimo con logout, protegido por `authGuard`.
- `features/dashboard/` — página placeholder para verificar el flujo de login end-to-end.

**Pendiente (siguientes pasadas):**
- `features/iam/users`, `roles`, `permissions`, `companies` (CRUD + asignación de roles/permisos + restrictions).
- `features/iam/notifications`, `organigrama`.
- Menú dinámico (`GET /menu`) para el sidebar real (hoy el shell no tiene sidebar).
- `shared/ui/` — componentes base Tailwind (Button, Input, Dialog, Table) para dejar de repetir clases sueltas en cada página.

## Configuración relevante

- Alias de imports `@/*` → `src/*` (mismo criterio mental que `@/` en React), configurado en `tsconfig.json`.
- `src/environments/environment.ts` (prod) / `environment.development.ts` (dev, `http://localhost:5033/api`) con `fileReplacements` en `angular.json`.
- CORS: se agregó `http://localhost:4200` a `AllowedOrigins` en `Backend/Backend-API/appsettings.json` para que el backend acepte al dev server de Angular.
