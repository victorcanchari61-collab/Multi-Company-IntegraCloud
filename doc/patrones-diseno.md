# Patrones de Diseño para ASP.NET Core

No todos los patrones son igual de útiles en aplicaciones empresariales modernas. Aquí están ordenados por prioridad.

---

## Los que aprendería primero

### 1. Dependency Injection (DI)

El patrón más importante del ecosistema .NET. ASP.NET Core ya viene preparado.

```csharp
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
```

```csharp
public class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }
}
```

**Ciclos de vida:**
| Ciclo | Cuándo usarlo |
|-------|--------------|
| `AddScoped` | Por request HTTP (repositorios, servicios, DbContext) — el más común |
| `AddTransient` | Servicios ligeros sin estado, cada inyección crea una nueva instancia |
| `AddSingleton` | Configuración global, cachés, clientes HTTP reutilizables |

---

### 2. Repository Pattern

Separa el acceso a datos de la lógica de negocio. EF Core está en Infrastructure, Domain no lo conoce.

```csharp
// Domain/IAM/Repositories/IUserRepository.cs  ← contrato
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct);
    Task AddAsync(User user, CancellationToken ct);
}
```

```csharp
// Infrastructure/IAM/Repositories/UserRepository.cs  ← implementación
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _db;

    public UserRepository(ApplicationDbContext db) => _db = db;

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
        => await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
}
```

**Útil cuando:** EF Core está en Infrastructure, Domain no conoce EF Core, y quieres poder cambiar de ORM sin tocar negocio.

---

### 3. CQRS (Command Query Responsibility Segregation)

Separar operaciones de escritura (Commands) y lectura (Queries). Muy recomendable para POS, ERP y sistemas empresariales.

```csharp
// Commands (escriben)
public record CreateProductCommand(string Name, decimal Price) : ICommand<Result<Guid>>;
public record UpdateStockCommand(Guid ProductId, int Quantity) : ICommand<Result>;

// Queries (leen)
public record GetProductByIdQuery(Guid Id) : IQuery<ProductDto?>;
public record GetInventoryQuery(Guid WarehouseId) : IQuery<PagedResult<InventoryItemDto>>;
```

Muy común con MediatR.

---

### 4. Mediator Pattern

Reduce dependencias entre componentes. Un controller no necesita conocer 5 servicios distintos.

```csharp
// ❌ Sin MediatR — controller conoce múltiples servicios
_productService.Create(...);
_inventoryService.Update(...);
_notificationService.Send(...);

// ✅ Con MediatR — controller solo conoce el mediator
await _mediator.Send(command);
```

---

### 5. Factory Pattern

Cuando la creación de objetos es compleja o tiene reglas de negocio.

```csharp
public class UserFactory
{
    public User CreateAdmin(string email, string name)
    {
        var user = new User(email, name);
        user.AssignRole(Role.Admin);
        return user;
    }

    public User CreateCustomer(string email, string name, string tenantId)
    {
        var user = new User(email, name);
        user.AssignRole(Role.Customer);
        user.AssignTenant(tenantId);
        return user;
    }
}
```

Muy útil en DDD para garantizar que las entidades siempre se creen en estado válido.

---

### 6. Specification Pattern

Encapsula filtros complejos en objetos reutilizables y combinables.

```csharp
// ❌ Filtros esparcidos por toda la aplicación
_db.Products.Where(p => p.IsActive && !p.IsDeleted && p.Stock > 0);

// ✅ Specification encapsulada y reutilizable
public class ActiveProductsSpecification : Specification<Product>
{
    public ActiveProductsSpecification()
    {
        AddFilter(p => p.IsActive && !p.IsDeleted);
        AddInclude(p => p.Include(x => x.Category));
    }
}

public class LowStockSpecification : Specification<Product>
{
    public LowStockSpecification(int threshold)
    {
        AddFilter(p => p.Stock < threshold);
    }
}
```

---

## Los que aprendería después

### Domain Events

Permiten desacoplar procesos: cuando algo pasa en el dominio, se dispara un evento y múltiples handlers reaccionan.

```csharp
// Domain/IAM/Events/UserRegisteredEvent.cs
public record UserRegisteredEvent(User User) : IDomainEvent;

// Application/IAM/EventHandlers/SendWelcomeEmailHandler.cs
public class SendWelcomeEmailHandler : INotificationHandler<UserRegisteredEvent>
{
    public async Task Handle(UserRegisteredEvent notification, CancellationToken ct)
    {
        await _emailService.SendWelcomeAsync(notification.User.Email, ct);
    }
}
```

**Flujo típico:**
```
Registrar Usuario
      ↓
UserRegisteredEvent
      ↓
Enviar Email  ← handler 1
Crear Auditoría  ← handler 2
Invalidar Caché  ← handler 3
```

---

### Unit of Work

Con EF Core ya está implementado mediante `DbContext.SaveChangesAsync()`. No suelo crear uno manual salvo que exista una necesidad clara (múltiples fuentes de datos en una misma transacción).

```csharp
// EF Core ya es un Unit of Work
public class CreateOrderHandler : ICommandHandler<CreateOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateOrderCommand command, CancellationToken ct)
    {
        var order = Order.Create(command.CustomerId, command.Items);
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);  // ← Unit of Work implícito
        return Result.Success(order.Id);
    }
}
```

---

## Los que evitaría al inicio

### Generic Repository (`IGenericRepository<T>`)

Muchas veces termina siendo un "Repository de todo" con 50 métodos genéricos, difícil de mantener y que no expresa el dominio.

```csharp
// ❌ Evitar al inicio
public interface IGenericRepository<T>
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task<IReadOnlyList<T>> GetPagedAsync(int page, int size);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, params string[] includes);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<int> CountAsync(Expression<Func<T, bool>> predicate);
    // ... 15 métodos más
}
```

Prefiere repositorios específicos que reflejen el lenguaje del dominio:
- `IUserRepository` — `GetByEmailAsync`, `IsEmailUniqueAsync`
- `IProductRepository` — `GetLowStockAsync`, `GetByCategoryAsync`

---

### Singleton Pattern mal usado

```csharp
// ❌ Singleton sin entender ciclo de vida
builder.Services.AddSingleton<IMyService, MyService>();

// ✅ Para empezar, Scoped y Transient son suficientes
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddTransient<IEmailService, EmailService>();
```

Singleton solo cuando sea estrictamente necesario: caché global, configuración de solo lectura, connection pool.

---

## Stack recomendado para este proyecto

```
ASP.NET Core 10.0
│
├── Clean Architecture
│
├── Backend-Domain
│   ├── Entities/
│   ├── Events/
│   └── Repositories/          ← interfaces
│
├── Backend-Application
│   ├── Commands/              ← CQRS
│   ├── Queries/               ← CQRS
│   ├── DTOs/
│   └── Services/
│       ├── Interfaces/
│       └── Implementations/
│
├── Backend-Infrastructure
│   ├── EF Core + PostgreSQL
│   └── Repositories/          ← implementaciones
│
└── Backend-API
    └── Controllers/           ← delgados, solo mediator
```

**Orden de prioridad para dominar:**
1. Dependency Injection
2. Repository
3. CQRS
4. Mediator
5. Factory
6. Specification
7. Domain Events
