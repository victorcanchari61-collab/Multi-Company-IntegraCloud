# Bases de Datos - IntegraCloud

## Stack

| Base de Datos | Propósito | Driver/NuGet |
|---|---|---|
| PostgreSQL | Datos transaccionales del negocio (Entidades, relaciones, ACID) | `Npgsql.EntityFrameworkCore.PostgreSQL` + EF Core |
| MongoDB | Logs, auditoría, eventos, datos no estructurados | `MongoDB.Driver` |
| Redis | Caché en memoria, sesiones, permisos, rate limiting | `StackExchange.Redis` |

---

## Conexión Base

```json
{
  "ConnectionStrings": {
    "PostgreSQL": "Host=localhost;Port=5432;Database=saas_erp;Username=postgres;Password=",
    "Redis": "localhost:6379",
    "MongoDB": "mongodb://localhost:27017"
  },
  "MongoDBSettings": {
    "DatabaseName": "saas_erp_logs"
  }
}
```

> La contraseña de PostgreSQL está vacía en desarrollo. En producción usar variables de entorno o Secret Manager.

---

## PostgreSQL — Datos del Negocio

### Propósito

Almacena toda la información transaccional y relacional del sistema: usuarios, empresas, productos, facturas, inventario, roles, permisos.

### Por Sistema (solo cambia el Database)

Cada sistema usa su propia base de datos PostgreSQL. La estructura de conexión es idéntica, solo cambia el nombre de la base de datos:

| Sistema | Database |
|---|---|
| ERP | `saas_erp` |
| POS | `saas_pos` |
| WMS | `saas_wms` |
| RRHH | `saas_rrhh` |

```json
// Ejemplo: conexión para RRHH
"PostgreSQL": "Host=localhost;Port=5432;Database=saas_rrhh;Username=postgres;Password="
```

### Esquemas (por sistema)

```
ERP:
  public.products
  public.invoices
  public.customers
  public.suppliers

POS:
  public.sales
  public.orders
  public.payments

WMS:
  public.warehouses
  public.inventory
  public.shipments

RRHH:
  public.employees
  public.payroll
  public.attendance
```

### Tenant Multi-empresa

Todos los sistemas usan una columna `company_id` (UUID) para aislar datos entre empresas en la misma base de datos. Se aplica un `global query filter` en EF Core para que el aislamiento sea automático.

---

## MongoDB — Logs y Auditoría

### Propósito

Almacena datos no estructurados, de alta volatilidad o que no requieren relaciones ACID:

- Logs de actividad del usuario
- Auditoría de cambios (tabla genérica `audit_log`)
- Eventos del sistema
- Datos temporales de procesos batch

### Colecciones por Sistema

```
saas_erp_logs:
  audit_logs
  error_logs
  activity_events

saas_pos_logs:
  transaction_logs
  sync_events

saas_wms_logs:
  inventory_movements
  scan_events

saas_rrhh_logs:
  access_logs
  change_history
```

### Configuración

```json
{
  "MongoDBSettings": {
    "DatabaseName": "saas_erp_logs"
  }
}
```

Solo cambiar `DatabaseName` por sistema. La conexión (`MongoDB`) es la misma para todos.

---

## Redis — Caché y Sesiones

### Propósito

Almacenamiento en memoria para datos de alta velocidad:

- **Permisos del usuario** (caché con TTL, invalidación al cambiar roles)
- **Sesiones activas** (refresh tokens, JWT blacklist)
- **Rate limiting** (por IP, por usuario, por endpoint)
- **Cache de consultas frecuentes** (catálogos, configuraciones)

### Keys por Sistema (convención)

```
{prefijo}:{sistema}:{entidad}:{id}

Ejemplos:
  perm:erp:user:123
  session:pos:token:abc
  rate:wms:ip:192.168.1.1
  cache:rrhh:employees:active
```

### Conexión

```json
"Redis": "localhost:6379"
```

Un solo Redis sirve a todos los sistemas. Se diferencian por el prefijo en la key.

---

## Reglas Generales

1. **Nunca hardcodear connection strings** en el código. Siempre desde `appsettings.json` o variables de entorno.
2. **En producción**, usar `Secret Manager` o `Azure Key Vault` / `AWS Secrets Manager` para passwords.
3. **Solo el nombre de la base de datos cambia** entre sistemas. Host, puerto, usuario y password se mantienen igual.
4. **Redis y MongoDB comparten instancia** entre todos los sistemas. PostgreSQL usa una base por sistema.
5. **Convención de nombres:** `saas_{sistema}` para PostgreSQL y `saas_{sistema}_logs` para MongoDB.

---

## Stack en los Proyectos

| Proyecto | Base de Datos |
|---|---|
| `Backend-API` | Configura conexiones y registra DbContexts |
| `Backend-Infrastructure` | EF Core DbContext, repositorios, MongoClient, Redis connection |
| `Backend-Domain` | Define entidades (sin infraestructura) |
| `Backend-Application` | Casos de uso (depende de interfaces, no de DB directa) |
