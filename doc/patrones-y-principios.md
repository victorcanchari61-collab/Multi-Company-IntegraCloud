# Patrones y Principios

## Manejo Global de Errores

Middleware centralizado que captura excepciones no controladas y devuelve respuestas consistentes.

```
Backend-Infrastructure/Common/Middleware/
├── ExceptionMiddleware.cs        ← captura y formatea errores
├── RequestLoggingMiddleware.cs   ← log de request/response
└── PerformanceMiddleware.cs      ← alerta si una request excede X ms
```

Estructura de respuesta de error:
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 400,
  "detail": "Ocurrieron uno o más errores de validación.",
  "instance": "/api/iam/users",
  "traceId": "00-0d8f1a2b...",
  "errors": {
    "Email": ["El email no es válido."],
    "Password": ["La contraseña debe tener al menos 8 caracteres."]
  }
}
```

---

## Result Pattern (Mónada Result)

Evita usar excepciones para flujo de control. Todas las operaciones retornan `Result<T>` o `Result` en lugar de lanzar excepciones.

```csharp
public async Task<Result<UserDto>> RegisterAsync(RegisterCommand command)
{
    var user = User.Create(command.Email, command.Password);
    if (user.IsFailure)
        return Result.Failure<UserDto>(user.Error);

    await _repository.AddAsync(user.Value);
    return Result.Success(user.Value.ToDto());
}
```

---

## CQRS (Command Query Responsibility Segregation)

Separación de operaciones de escritura (Commands) y lectura (Queries) mediante MediatR.

```
Backend-Application/IAM/
├── Commands/
│   ├── RegisterUser/
│   │   ├── RegisterUserCommand.cs
│   │   ├── RegisterUserHandler.cs
│   │   └── RegisterUserValidator.cs
│   └── UpdateUser/
│       ├── UpdateUserCommand.cs
│       ├── UpdateUserHandler.cs
│       └── UpdateUserValidator.cs
├── Queries/
│   ├── GetUserById/
│   │   ├── GetUserByIdQuery.cs
│   │   └── GetUserByIdHandler.cs
│   └── ListUsers/
│       ├── ListUsersQuery.cs
│       └── ListUsersHandler.cs
```

---

## Pipeline Behaviors (MediatR)

Cross-cutting concerns aplicados antes/después de cada handler sin modificar el handler.

```
Backend-Application/Common/Behaviors/
├── ValidationBehavior.cs         ← ejecuta FluentValidation automáticamente
├── LoggingBehavior.cs            ← log de cada command/query
├── PerformanceBehavior.cs        ← mide tiempo de ejecución
└── TransactionBehavior.cs        ← encapsula en transacción de BD
```

---

## Domain Events

Los aggregate roots publican eventos de dominio que otros handlers procesan.

```
Backend-Domain/IAM/Events/
├── UserRegisteredEvent.cs        ← se publica cuando un usuario se registra
└── UserPasswordChangedEvent.cs   ← se publica cuando cambia la contraseña
```

Los handlers van en Application:
```
Backend-Application/IAM/EventHandlers/
├── SendWelcomeEmailHandler.cs    ← envía email de bienvenida
└── InvalidateCacheHandler.cs     ← invalida caché de usuarios
```

---

## Unit of Work + TransactionScope

Garantiza que múltiples operaciones se persistan en una sola transacción.

```csharp
public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (IsNotCommand()) return await next();

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var response = await next();
        await transaction.CommitAsync(ct);
        return response;
    }
}
```

---

## Outbox Pattern

Para consistencia eventual entre agregados y sistemas externos (emails, colas, eventos).

```
Backend-Infrastructure/Common/Outbox/
├── OutboxMessage.cs              ← entidad del outbox
├── OutboxDbContext.cs            ← tabla OutboxMessages
├── OutboxMessageProcessor.cs     ← background job que lee y envía
└── OutboxExtensions.cs           ← config del processor
```

---

## Soft Delete

Los registros no se eliminan físicamente, se marcan como eliminados.

```csharp
public interface ISoftDeletable
{
    bool IsDeleted { get; }
    DateTime? DeletedAt { get; }
    string? DeletedBy { get; }
}
```

Global query filter en EF Core:
```csharp
builder.HasQueryFilter(e => !e.IsDeleted);
```

---

## Specification Pattern

Consulta reutilizables y combinables sin exponer IQueryable fuera del repositorio.

```csharp
public class ActiveUsersSpecification : Specification<User>
{
    public ActiveUsersSpecification()
    {
        AddFilter(u => u.IsActive && !u.IsDeleted);
        AddInclude(u => u.Include(x => x.Roles));
    }
}
```

---

## Paginación

Todas las listas devuelven resultados paginados.

```csharp
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
```

---

## API Versioning

Las rutas incluyen la versión de la API.

| Ruta | Propósito |
|------|-----------|
| `/api/v1/iam/users` | Versión actual |
| `/api/v2/iam/users` | Próxima versión (breaking changes) |

---

## Health Checks

Endpoint `/health` para monitoreo de infraestructura.

```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddNpgSql(_configuration.GetConnectionString("PostgreSQL"))
    .AddRedis(_configuration.GetConnectionString("Redis"))
    .AddMongoDb(_configuration.GetConnectionString("MongoDB"));
```

---

## Audit Logging / Tracking

Registro automático de quién creó/modificó cada entidad y cuándo.

| Columna | Propósito |
|---------|-----------|
| `CreatedBy` | Usuario que creó el registro |
| `CreatedAt` | Fecha de creación (UTC) |
| `LastModifiedBy` | Último usuario que modificó |
| `LastModifiedAt` | Fecha de última modificación (UTC) |

---

## Dependency Injection por Convención

Registro automático de servicios sin tener que registrarlos uno por uno.

```csharp
// Infrastructure/DependencyInjection.cs
public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
{
    services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(config.GetConnectionString("PostgreSQL")));
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IProductRepository, ProductRepository>();
    services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(config.GetConnectionString("Redis")));
    return services;
}

// Application/DependencyInjection.cs
public static IServiceCollection AddApplication(this IServiceCollection services)
{
    services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));
    services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
    services.AddAutoMapper(typeof(DependencyInjection).Assembly);
    return services;
}
```

---

## Background Jobs

Tareas programadas o en segundo plano (limpieza, notificaciones, procesamiento outbox).

```csharp
public class OutboxProcessor : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessOutboxMessagesAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}
```

---

## Principios SOLID

### S — Single Responsibility Principle (SRP)

> Una clase debe tener una sola razón para cambiar.

Cada clase tiene una única responsabilidad bien definida.

```csharp
// Bien: cada clase tiene un único propósito
public class User { ... }                          // solo datos y reglas del usuario
public class UserRepository : IUserRepository { }  // solo persistencia
public class AuthService : IAuthService { }        // solo orquestación de auth
public class EmailService : IEmailService { }      // solo envío de emails
```

```csharp
// Mal: una clase que hace de todo
public class UserService
{
    public void Register(...) { /* validar, guardar en BD, enviar email, generar token */ }
}
```

En clean architecture: cada handler de MediatR, cada repositorio, cada servicio tiene **una y solo una** razón de cambio.

---

### O — Open/Closed Principle (OCP)

> Las entidades deben estar abiertas para extensión, cerradas para modificación.

Se extiende el comportamiento sin modificar el código existente.

```csharp
// Abierto a extensión: nuevos sistemas solo agregan carpetas
Backend-Domain/
├── IAM/
│   └── Repositories/IUserRepository.cs
├── ERP/
│   └── Repositories/IProductRepository.cs  ← nuevo sistema, sin tocar IAM
```

```csharp
// Pipeline behaviors: nueva validación sin modificar handlers
public class RateLimitingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    // nuevo behavior sin tocar ningún handler existente
}
```

```csharp
// Specification pattern: nuevas consultas sin modificar repositorios
public class UsersExpiredSinceSpecification : Specification<User>
{
    // nuevo filtro sin tocar UserRepository
}
```

---

### L — Liskov Substitution Principle (LSP)

> Las clases derivadas deben poder sustituir a sus clases base sin alterar el comportamiento.

```csharp
// Bien: cualquier repositorio cumple el contrato de IRepository<T>
public interface IRepository<T> where T : Entity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Delete(T entity);
}

// Ambos pueden usarse donde se espere IRepository<T>
public class UserRepository : IRepository<User> { ... }
public class ProductRepository : IRepository<Product> { ... }
```

```csharp
// Mal: violación de LSP
public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }
}

public class Square : Rectangle  // viola LSP: cambiar Width afecta Height
{
    public override int Width { set { base.Width = base.Height = value; } }
}
```

Regla práctica: si te encuentras usando `is` o `as` con tipos derivados, probablemente estás violando LSP.

---

### I — Interface Segregation Principle (ISP)

> Los clientes no deben ser forzados a depender de interfaces que no usan.

Interfaces pequeñas y específicas en lugar de una interfaz gigante.

```csharp
// Bien: interfaces segregadas
public interface IReadRepository<T>
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<T>> GetAllAsync();
}

public interface IWriteRepository<T>
{
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

// Un servicio de solo lectura solo depende de lo que necesita
public class UserReportService
{
    private readonly IReadRepository<User> _userReadRepo;  // solo lectura
}
```

```csharp
// Mal: interfaz que obliga a implementar métodos innecesarios
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<User>> GetAllAsync();
    Task AddAsync(User user);
    void Update(User user);
    void Delete(User user);
    Task<UserReport> GenerateReportAsync();  // ← no todas las implementaciones necesitan esto
}
```

En el proyecto: los handlers de Queries solo usan `IReadRepository<T>` o repositorios de solo lectura; los Commands usan `IWriteRepository<T>`.

---

### D — Dependency Inversion Principle (DIP)

> Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones. Las abstracciones no deben depender de detalles; los detalles deben depender de abstracciones.

Es la base de Clean Architecture.

```csharp
// Application define la abstracción (puerto)
namespace Backend.Application.IAM.Services.Interfaces;
public interface IAuthService
{
    Task<Result<AuthResponse>> LoginAsync(LoginCommand command);
}

// Infrastructure implementa la abstracción (adaptador)
namespace Backend.Infrastructure.IAM.Services;
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ITokenService _tokenService;
    // ...
}

// API registra la implementación en el compositor root
// Program.cs
builder.Services.AddScoped<IAuthService, AuthService>();
```

Flujo de dependencias:
```
Domain/Repositories/IUserRepository      ← abstracción (Domain)
Infrastructure/Repositories/UserRepository  ← implementación (Infrastructure)
Application/IAM/Services/Interfaces/IAuthService ← abstracción (Application)
Application/IAM/Services/Implementations/AuthService ← implementación (Application)
```

**Domain y Application** definen los contratos (nunca hacen `new` de implementaciones concretas).
**Infrastructure y API** proveen las implementaciones y las inyectan.

---

## Resumen de principios

| Principio / Patrón | Dónde aplica | Propósito |
|-------------------|-------------|-----------|
| **SRP** | Toda la app | Una clase = una responsabilidad |
| **OCP** | Behaviors, Specifications | Extender sin modificar |
| **LSP** | Repositorios, Servicios | Sustitución segura de implementaciones |
| **ISP** | Application, Domain | Interfaces pequeñas y específicas |
| **DIP** | Toda la app (Clean Architecture) | Alto nivel no depende de bajo nivel |
| Middleware de errores | Infrastructure/Common | Respuestas consistentes ante fallos |
| Result Pattern | SharedKernel / toda la app | Evitar excepciones como flujo de control |
| CQRS | Application | Separar lecturas de escrituras |
| Pipeline Behaviors | Application | Cross-cutting sin tocar handlers |
| Domain Events | Domain + Application | Desacoplar efectos secundarios |
| Unit of Work | Infrastructure | Transacciones atómicas |
| Outbox Pattern | Infrastructure | Consistencia eventual |
| Soft Delete | Domain + Infrastructure | Borrado lógico |
| Specification | Domain + Infrastructure | Consultas reutilizables |
| Pagination | SharedKernel / Application | Respuestas paginadas |
| API Versioning | API | Evolución del API sin romper clientes |
| Health Checks | API | Monitoreo de infraestructura |
| Audit Tracking | Domain + Infrastructure | Trazabilidad de cambios |
| DI por Convención | Cada capa | Registro limpio y centralizado |
| Background Jobs | Infrastructure | Tareas asíncronas y programadas |
