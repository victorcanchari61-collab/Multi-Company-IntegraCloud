# Sistema IAM (Identity & Access Management)

> Spec de diseño del primer sistema. Sigue la Clean Architecture descrita en
> [`doc/arquitectura.md`](../../../doc/arquitectura.md) y los patrones de
> [`doc/patrones-diseno.md`](../../../doc/patrones-diseno.md).

El IAM es la base sobre la que se apoyan todos los demás sistemas (ERP, POS, WMS,
RRHH). Resuelve **quién es** cada usuario (autenticación) y **qué puede hacer**
(autorización), en un modelo **multi-tenant de dos niveles**.

---

## 1. Los dos niveles

```
┌─────────────────────────────────────────────────────────────┐
│  NIVEL PLATAFORMA  —  Dueño del sistema (Owner / SuperAdmin)  │
│                                                               │
│  • Crea y administra EMPRESAS (tenants)                       │
│  • Crea el usuario administrador inicial de cada empresa      │
│  • LICENCIA qué sistemas y módulos puede usar cada empresa    │
│  • Mantiene el catálogo: Sistemas → Módulos → Vistas →        │
│    Componentes → Acciones                                     │
└─────────────────────────────────────────────────────────────┘
                              │ otorga acceso (licencia)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  NIVEL EMPRESA  —  Company Admin (administrador del tenant)   │
│                                                               │
│  • Crea los USUARIOS de su empresa                            │
│  • Crea ROLES propios de la empresa                           │
│  • Asigna PERMISOS a los roles (solo de lo licenciado)        │
│  • Asigna roles a los usuarios                                │
└─────────────────────────────────────────────────────────────┘
                              │ permisos efectivos
                              ▼
                    Usuario final de la empresa
              (ve y opera según los permisos de sus roles)
```

**Regla central:** una empresa **solo** puede otorgar a sus roles permisos sobre
sistemas/módulos que el Owner le haya **licenciado**. El nivel empresa nunca
puede auto-asignarse acceso a un sistema no contratado.

---

## 2. Actores y capacidades

| Actor | Alcance (scope) | Puede hacer |
|---|---|---|
| **Owner** (Platform SuperAdmin) | Global, sin empresa | CRUD de empresas; suspender/activar; crear el admin inicial de una empresa; otorgar/revocar acceso a sistemas y módulos por empresa; administrar el catálogo (Sistema/Módulo/Vista/Componente/Acción) |
| **Company Admin** | Su empresa | CRUD de usuarios de su empresa; CRUD de roles; asignar permisos a roles (limitado a módulos licenciados); asignar roles a usuarios |
| **Company User** | Su empresa | Acceder y operar según los permisos efectivos de sus roles |

> El **Owner** es un usuario especial **sin `CompanyId`** (pertenece a la
> plataforma, no a un tenant). El **Company Admin** es simplemente un usuario de
> la empresa que tiene un rol con permisos de administración del IAM.

---

## 3. Jerarquía de permisos

El permiso más granular se expresa como un **camino** por el árbol de recursos
de la plataforma, más una **acción**:

```
Sistema → Módulo → Vista → Componente → Acción
  ERP   →  Products → ProductList → ExportButton → Export
```

La clave del permiso (`PermissionKey`) es la ruta en minúsculas separada por
puntos:

```
{sistema}.{modulo}.{vista}.{componente}.{accion}

erp.products.list.export        ← acción sobre un componente concreto
erp.products.create             ← acción a nivel de módulo
iam.users.update
```

Se admiten **comodines** para otorgar de forma más gruesa:

```
erp.*               → todo el sistema ERP
erp.products.*      → todo el módulo Products
*.*.*.*.read        (opcional) lectura transversal
```

| Nivel | Sirve para | Ejemplo |
|---|---|---|
| **Sistema** | Mostrar/ocultar un sistema completo en el menú | `erp`, `pos`, `wms` |
| **Módulo** | Sección dentro del sistema | `erp.products`, `erp.orders` |
| **Vista** | Pantalla / ruta concreta | `erp.products.list`, `erp.products.detail` |
| **Componente** | Pieza de UI dentro de la vista | `...list.export-button`, `...detail.price-panel` |
| **Acción** | Operación permitida | `read`, `create`, `update`, `delete`, `approve`, `export` |

Esto permite controlar la UI con el mismo modelo: ocultar un sistema, una vista,
un botón, o deshabilitar una acción concreta.

---

## 4. Modelo de datos (tablas)

> **Regla de oro del modelo:** cada concepto es **una tabla independiente**.
> Las relaciones muchos-a-muchos viven en su **propia tabla de unión** (nunca
> columnas con listas ni JSON de IDs). Si esto no se respeta desde el inicio, el
> filtrado multi-tenant, las migraciones de EF Core y la integridad referencial
> se vuelven un problema imposible de mantener.
>
> Convenciones: PK `id` tipo `uuid` (Guid v7). Timestamps `timestamptz`. Strings
> acotados. Borrado lógico vía `status` (ver D-6). Snake_case en BD; las
> entidades C# usan PascalCase y EF Core mapea por configuración.

### Esquema general (3 bloques)

```
CATÁLOGO (plataforma)            TENANT (empresa)           IDENTIDAD / RBAC
─────────────────────            ────────────────           ────────────────
systems                          companies                  users
  └─ modules                       └─ company_module_access  roles
       └─ views                         (companies *─* modules) role_permissions (roles *─* permissions)
            └─ components                                      user_roles      (users *─* roles)
permissions  (recurso + acción)                               refresh_tokens
actions      (catálogo de verbos)
```

---

### 4.1. Bloque CATÁLOGO (lo define el Owner; semi-estático)

#### Tabla `systems`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `code` | varchar(20) | **UNIQUE**, NOT NULL (`IAM`, `ERP`, `POS`, `WMS`, `RRHH`) |
| `name` | varchar(100) | NOT NULL |
| `description` | varchar(255) | NULL |
| `is_active` | boolean | NOT NULL, default `true` |
| `created_at` | timestamptz | NOT NULL |

#### Tabla `modules`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `system_id` | uuid | **FK → systems(id)**, NOT NULL, ON DELETE RESTRICT |
| `code` | varchar(40) | NOT NULL (`products`, `orders`…) |
| `name` | varchar(100) | NOT NULL |
| `is_active` | boolean | NOT NULL, default `true` |
| `created_at` | timestamptz | NOT NULL |
| | | **UNIQUE(system_id, code)** · index en `system_id` |

#### Tabla `views`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `module_id` | uuid | **FK → modules(id)**, NOT NULL, ON DELETE RESTRICT |
| `code` | varchar(60) | NOT NULL (`list`, `detail`…) |
| `name` | varchar(100) | NOT NULL |
| `route` | varchar(150) | NULL (ruta del frontend) |
| | | **UNIQUE(module_id, code)** · index en `module_id` |

#### Tabla `components`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `view_id` | uuid | **FK → views(id)**, NOT NULL, ON DELETE RESTRICT |
| `code` | varchar(60) | NOT NULL (`export-button`, `price-panel`…) |
| `name` | varchar(100) | NOT NULL |
| | | **UNIQUE(view_id, code)** · index en `view_id` |

#### Tabla `actions` (catálogo de verbos)
| Columna | Tipo | Restricción |
|---|---|---|
| `code` | varchar(30) | **PK** (`read`, `create`, `update`, `delete`, `approve`, `export`) |
| `name` | varchar(60) | NOT NULL |

#### Tabla `permissions` (unidad atómica otorgable)
Cada fila = **un recurso + una acción**, con su `key` única. Es lo que se asigna
a los roles.

| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `key` | varchar(160) | **UNIQUE**, NOT NULL (`erp.products.list.export`) |
| `resource_type` | smallint | NOT NULL (1=System, 2=Module, 3=View, 4=Component) |
| `resource_id` | uuid | NOT NULL (apunta a systems/modules/views/components según `resource_type`) |
| `module_id` | uuid | **FK → modules(id)**, NOT NULL — módulo al que pertenece el permiso |
| `action_code` | varchar(30) | **FK → actions(code)**, NOT NULL |
| `description` | varchar(255) | NULL |
| | | **UNIQUE(resource_type, resource_id, action_code)** · index en `module_id` |

> ⚠️ **`resource_id` es polimórfico** (no puede ser una sola FK porque apunta a 4
> tablas según `resource_type`). Por eso se desnormaliza **`module_id`**: así la
> regla "el permiso pertenece a un módulo licenciado" se valida con un simple
> JOIN, sin resolver el polimorfismo. La integridad del par
> `(resource_type, resource_id)` la garantiza la capa de aplicación al sembrar el
> catálogo, no una FK.

---

### 4.2. Bloque TENANT (lo gestiona el Owner)

#### Tabla `companies` (empresa / tenant)
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `name` | varchar(150) | NOT NULL |
| `legal_name` | varchar(200) | NULL |
| `tax_id` | varchar(20) | **UNIQUE**, NULL (RUC/NIT) |
| `status` | smallint | NOT NULL (1=Active, 2=Suspended) |
| `created_at` | timestamptz | NOT NULL |
| `created_by` | uuid | NULL (usuario Owner que la creó) |

#### Tabla `company_module_access` (licenciamiento — unión companies *─* modules)
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `company_id` | uuid | **FK → companies(id)**, NOT NULL, ON DELETE CASCADE |
| `module_id` | uuid | **FK → modules(id)**, NOT NULL, ON DELETE RESTRICT |
| `granted_at` | timestamptz | NOT NULL |
| `granted_by` | uuid | **FK → users(id)**, NULL (Owner que otorgó) |
| | | **UNIQUE(company_id, module_id)** · index en ambas FKs |

> El acceso a un **sistema** se **deriva**: la empresa "tiene" ERP si posee ≥1
> fila de `company_module_access` cuyo módulo pertenece a ERP. No hay tabla
> `company_system_access` separada (evita datos redundantes — D-5).

---

### 4.3. Bloque IDENTIDAD / RBAC (lo gestiona el Company Admin)

#### Tabla `users`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `company_id` | uuid | **FK → companies(id)**, **NULL = Owner de plataforma**, ON DELETE RESTRICT |
| `email` | varchar(150) | NOT NULL |
| `password_hash` | varchar(255) | NOT NULL |
| `full_name` | varchar(150) | NOT NULL |
| `status` | smallint | NOT NULL (1=Active, 2=Suspended) |
| `is_owner` | boolean | NOT NULL, default `false` |
| `created_at` | timestamptz | NOT NULL |
| | | **UNIQUE(company_id, email)** — email único por empresa (D-3) · index en `company_id` |

#### Tabla `roles`
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `company_id` | uuid | **FK → companies(id)**, NOT NULL, ON DELETE CASCADE |
| `name` | varchar(80) | NOT NULL |
| `description` | varchar(255) | NULL |
| `is_system_template` | boolean | NOT NULL, default `false` |
| `created_at` | timestamptz | NOT NULL |
| | | **UNIQUE(company_id, name)** · index en `company_id` |

#### Tabla `role_permissions` (unión roles *─* permissions)
| Columna | Tipo | Restricción |
|---|---|---|
| `role_id` | uuid | **FK → roles(id)**, NOT NULL, ON DELETE CASCADE |
| `permission_id` | uuid | **FK → permissions(id)**, NOT NULL, ON DELETE CASCADE |
| | | **PK compuesta (role_id, permission_id)** · index en `permission_id` (lookup inverso) |

#### Tabla `user_roles` (unión users *─* roles)
| Columna | Tipo | Restricción |
|---|---|---|
| `user_id` | uuid | **FK → users(id)**, NOT NULL, ON DELETE CASCADE |
| `role_id` | uuid | **FK → roles(id)**, NOT NULL, ON DELETE CASCADE |
| | | **PK compuesta (user_id, role_id)** · index en `role_id` |

#### Tabla `refresh_tokens` (sesión / JWT refresh)
| Columna | Tipo | Restricción |
|---|---|---|
| `id` | uuid | **PK** |
| `user_id` | uuid | **FK → users(id)**, NOT NULL, ON DELETE CASCADE |
| `token_hash` | varchar(255) | NOT NULL (se guarda el hash, nunca el token en claro) |
| `expires_at` | timestamptz | NOT NULL |
| `revoked_at` | timestamptz | NULL |
| `created_at` | timestamptz | NOT NULL |
| | | index en `user_id` |

---

### 4.4. Diagrama de relaciones (ER)

```
systems 1──* modules 1──* views 1──* components
                 │  │
                 │  └────────────* permissions  (module_id FK; resource_id polimórfico)
                 │                      │ action_code FK ─► actions
                 │
companies *──────┘ (company_module_access: companies *─* modules)  ← licenciamiento
   │
   ├─1──* users ───*──┐
   │                  │ (user_roles)
   └─1──* roles ──*───┘
            │
            *── (role_permissions) ──* permissions
                   └─ restringido: permission.module_id ∈ módulos licenciados de la empresa del rol

users 1──* refresh_tokens
```

### 4.5. Invariantes (se validan en Domain/Application, no solo en BD)

1. Un `users` con `company_id = NULL` **debe** tener `is_owner = true`; cualquier
   otro usuario **debe** tener `company_id`.
2. `roles` siempre pertenece a una `companies` (sin roles huérfanos).
3. Al insertar en `role_permissions`: el `permissions.module_id` debe existir en
   `company_module_access` de la empresa del rol. Si no, **se rechaza** (regla de
   negocio, no FK — requiere JOIN entre tablas).
4. Al insertar en `user_roles`: `users.company_id` = `roles.company_id` (mismo
   tenant). Asignar un rol de otra empresa es un error de dominio.
5. Revocar una fila de `company_module_access` debe eliminar/invalidar las filas
   de `role_permissions` cuyos permisos dependían de ese módulo (cascada de
   negocio + invalidar caché Redis de permisos).
6. `users.email` único **por empresa** (`UNIQUE(company_id, email)`); el mismo
   correo puede repetirse en empresas distintas (D-3).

---

## 5. Permisos efectivos

Los **permisos efectivos** de un usuario son la **unión** de los `Permission`
de todos sus `Role`, intersectados con los módulos que la empresa tiene
licenciados.

```
permisosEfectivos(user) =
    ⋃  role.Permissions   (para cada role de user)
    ∩  modulosLicenciados(user.Company)
```

Este conjunto es lo que consume el **frontend** para pintar menús, vistas,
componentes y habilitar/deshabilitar acciones, y lo que el **backend** valida en
cada endpoint.

---

## 6. Casos de uso (CQRS)

Organizados por actor. Commands = escritura, Queries = lectura
(ver patrón en [`doc/patrones-diseno.md`](../../../doc/patrones-diseno.md)).

### 6.1. Owner — plataforma

```
Commands
  CreateCompanyCommand(name, legalName, taxId)              → Result<Guid>
  SuspendCompanyCommand(companyId)                          → Result
  ActivateCompanyCommand(companyId)                         → Result
  ProvisionCompanyAdminCommand(companyId, email, fullName)  → Result<Guid>
  GrantCompanyModuleAccessCommand(companyId, moduleIds[])   → Result
  RevokeCompanyModuleAccessCommand(companyId, moduleIds[])  → Result
  -- Catálogo --
  RegisterSystemCommand / RegisterModuleCommand /
  RegisterViewCommand / RegisterComponentCommand            → Result<Guid>

Queries
  GetCompaniesQuery(page, size, status?)        → PagedResult<CompanyDto>
  GetCompanyByIdQuery(companyId)                → CompanyDto
  GetSystemCatalogQuery()                       → SystemTreeDto (árbol completo)
  GetCompanyModuleAccessQuery(companyId)        → ModuleAccessDto[]
```

### 6.2. Company Admin — empresa

```
Commands
  CreateUserCommand(email, fullName, password)           → Result<Guid>
  DeactivateUserCommand(userId)                          → Result
  CreateRoleCommand(name, description)                   → Result<Guid>
  UpdateRoleCommand(roleId, name, description)           → Result
  AssignPermissionsToRoleCommand(roleId, permissionIds[])→ Result   (valida licencia)
  AssignRolesToUserCommand(userId, roleIds[])            → Result

Queries
  GetUsersByCompanyQuery(page, size, search?)   → PagedResult<UserDto>
  GetRolesByCompanyQuery()                       → RoleDto[]
  GetAssignablePermissionsQuery()                → PermissionTreeDto
                                                   (solo módulos licenciados)
  GetUserRolesQuery(userId)                       → RoleDto[]
```

### 6.3. Autenticación (todos)

```
Commands
  LoginCommand(email, password)         → Result<AuthTokensDto>  (access + refresh)
  RefreshTokenCommand(refreshToken)     → Result<AuthTokensDto>
  LogoutCommand(refreshToken)           → Result

Queries
  GetMeQuery()                          → UserProfileDto
  GetMyPermissionsQuery()               → string[]  (permisos efectivos, claves)
```

---

## 7. Autorización en runtime

### 7.1. JWT — claims mínimos

El token se mantiene **liviano**. No se incrustan todos los permisos.

```json
{
  "sub": "user-guid",
  "company_id": "company-guid",   // ausente para el Owner
  "roles": ["admin", "seller"],
  "is_owner": false
}
```

Los **permisos efectivos** se obtienen con `GET /iam/me/permissions` y se
**cachean en Redis** (clave por usuario, invalidada al cambiar roles/permisos o
licencias).

### 7.2. Enforcement por endpoint

Controller delgado + chequeo declarativo de permiso:

```csharp
[RequirePermission("erp.products.create")]
[HttpPost]
public async Task<IActionResult> Create(CreateProductCommand cmd, CancellationToken ct)
{
    var result = await _mediator.Send(cmd, ct);
    return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
}
```

### 7.3. Aislamiento multi-tenant

Un **behavior de MediatR** (pipeline) o middleware inyecta el `company_id` del
token en un `ITenantContext`. Todos los repositorios filtran por `CompanyId`
automáticamente (salvo el Owner, que opera cross-tenant de forma explícita). Así
ningún usuario puede leer/escribir datos de otra empresa aunque manipule IDs.

### 7.4. Flujo de una petición autorizada

```
Cliente (JWT) ─► [API] middleware: valida JWT, arma TenantContext
              ─► [API] filtro RequirePermission: ¿permiso ∈ permisos efectivos (Redis)?
              ─► [Application] Handler (CQRS) + FluentValidation
              ─► [Domain] reglas / invariantes
              ─► [Infrastructure] Repository (filtrado por CompanyId)
              ─► Result<T> ─► DTO ─► 200 / 4xx
```

---

## 8. Implicancias en el Frontend

El frontend (ver [`Muli-Company/docs/FRONTEND_ARCHITECTURE.md`](../../../Muli-Company/docs/FRONTEND_ARCHITECTURE.md))
consume `GET /iam/me/permissions` al iniciar sesión y guarda las claves en un
store de Zustand (`authStore` / `permissionsStore`). Con eso controla la UI con
el mismo árbol `sistema → módulo → vista → componente → acción`:

| Mecanismo | Uso |
|---|---|
| **Route guards** (TanStack Router) | Bloquear acceso a sistemas/vistas sin permiso |
| Menú dinámico | Mostrar solo sistemas/módulos permitidos |
| `usePermissions()` hook | Consultar permisos efectivos desde cualquier componente |
| `<Can permission="erp.products.export">…</Can>` | Mostrar/ocultar componentes |
| `disabled={!can("...")}` | Deshabilitar acciones (botones) |

> El frontend **oculta** por UX, pero la verdad de la autorización está en el
> backend: cada endpoint vuelve a validar el permiso. La UI nunca es la única
> barrera.

El IAM vive en `features/auth/` (login, sesión, permisos) y, para la
administración (usuarios/roles/empresas), en su propio feature de gestión
(p. ej. `features/iam/`).

---

## 9. Mapeo a Clean Architecture

```
Backend-Domain/IAM/
├── Entities/        Company, User, Role, System, Module, View, Component,
│                    Permission, Action, CompanyModuleAccess, RefreshToken
│                    (join role_permissions / user_roles vía colecciones del agregado)
├── ValueObjects/    Email, PasswordHash, PermissionKey
├── Repositories/    ICompanyRepository, IUserRepository, IRoleRepository,
│                    IPermissionRepository, ICompanyModuleAccessRepository  (interfaces)
├── Services/        IPasswordHasher, ITokenService                         (interfaces)
└── Events/          CompanyCreatedEvent, UserProvisionedEvent, RolePermissionsChangedEvent

Backend-Application/IAM/
├── Commands/        (sección 6) + Handlers
├── Queries/         (sección 6) + Handlers
├── DTOs/            CompanyDto, UserDto, RoleDto, PermissionTreeDto, AuthTokensDto
├── Validators/      FluentValidation por command
├── Mappings/        AutoMapper profiles
├── Services/
│   ├── Interfaces/      IAuthService, IPermissionService
│   └── Implementations/ AuthService, PermissionService (orquestación)
└── EventHandlers/   InvalidatePermissionCacheHandler, SendWelcomeEmailHandler

Backend-Infrastructure/IAM/
├── Repositories/    UserRepository, CompanyRepository, ... (EF Core + Npgsql)
├── Services/        JwtTokenService, BcryptPasswordHasher, RedisPermissionCache
└── Configurations/  IamDbContext + EntityTypeConfigurations

Backend-API/Controllers/IAM/
├── AuthController.cs        (login, refresh, me, me/permissions)
├── CompaniesController.cs   (Owner)
├── UsersController.cs       (Company Admin)
├── RolesController.cs       (Company Admin)
└── CatalogController.cs     (Owner: systems/modules/views/components)
```

---

## 10. Decisiones de diseño (a confirmar)

| # | Decisión | Default propuesto |
|---|---|---|
| D-1 | ¿Una empresa puede tener varios admins? | **Sí** — "admin" es solo un rol; pueden existir múltiples usuarios con él |
| D-2 | ¿Roles plantilla del sistema? | Catálogo de **plantillas** clonables por la empresa (`IsSystemTemplate`), opcional en v2 |
| D-3 | Unicidad de email | **Único por empresa** (`UNIQUE(CompanyId, Email)`); el Owner es global |
| D-4 | Permisos en el JWT | **No** se incrustan; se sirven aparte y se cachean en Redis |
| D-5 | Acceso a sistema | **Derivado** de tener ≥1 módulo licenciado de ese sistema |
| D-6 | Borrado | **Soft-suspend** (Status), no borrado físico, para auditoría |
| D-7 | Multi-tenancy en BD | Tenant compartido con columna `CompanyId` + filtro global (no BD por empresa) |

---

## 11. Orden de implementación sugerido

1. **SharedKernel**: `Entity`, `AggregateRoot`, `ValueObject`, `Result<T>`, `Error`, `Guard`, `IRepository`, `DomainEvent`.
2. **Domain/IAM**: entidades + value objects + interfaces de repos/servicios + invariantes.
3. **Infrastructure/IAM**: `IamDbContext`, configuraciones EF Core, repositorios, `JwtTokenService`, `PasswordHasher`.
4. **Application/IAM**: autenticación (Login/Refresh/Me/Permissions) primero.
5. **API/IAM**: `AuthController` + middleware JWT + `RequirePermission` + `TenantContext`.
6. **Owner**: empresas + licenciamiento de módulos + catálogo.
7. **Company Admin**: usuarios + roles + asignación de permisos.
8. **Frontend**: `authStore`, `usePermissions`, `<Can>`, route guards, y features `auth` + `iam`.
