---
name: backend-dotnet
description: Convenciones para trabajar en el backend .NET (carpeta Backend/). Úsala al crear o editar Controllers, Commands/Queries, Services, Repositories, Entities o DbContext en ASP.NET Core con Clean Architecture (sistemas IAM, ERP, etc.). Cubre CQRS+MediatR, Repository, EF Core, async, validación y seguridad de API.
---

# Backend .NET — IntegraCloud

Stack: **ASP.NET Core 10 / .NET 10**, Clean Architecture, MediatR, FluentValidation, AutoMapper, EF Core + Npgsql (PostgreSQL), MongoDB.Driver, JWT Bearer, Redis, Serilog.

Referencia completa: `doc/arquitectura.md`, `doc/patrones-diseno.md`, `doc/anti-patterns-y-buenas-practicas.md`, `doc/seguridad-api.md`, `doc/defensa-api.md`.

## Capas y dependencias (Clean Architecture)

```
Backend-API ──► Backend-Application ──► Backend-Domain ──► Backend-SharedKernel
Backend-Infrastructure ──► Backend-Application
```

- **Backend-API** (Presentación): controllers delgados, middleware, DI, Swagger, JWT. Sin lógica de negocio ni acceso a datos.
- **Backend-Application** (Casos de uso): Commands/Queries + handlers (CQRS), validators, DTOs, mappings, Services de aplicación (orquestación). Solo depende de Domain. **Sin EF Core, sin HTTP.**
- **Backend-Domain** (Negocio): Entities (aggregate roots), ValueObjects, **interfaces** de repositorios y servicios de dominio, eventos. Solo depende de SharedKernel. **Sin infraestructura ni frameworks.**
- **Backend-Infrastructure** (Técnica): implementaciones de repos y servicios, DbContext, JWT, email, caché, mensajería. Depende de Application. **Sin lógica de negocio.**
- **Backend-SharedKernel**: clases base (Entity, AggregateRoot, ValueObject), `Result<T>`, `Error`, `Guard`, `IRepository`, `DomainEvent`, especificaciones, extensions. Sin dependencias.

## Organización por sistema

Cada capa se subdivide por **sistema** (`IAM/`, `ERP/`, …) y dentro separa interfaces de implementaciones.

```
Domain/IAM/Repositories/IUserRepository.cs          ← interface (contrato)
Infrastructure/IAM/Repositories/UserRepository.cs    ← implementación (EF Core)
Domain/IAM/Services/ITokenService.cs                ← interface
Infrastructure/IAM/Services/JwtTokenService.cs       ← implementación
Application/IAM/Services/Interfaces/IAuthService.cs     ← interface
Application/IAM/Services/Implementations/AuthService.cs ← orquestación
Backend-API/Controllers/IAM/AuthController.cs
```

## Patrones obligatorios

- **CQRS + MediatR**: escrituras = `Command`, lecturas = `Query`. El controller solo hace `await _mediator.Send(...)`.
- **Repository específico del dominio** (`IUserRepository.GetByEmailAsync`), **NO** `IGenericRepository<T>` con 50 métodos.
- **DI**: `AddScoped` para repos/services/DbContext, `AddTransient` para servicios sin estado, `AddSingleton` solo para config/caché global.
- **Result\<T\>** para resultados de operaciones en vez de lanzar excepciones para flujo esperado.
- Crear interfaces **solo** si habrá múltiples implementaciones, se necesita mockear, o aplica DIP (Domain define contrato, Infrastructure implementa). No `IXService` 1:1 sin propósito.
- **Factory** para crear entidades complejas en estado válido; **Specification** para filtros reutilizables; **Domain Events** para desacoplar efectos secundarios.

## Controller delgado (patrón estándar)

```csharp
[HttpPost]
public async Task<IActionResult> Create(CreateUserCommand command, CancellationToken ct)
{
    var result = await _mediator.Send(command, ct);
    return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
}
```

## Reglas duras de async / EF Core

- `async` **solo** con I/O real (BD, HTTP, archivos, colas). Nada de `async` para sumar dos números.
- **Nunca** `.Result` ni `.Wait()` → siempre `await`. Propaga `async` hacia arriba. Nada de `Task.Run` en ASP.NET Core.
- **Siempre** propaga `CancellationToken` hasta la query.
- Lectura: `AsNoTracking()` + `Include`/`ThenInclude` (evita N+1) + `AsSplitQuery()` en joins múltiples.
- Escritura: tracking por defecto + `SaveChangesAsync(ct)` (Unit of Work implícito).
- **Pagina todo** listado (`Skip`/`Take`, máx 100 por página, devuelve `PagedResult<T>`).
- `DbContext` vive **solo en repositorios** (Infrastructure), nunca en Services ni Controllers.
- `catch` nunca vacío: loguear (Serilog) o re-lanzar. `using`/`await using` para recursos. Timeout explícito en llamadas externas.

## Validación y seguridad

- Valida entrada con **FluentValidation** en los Commands (no confíes en el cliente; verifica pertenencia de IDs; acota tamaños).
- **JWT Bearer** + `[Authorize]` / roles / policies. Secrets fuera del código (env vars / User Secrets / Key Vault).
- Solo EF/parámetros (nunca SQL concatenado). Respuestas en JSON; errores genéricos al cliente, detalle a logs.
- Rate limiting nativo, caché Redis para lecturas calientes, Polly (circuit breaker + retries) para dependencias externas, índices en columnas de `WHERE`/`JOIN`/`ORDER BY`.

## Antes de codificar

Usa CodeGraph (`codegraph_context`, `codegraph_search`) para ubicar la entidad/servicio/sistema afectado y respeta las barreras de capa: si vas a tocar Domain, no metas dependencias de Infrastructure.
