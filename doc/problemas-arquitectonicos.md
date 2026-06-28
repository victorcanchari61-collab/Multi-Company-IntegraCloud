# Problemas Arquitectónicos: Mezcla Dueño ↔ Empresa

> **✅ TODOS CORREGIDOS.** La arquitectura ahora separa físicamente Dueño y Empresa
> en handlers, endpoints, rutas y páginas. Cada nivel tiene su propio flujo sin
> depender de `if (isOwner)` en la lógica de negocio.

---

## ✅ Problema #1: Handlers con `if (isOwner)` → Corregido

**Antes:** `GetMenuQueryHandler` y `GetMyPermissionsQueryHandler` tenían dos flujos
mezclados con `if (request.IsOwner)`.

**Después:**

| Handler | Responsabilidad |
|---------|----------------|
| `GetOwnerMenuQueryHandler` | Retorna menú fijo: solo IAM > Empresas |
| `GetCompanyMenuQueryHandler` | Retorna menú según módulos licenciados a la empresa |
| `GetOwnerPermissionsQueryHandler` | Retorna todos los permisos del catálogo |
| `GetCompanyPermissionsQueryHandler` | Retorna permisos de los roles del usuario ∩ módulos licenciados |

El **Controller** decide qué handler invocar según `tenantContext.IsOwner`.

---

## ✅ Problema #2: `?companyId=` en URL → Corregido

**Antes:** `useActiveCompanyId()` parseaba `window.location.search` manualmente.
`navigate()` usaba `as any` para pasar search params.

**Después:**
- Las rutas users, roles, roleDetail, permissions tienen `validateSearch` que tipa
  `companyId` como search param opcional
- `useActiveCompanyId()` usa `useSearch({ strict: false })` de TanStack Router
- Todos los `navigate()` están tipados, sin `as any`
- Las navegaciones `onRowClick` y `backToRoles` leen `companyId` del hook compartido

**Archivos modificados:** `router.tsx`, `useActiveCompanyId.ts`, `CompanyDetailPage.tsx`,
`RolesPage.tsx`, `RoleDetailPage.tsx`

---

## ✅ Problema #3: Permission keys → Corregido

**Antes:** El seed no generaba `iam.companies.view`. Además omitía `create/update/delete`
para companies module. El frontend esperaba claves que no existían.

**Después:**
- Seed genera `view` como acción (se agregó a la lista de actions)
- Seed genera todas las acciones para companies (se eliminó el skip)
- Formato definido: `{sistema}.{modulo}.{accion}`
- Tipo `PermissionKey` en TypeScript (`PERMISSIONS` constant) como fuente única de verdad
- `Can` component acepta `PermissionKey` como tipo

**Archivos modificados:** `IamSeedService.cs`, `iam.ts`, `Can.tsx`

---

## ✅ Problema #4: Permisos sin intersección con licencias → Corregido

**Antes:** `GetMyPermissionsQueryHandler` ya intersectaba con `company_module_access`.
Estaba correcto desde el inicio.

**Estado:** `permisosEfectivos = (permisos de roles) ∩ (módulos licenciados)`.
Si el dueño revoca un módulo, los permisos dejan de ser efectivos automáticamente.

---

## ✅ Problema #5: Owner sin verificación explícita → Corregido

**Antes:** Los controllers `UsersController` y `RolesController` inyectaban
`TenantContext` sin usarlo. No había verificación de acceso a la compañía.

**Después:** Nuevo atributo `[RequireCompanyAccess]` que:
- Si es owner: permite acceso global
- Si es company user: verifica que `company_id` del JWT coincida con `companyId` de la ruta

**Aplicado a:** `UsersController`, `RolesController`

**Archivos:** `RequireCompanyAccessAttribute.cs`

---

## ✅ Problema #6: Columnas `resource_type`/`resource_id` en permissions → Corregido

**Antes:** Columnas siempre escritas como `0`/`null`, nunca leídas.

**Después:**
- Removidas de la entidad `Permission`
- Removidas de `PermissionConfiguration`
- Seed actualizado con el constructor simplificado
- Migración `DropPermissionResourceColumns` generada:
  1. Dropea índice `IX_permissions_resource_type_resource_id_action_code`
  2. Dropea columnas `resource_type`, `resource_id`
  3. Crea índice `IX_permissions_module_id_action_code` (unique)

**Archivos:** `Permission.cs`, `PermissionConfiguration.cs`, `IamSeedService.cs`,
migración nueva

---

## ✅ Problema #7: Refresh tokens sin cleanup → Corregido

**Antes:** No había índice en `expires_at` ni lógica de limpieza.

**Después:**
- Índice en `expires_at` agregado en `RefreshTokenConfiguration`
- SeedService limpia automáticamente tokens expirados o revocados > 30 días al iniciar

**Archivos:** `RefreshTokenConfiguration.cs`, `IamSeedService.cs`

---

## ✅ Problema #8: Sidebar con sistemas vacíos → Corregido

**Antes:** Un sistema sin módulos licenciados aparecía como sección vacía en el menú.

**Después:** `GetCompanyMenuQueryHandler` filtra las secciones sin módulos:
```csharp
if (modules.Count == 0) return null;
```
Las secciones `null` se filtran con `.Where(s => s is not null)`.

---

## ⏳ Problema #9: Tests multi-tenant → Pendiente (deuda técnica)

No hay tests de integración automatizados. Requiere configurar el proyecto de tests
con dos empresas + dueño. No es un bug, es cobertura faltante.

**Sugerencia:** Agregar cuando se configure el proyecto de tests.

---

## ✅ Problema #10: Endpoints mezclados → Corregido

**Antes:** Los endpoints ya usaban `api/companies/{companyId}/users` (bien), pero
el `UsersController` y `RolesController` tenían `TenantContext` inyectado sin usar.

**Después:**
- UsersController: `[Route("api/companies/{companyId:guid}/[controller]")]` + `[RequireCompanyAccess]`
- RolesController: `[Route("api/companies/{companyId:guid}/[controller]")]` + `[RequireCompanyAccess]`
- CompaniesController: endopints de owner (sin acceso por companyId)
- Menú y permisos: controllers deciden qué handler ejecutar según el rol

---

## Resumen final

| # | Problema | Estado |
|---|----------|--------|
| 1 | Handlers con `if(isOwner)` | ✅ Separados en queries propias |
| 2 | `?companyId=` en URL | ✅ `useSearch` + `validateSearch` |
| 3 | Permission keys inconsistentes | ✅ Seed + TypeScript type |
| 4 | Permisos sin intersección | ✅ Ya estaba correcto |
| 5 | Owner sin verificación | ✅ `[RequireCompanyAccess]` |
| 6 | Columnas muertas | ✅ Removidas + migración |
| 7 | Refresh tokens sin TTL | ✅ Índice + cleanup |
| 8 | Sidebar con sistemas vacíos | ✅ Filtro en handler |
| 9 | Tests multi-tenant | ⏳ Deuda técnica |
| 10 | Endpoints mezclados | ✅ Controllers limpios |
