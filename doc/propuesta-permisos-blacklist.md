# Propuesta: Sistema de Permisos y Autorización — Modelo Blacklist

> **Estado: PROPUESTA (no implementada en este proyecto).**
> Documenta un modelo de permisos alternativo basado en **lista negra (blacklist)**,
> tomado como referencia de la implementación `ferreteria2` (frontend Next.js) +
> `ferreteria-backend` (Laravel). El eje central son los **Roles del Sistema**,
> prescindiendo de los cargos ocupacionales para el control de acceso.
>
> Contrasta con el modelo **actual** de este proyecto (whitelist multi-tenant,
> ver [`doc/iam.md`](iam.md)): aquí el usuario tiene **todo permitido por defecto**
> y solo se registran restricciones; en el modelo actual el usuario **no tiene nada**
> hasta que su rol recibe permisos explícitos.
>
> **Alcance:** este modelo aplica **solo al nivel empresa (tenant)** — roles,
> restricciones, organigrama, autorizaciones y configuración visual son por empresa
> y los administra el Company Admin. El **Owner de la plataforma queda fuera**:
> conserva acceso total (`isOwner`), no participa como aprobador y su función se
> mantiene igual que hoy (licenciar sistemas/módulos a cada empresa).

---

## 1. Filosofía: Blacklist / Lista Negra

El sistema opera bajo el principio de **"acceso total por defecto"**:

- Por defecto, todo usuario tiene acceso a todas las funcionalidades del sistema.
- Solo se registran **restricciones** (excepciones) para bloquear acceso a
  funcionalidades específicas.
- Esto contrasta con el modelo Whitelist (Spatie) anterior, que está siendo eliminado.

Esto se refleja directamente en el frontend:

```tsx
// ferreteria2/hooks/use-permission.tsx
function can(permiso: string) {
  if (!user) return false;
  if (!user.all_restrictions) return true; // <-- sin restricciones = acceso total
  return !user.all_restrictions.includes(permiso); // <-- solo bloqueado si está en la lista
}
```

---

## 2. Roles del Sistema (Eje Central)

### 2.1 Modelo `Role` (tabla `role`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER (PK) | Identificador |
| `name` | VARCHAR(255) | Identificador interno (ej: `admin_global`, `vendedor`, `almacenero`) |
| `descripcion` | VARCHAR(255) | Nombre legible |
| `rol_sistema` | ENUM | Clasificador fijo: `ADMINISTRADOR`, `VENDEDOR`, `ALMACENERO`, `CONTADOR`, `DESPACHADOR`, `CONDUCTOR` |
| `estado` | BOOLEAN | Activo/inactivo |

**Archivos (implementación de referencia):**

- Modelo: `ferreteria-backend/app/Models/Role.php`
- Migración: `database/migrations/2026_06_20_193309_add_rol_sistema_to_roles_table.php`

**Relaciones:**

```php
// App\Models\Role
public function users(): BelongsToMany        // vía pivote _roletouser
public function restrictions(): BelongsToMany // vía pivote _restrictiontorole
```

### 2.2 Asignación de Roles a Usuarios

Un usuario puede tener múltiples roles a través de la tabla pivote `_roletouser`:

```php
// App\Models\User
public function roles(): BelongsToMany
{
    return $this->belongsToMany(Role::class, "_roletouser", "B", "A");
}
```

Además, el usuario tiene el campo `rol_sistema` (string directo en la tabla `user`)
como indicador rápido.

### 2.3 Seeders de Roles

- `database/seeders/RolSistemaSeeder.php` — Asigna `rol_sistema` a los roles
  existentes (`admin_global` → `ADMINISTRADOR`, `vendedor` → `VENDEDOR`, etc.)

---

## 3. Sistema de Restricciones (Permisos)

### 3.1 Catálogo de Permisos

Todos los permisos están definidos como un enum de strings en el frontend:

**Archivo:** `ferreteria2/lib/permissions.ts`

Siguen el patrón: `{modulo}.{submodulo}.{accion}`

Ejemplos:

```
facturacion-electronica.crear-venta.index
producto.create
configuracion.roles.index
reportes.ventas.index
mis-entregas.boton-entregar
```

El enum `permissions` tiene ~120 entradas, y el mapping `permissionstoDescripcion`
las asocia a descripciones legibles para la UI de configuración.

### 3.2 Modelo `Restriction` (blacklist)

**Archivo:** `ferreteria-backend/app/Models/Restriction.php`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | BIGINT (PK) | Identificador |
| `name` | VARCHAR(255) UNIQUE | Nombre del permiso restringido (ej: `"venta.create"`) |
| `descripcion` | VARCHAR(255) | Descripción opcional |

**Tablas pivote:**

- `_restrictiontorole` — Restricciones asignadas a un rol (`a` = restriction_id, `b` = role_id)
- `_restrictiontouser` — Restricciones asignadas directamente a un usuario (`a` = restriction_id, `b` = user_id)

### 3.3 Cómo se Calculan las Restricciones de un Usuario

En el backend, durante el login y al refrescar usuario:

```php
// App\Models\User (línea 176)
public function getAllRestrictionsAttribute(): array
{
    $directRestrictions = $this->restrictions->pluck("name")->toArray();
    $roleRestrictions = $this->roles->flatMap->restrictions->pluck("name")->toArray();
    return array_unique(array_merge($directRestrictions, $roleRestrictions));
}
```

Unión de dos fuentes:

1. Restricciones **directas** del usuario (`_restrictiontouser`)
2. Restricciones **heredadas** de sus roles (`_restrictiontorole`)

El resultado se envía al frontend como `all_restrictions` en cada `LoginResponse`
y `GET /auth/user`.

### 3.4 Métodos de Verificación en `User.php`

```php
public function isRestricted(string $restriction): bool
public function hasAccess(string $feature): bool   // inverso de isRestricted
public function hasRole(string $roleName): bool
```

---

## 4. Frontend: Cómo se Consumen los Permisos

### 4.1 Auth Context y Cache

**Archivo:** `ferreteria2/lib/auth-context.tsx`

- El usuario autenticado se cachea en Zustand con persistencia (`store/store-auth.ts`)
- Se refresca automáticamente al montar el provider y vía WebSocket cuando cambian autorizaciones
- El payload incluye: `all_restrictions`, `auth_required`, `auth_granted`, `rol_sistema`, `role_name`

### 4.2 Hooks de Permisos

**Archivo:** `ferreteria2/hooks/use-permission.tsx`

Hook simple:

```tsx
const hasAccess = usePermission('producto.create')
// true = tiene acceso, false = bloqueado
```

Hook completo:

```tsx
const { can, isAdmin, isRestricted, hasAnyPermission, hasAllPermissions } = usePermissionHook()
```

**Regla de negocio:** `can(permiso)` retorna `true` si el permiso **NO** está en
`all_restrictions`. Retorna `false` si el permiso **SÍ** está en `all_restrictions`.

### 4.3 Uso en Componentes

```tsx
import { usePermission } from '~/hooks/use-permission'
import { permissions } from '~/lib/permissions'

function BotonCrearProducto() {
  const puedeCrear = usePermission(permissions.PRODUCTO_CREATE)
  if (!puedeCrear) return null
  return <button>Crear Producto</button>
}
```

### 4.4 Route Permission Map

**Archivo:** `ferreteria2/lib/navigation/route-permission-map.ts`

Mapea rutas de navegación a `componentId` (nombres de permiso), usado por el
sistema de autorización de vistas.

```ts
// Ejemplo de la estructura de navegación
{ route: '/facturacion/ventas', permission: 'facturacion-electronica.mis-ventas.index' }
```

---

## 5. Sistema de Autorización (Segunda Capa)

Es una capa **adicional** sobre las restricciones. Aunque un usuario no tenga
restricción para acceder a una vista, puede requerir **autorización explícita de
un superior**.

### 5.1 Arquitectura

Tablas involucradas:

- `autorizaciones_config` — Define qué roles requieren autorización para qué módulo+acción
- `solicitudes_autorizacion` — Solicitudes pendientes/aprobadas/rechazadas
- `autorizaciones_otorgadas` — Autorizaciones concedidas vigentes

### 5.2 Service Layer

**Archivo:** `ferreteria-backend/app/Services/AutorizacionService.php`

| Método | Propósito |
|---|---|
| `verificar(string $userId, string $modulo, string $accion): array` | Verifica si el usuario tiene un rol que requiere autorización para ese módulo+acción, y si ya tiene una autorización otorgada vigente |
| `crearSolicitud(...): SolicitudAutorizacion` | Crea una solicitud de autorización; resuelve el destino (quién aprueba) según el modo configurado (§5.3) |
| `aprobar(...)`, `rechazar(...)` | Procesan la solicitud |
| `autorizarConClaveSupervisor(...)` | Override en sitio: un supervisor presente ingresa su `supervisor_password` para autorizar al solicitante sin pasar por el flujo de solicitud |
| `consumirUnaVez(...)` | Consume autorizaciones de tipo `una_vez` después de usarlas (las desactiva) |

En la **aprobación**:

1. Crea/actualiza `AutorizacionOtorgada`
2. Dispara evento `ModelChanged('autorizaciones', 'aprobada', ...)`
3. El frontend recibe el evento vía WebSocket → llama `refreshUser()` →
   `auth_granted` se actualiza → el candado desaparece

### 5.3 Resolución de Destino (¿Quién Aprueba?)

El campo `tipo_autorizador` en `AutorizacionConfig` define cómo se resuelve quién
recibe la solicitud:

| Modo | Descripción | Campo usado |
|---|---|---|
| `usuario` | Usuario fijo específico | `autorizador_id` |
| `cargo` | Cualquier usuario que ocupe un cargo específico | `cargo_autorizador` |
| `jerarquia` | Sube por el organigrama desde el cargo del solicitante hasta encontrar un cargo ancestro con `role_id` vinculado y usuarios activos con ese rol | `role_autorizador_id` (resuelto dinámicamente) |

Flujo completo de `jerarquia` (el más complejo):

```
Solicitante tiene cargo "Vendedor" (parent = "JefeVentas")
  → Busca cargo "JefeVentas" → ¿tiene role_id? NO → sube
  → Busca cargo "GerenteComercial" → ¿tiene role_id? SÍ (role_id=3)
  → ¿Hay usuarios activos con role_id=3? SÍ → asigna role_autorizador_id=3
  → Notifica a todos los usuarios con ese rol (vía FCM)
```

### 5.4 Flujo Vista + Autorización (Frontend)

1. Usuario navega a una ruta
2. `useAccesoVista()` (en `ferreteria2/hooks/use-acceso-vista.ts`):
   - Obtiene el `componentId` de la ruta actual vía `permissionForPath(pathname)`
   - Verifica si está en `user.auth_required`
   - Verifica si está en `user.auth_granted`
3. Si `bloqueada = required && !granted`:
   - `AccesoGuard` (`ferreteria2/app/ui/_components/acceso-guard.tsx`) muestra
     pantalla de bloqueo con botón "Solicitar acceso"
4. Usuario solicita acceso → Backend `crearSolicitud()` → Aprobador recibe notificación FCM
5. Aprobador aprueba → `AutorizacionOtorgada` creada → Evento WebSocket →
   Frontend refresca usuario → `AccesoGuard` desaparece → Contenido visible

---

## 6. Payload del Usuario (LoginResponse)

```ts
interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    empresa: Empresa | null;
    all_restrictions: string[];        // ← PERMISOS (blacklist)
    auth_required?: string[];          // ← Vistas que REQUIEREN autorización
    auth_granted?: string[];           // ← Vistas YA AUTORIZADAS
    rol_sistema: string | null;        // ← Rol sistema (ADMINISTRADOR, VENDEDOR, etc.)
    role_name: string | null;          // ← Nombre del primer rol asignado
    cargo: string | null;              // ← Descripción del cargo ocupacional
    cargo_id?: number | null;          // ← ID en catalogo_cargos
    es_root_cargo?: boolean;           // ← Si es cargo raíz del organigrama
    vehiculo_id?: number | null;
    vehiculo?: { id, name, tipo, placa } | null;
  };
  token: string;
}
```

---

## 7. Resumen Arquitectónico

```
┌─────────────────────────────────────────────────────────┐
│                   SISTEMA DE PERMISOS                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Roles del Sistema (tabla role)                       │
│     ├── Tienen restricciones (tabla restriction)         │
│     └── Se asignan a usuarios (_roletouser)              │
│                                                          │
│  2. Usuarios                                             │
│     ├── Heredan restricciones de sus roles               │
│     └── Pueden tener restricciones directas              │
│                                                          │
│  3. Cálculo: all_restrictions = roles ∪ directas         │
│                                                          │
│  4. Frontend: can(X) = X ∉ all_restrictions              │
│                                                          │
└─────────────────────────────────────────────────────────┘
                            +
┌─────────────────────────────────────────────────────────┐
│               SISTEMA DE AUTORIZACIÓN                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Config: qué roles requieren autorización             │
│     para qué módulo+acción                               │
│                                                          │
│  2. Modos de aprobación:                                 │
│     ├── usuario (fijo)                                   │
│     ├── cargo (cualquiera con ese cargo)                 │
│     └── jerarquía (sube organigrama por rol vinculado)   │
│                                                          │
│  3. Flujo: Solicitud → Notificación → Aprobación         │
│     → WebSocket → Refresh → Desbloqueo                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 8. API Endpoints Relacionados

| Método | Endpoint | Propósito |
|---|---|---|
| POST | `/auth/login` | Login, devuelve `all_restrictions`, `auth_required`, `auth_granted` |
| GET | `/auth/user` | Refrescar usuario actual |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/permissions/roles` | Listar roles del sistema |
| POST | `/permissions/roles` | Crear rol |
| GET | `/permissions/restrictions` | Listar restricciones |
| POST | `/permissions/restrictions` | Crear restricción |
| POST | `/permissions/restrictions/{id}/assign` | Asignar restricción a rol/usuario |
| POST | `/permissions/users/{userId}/check` | Verificar restricción de usuario |
| GET | `/autorizaciones/config` | Listar configuraciones de autorización |
| POST | `/autorizaciones/solicitar` | Crear solicitud de autorización |
| POST | `/autorizaciones/aprobar/{id}` | Aprobar solicitud |
| POST | `/autorizaciones/rechazar/{id}` | Rechazar solicitud |
| POST | `/autorizaciones/clave-supervisor` | Autorizar con clave de supervisor |
| GET | `/catalogos/roles-sistema` | Listar roles del sistema (catálogo) |
| GET | `/catalogos/cargos` | Listar cargos ocupacionales |

---

## 9. Configuración Recomendada (Solo Roles del Sistema)

Para usar **solo roles del sistema** (sin cargos ocupacionales) como mecanismo de
permisos:

1. Asignar roles a usuarios vía la interfaz de **Usuarios → pestaña Roles**
2. Configurar restricciones por rol en **Permisos → restricciones por rol**
3. Si se requiere autorización de vistas, configurar en **Autorizaciones** con
   modo `usuario` (fijo) para evitar dependencia del organigrama
4. El campo `rol_sistema` en la tabla `user` sirve como identificador rápido para
   lógica condicional en el backend si es necesario

> El sistema de autorización con modo `jerarquia` depende exclusivamente del campo
> `role_id` en `catalogo_cargos`, por lo que si no se usa el organigrama,
> simplemente se configura la autorización en modo `usuario` (autorizador fijo)
> o `cargo`.

---

## 10. Renderizado de Vistas en Modo Configuración (Permisos Visuales)

### 10.1 Arquitectura del Modo Configuración

El sistema tiene **dos modos de renderizado** para cada vista:

| Modo | Propósito | Comportamiento |
|---|---|---|
| **Runtime** (normal) | Usuario final | Elementos restringidos se ocultan (`null`) o se bloquean con overlay |
| **Config Mode** | Admin configurando permisos | Elementos se muestran con borde coloreado y overlay clickeable |

### 10.2 ConfigModeProvider y ConfigModeContext

**Archivo:** `ferreteria2/app/ui/configuracion/permisos-visuales/_components/config-mode-context.tsx`

```tsx
const ConfigModeContext = createContext<{
  enabled: boolean;
  componentStates: Map<string, 'visible' | 'auth_required' | 'hidden'>;
} | null>(null);
```

Se activa desde la página de configuración de permisos visuales
(`permisos-visuales/page.tsx`). Cuando el admin hace clic en **"Config. Vista"**
en un módulo, se envuelve toda la vista en este provider.

### 10.3 ConfigurableElement — El Wrapper Universal

**Archivo:** `ferreteria2/app/ui/configuracion/permisos-visuales/_components/configurable-element.tsx`

Es el componente que envuelve cada elemento configurable (botones, filtros, tabs,
cards, tablas, etc.):

```tsx
function ConfigurableElement({ componentId, label, children }) {
  const configMode = useContext(ConfigModeContext);
  const hasAccess = usePermission(componentId);

  // MODO CONFIGURACIÓN: overlay para admin
  if (configMode?.enabled) {
    const state = configMode.componentStates.get(componentId) || 'visible';
    const borderColor = state === 'hidden' ? 'red' : state === 'auth_required' ? 'orange' : 'green';
    return (
      <div className={`border-2 border-${borderColor}-500 relative`}>
        <div className="absolute ... bg-${borderColor}-500 text-white text-xs px-1">
          {label} ({state === 'hidden' ? 'Oculto' : state === 'auth_required' ? 'Requiere Auth' : 'Visible'})
        </div>
        {children}
        <div className="absolute inset-0 cursor-pointer" onClick={() => abrirModal(componentId)} />
      </div>
    );
  }

  // MODO RUNTIME:
  if (!hasAccess) return null; // oculto por blacklist
  return (
    <ComponenteAccesoGuard componentId={componentId}>
      {children}
    </ComponenteAccesoGuard>
  );
}
```

**Comportamiento en cada modo:**

| Estado del elemento | Runtime (usuario) | Config Mode (admin) |
|---|---|---|
| `visible` | Se renderiza normalmente | Borde verde + etiqueta "Visible" |
| `auth_required` | Overlay blur + candado + botón "Solicitar acceso" | Borde naranja + etiqueta "Requiere Auth" |
| `hidden` (restringido) | `return null` (no existe en el DOM) | Borde rojo + etiqueta "Oculto" + contenido visible para preview |

### 10.4 Cómo se Decide el Estado de Cada Elemento

El `componentStates` del `ConfigModeContext` se construye en la página de
configuración usando:

```tsx
// permisos-visuales/page.tsx (simplificado)
const restrictions = useQuery(...) // restricciones actuales del rol
const authConfigs = useQuery(...)  // configs de autorización del rol

const componentStates = new Map();
for (const [id, metadata] of uiPermissionsMetadata.entries()) {
  if (restrictions.includes(id)) {
    componentStates.set(id, 'hidden');
  } else if (authConfigs.some(c => c.modulo === id && c.requiere_autorizacion)) {
    componentStates.set(id, 'auth_required');
  } else {
    componentStates.set(id, 'visible');
  }
}
```

### 10.5 DecisionModal — Interfaz para Cambiar Estado

**Archivo:** `ferreteria2/app/ui/configuracion/permisos-visuales/_components/decision-modal.tsx`

Cuando el admin hace clic en un elemento en modo configuración, se abre este modal
con 3 opciones:

```
┌─────────────────────────────────────┐
│  Configurar: Botón Buscar           │
│                                     │
│  ○ Visible                          │ ← quita restricción, quita auth required
│  ○ Requiere autorización            │ ← activa auth config (con selector de aprobador)
│  ○ Oculto                           │ ← añade restricción al rol
│                                     │
│  [Guardar]  [Cancelar]              │
└─────────────────────────────────────┘
```

La mutación se hace con **optimistic updates** (actualización inmediata en caché
React Query + sincronización en background):

```tsx
const mutation = useMutation({
  mutationFn: async ({ componentId, newState }) => {
    if (newState === 'hidden') {
      await permissionsApi.toggleRestriction(rolId, componentId, true);
    } else {
      await permissionsApi.toggleRestriction(rolId, componentId, false);
      if (newState === 'auth_required') {
        await autorizacionesApi.saveConfig({ role_id, modulo: componentId, ... });
      }
    }
  },
  onMutate: async ({ componentId, newState }) => {
    // Actualización optimista: cambiar estado INMEDIATAMENTE en la UI
    queryClient.setQueryData(['component-states'], old => ({
      ...old, [componentId]: newState
    }));
  },
});
```

### 10.6 ComponenteAccesoGuard — Overlay en Runtime

**Archivo:** `ferreteria2/app/ui/_components/componente-acceso-guard.tsx`

Cuando un elemento está en estado `auth_required` y el usuario no tiene
`auth_granted`:

```tsx
return (
  <div className="relative w-full">
    {/* Contenido borroso de fondo */}
    <div className="opacity-30 blur-[2px] pointer-events-none select-none">
      {children}
    </div>
    {/* Overlay con candado */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-white/90 p-4 rounded-lg shadow-lg text-center">
        <FaLock className="text-orange-500 text-2xl mx-auto mb-2" />
        <p className="text-sm font-medium">Requiere autorización</p>
        <Button onClick={solicitar}>Solicitar autorización</Button>
        <Button onClick={() => setOverrideOpen(true)}>Clave de supervisor</Button>
      </div>
    </div>
  </div>
);
```

### 10.7 Preview de Vistas en Configuración

**Archivo:** `ferreteria2/app/ui/configuracion/permisos-visuales/_constants/component-map.ts`

Mapea `componentId` a componentes lazy-loaded para mostrar una **preview en vivo**
de la vista dentro de la página de configuración:

```tsx
const componentMap = {
  'facturacion-electronica.mis-ventas.index': lazy(() => import('~/app/ui/facturacion-electronica/mis-ventas/page')),
  'facturacion-electronica.mis-entregas.index': lazy(() => import('~/app/ui/facturacion-electronica/mis-entregas/page')),
  // ...
};
```

Esto permite al admin ver exactamente cómo se verá la vista con los cambios
aplicados, sin salir de la página de configuración.

### 10.8 Flujo Completo: Admin Configura una Vista

```
Admin en Configuración → Permisos Visuales
  │
  ├─ 1. Selecciona un rol (ej: "VENDEDOR")
  │
  ├─ 2. Selecciona un módulo (ej: "Facturación Electrónica")
  │
  ├─ 3. Ve las cards de navegación con su estado actual
  │     └── Estado determinado por restricciones + auth config en BD
  │
  ├─ 4. Hace clic en "Config. Vista" de una card
  │     └── Activa ConfigModeProvider con ese moduloId
  │     └── Renderiza la preview de la vista envuelta en ConfigMode
  │
  ├─ 5. Cada ConfigurableElement se muestra con borde + etiqueta
  │     └── Verde:   Visible (sin restricción)
  │     └── Naranja: Requiere autorización
  │     └── Rojo:    Oculto (restringido)
  │
  ├─ 6. Admin hace clic en un elemento → abre DecisionModal
  │     └── Cambia estado → mutación optimista → UI se actualiza al instante
  │
  └─ 7. Cierra preview → los cambios ya están persistidos en BD
```

### 10.9 Resumen: Archivos Clave de Renderizado

| Archivo | Rol |
|---|---|
| `permisos-visuales/config-mode-context.tsx` | Provider que activa modo configuración |
| `permisos-visuales/configurable-element.tsx` | Wrapper que decide render runtime vs config |
| `componente-acceso-guard.tsx` | Overlay blur para elementos no autorizados |
| `acceso-guard.tsx` | Bloqueo de página completa por ruta |
| `permisos-visuales/decision-modal.tsx` | Modal de 3 opciones para el admin |
| `permisos-visuales/modulo-card.tsx` | Card de módulo en lista de configuración |
| `permisos-visuales/_constants/component-map.ts` | Metadatos + mapa de lazy components para preview |
| `ui-permissions-metadata.ts` | Metadatos de cada elemento configurable |
| `navigation/route-permission-map.ts` | Mapeo ruta URL → componentId |
| `hooks/use-acceso-vista.ts` | Hook que determina si la vista actual está bloqueada |
| `hooks/use-permission.tsx` | Hook `can()` para blacklist |

---

## 11. Comparación con el Modelo Actual del Proyecto

| Aspecto | Actual (whitelist, `doc/iam.md`) | Propuesta (blacklist) |
|---|---|---|
| Default | Sin acceso; el rol debe recibir permisos explícitos (`iam.role_permissions`) | Acceso total; solo se registran restricciones |
| Payload al frontend | `permissions: string[]` (lo permitido) | `all_restrictions: string[]` (lo bloqueado) |
| Check frontend | `can(X) = X ∈ permissions` (con comodines `*`) | `can(X) = X ∉ all_restrictions` |
| Multi-tenant | Sí: licenciamiento por empresa (sistemas/módulos) limita lo asignable | No contempla licenciamiento; roles por instancia |
| Capa extra | — | Autorización de superior (solicitud → aprobación → desbloqueo vía WebSocket) |
| Config visual | — | Modo configuración in-place sobre la vista real (§10) |
| Riesgo principal | Olvidar asignar permisos → usuario no ve módulos (ej.: rol sin `erp.compras.read`) | Olvidar restringir → usuario ve de más (falla abierta) |

> **Nota de seguridad:** en un SaaS multi-tenant como este proyecto, el modelo
> blacklist **falla abierto**: cualquier permiso nuevo queda accesible para todos
> hasta que se restrinja explícitamente, y no se integra de forma natural con el
> licenciamiento por empresa. Si se adopta esta propuesta, conviene mantener el
> licenciamiento (sistema/módulo por empresa) como whitelist de primer nivel y
> aplicar la blacklist solo **dentro** de lo licenciado.
