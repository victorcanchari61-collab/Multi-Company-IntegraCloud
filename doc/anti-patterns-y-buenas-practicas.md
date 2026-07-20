# Anti-Patterns y Buenas Prácticas

## 1. Hacer todo `async` porque sí

```csharp
// ❌ Incorrecto — no hay operación I/O
public async Task<int> SumarAsync(int a, int b)
{
    return a + b;
}

// ✅ Correcto
public int Sumar(int a, int b)
{
    return a + b;
}
```

Usa `async` solo cuando realmente esperes una operación I/O:

- Base de datos
- HTTP
- Sistema de archivos
- Colas
- APIs externas

---

## 2. Mezclar `async` con `.Result` o `.Wait()`

```csharp
// ❌ Deadlocks, bloqueo de threads, pérdida de escalabilidad
var user = userService.GetByIdAsync(id).Result;
userService.GetByIdAsync(id).Wait();

// ✅ Correcto
var user = await userService.GetByIdAsync(id);
```

---

## 3. No propagar `async`

```csharp
// ❌ La asincronía se corta
public User GetUser(Guid id)
{
    return _repository.GetByIdAsync(id).Result;
}

// ✅ La asincronía debe propagarse hacia arriba
public async Task<User> GetUserAsync(Guid id)
{
    return await _repository.GetByIdAsync(id);
}
```

---

## 4. Crear `Task.Run` en ASP.NET Core

```csharp
// ❌ Empeora el rendimiento en ASP.NET Core
public async Task<User> GetUserAsync(Guid id)
{
    return await Task.Run(() =>
    {
        return _repository.Get(id);
    });
}

// ✅ Correcto
public async Task<User> GetUserAsync(Guid id)
{
    return await _repository.GetByIdAsync(id);
}
```

---

## 5. No usar `CancellationToken`

```csharp
// ❌ La request no se puede cancelar (timeout, cliente desconectado)
public async Task<User> GetUserAsync(Guid id)
{
    return await _db.Users.FirstOrDefaultAsync(x => x.Id == id);
}

// ✅ Siempre propagar CancellationToken
public async Task<User> GetUserAsync(Guid id, CancellationToken ct)
{
    return await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
}
```

---

## 6. Capturar excepciones y tragárselas

```csharp
// ❌ Pesadilla para depurar
try
{
    await SaveAsync();
}
catch
{
}

// ✅ Correcto — loguear o re-lanzar
try
{
    await SaveAsync();
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error al guardar");
    throw;
}
```

---

## 7. Consultas N+1

```csharp
// ❌ 100 productos = 101 consultas a la BD
var products = await _db.Products.ToListAsync();
foreach (var p in products)
{
    var stock = await _db.Stocks.FirstOrDefaultAsync(x => x.ProductId == p.Id);
}

// ✅ Una sola consulta con Include
var products = await _db.Products.Include(x => x.Stock).ToListAsync();
```

---

## 8. Inyectar `DbContext` en cualquier lado

```
// ❌ Lógica de negocio acoplada a EF Core
Controller → Service → Service → Service → DbContext

// ✅ Repository aísla el acceso a datos
Controller → Application → Repository → EF Core
```

El `DbContext` solo debe estar en **repositorios** (Infrastructure), nunca en Services o Controllers.

---

## 9. Repositorios genéricos gigantes

```csharp
// ❌ IGenericRepository<T> con 50 métodos
public interface IGenericRepository<T>
{
    Task<T> GetByIdAsync(Guid id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task<IReadOnlyList<T>> GetPagedAsync(int page, int size);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate);
    // ... 40 métodos más
}

// ✅ Repositorios específicos que expresan el dominio
public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct);
    Task<bool> IsEmailUniqueAsync(string email, CancellationToken ct);
}

public interface IProductRepository
{
    Task<IReadOnlyList<Product>> GetLowStockAsync(int threshold, CancellationToken ct);
}
```

---

## 10. No entender cuándo usar interfaces

```csharp
// ❌ Interfaz sin propósito real (nunca habrá otra implementación)
public interface IUserService { ... }
public class UserService : IUserService { ... }

public interface IProductService { ... }
public class ProductService : IProductService { ... }

public interface ICategoryService { ... }
public class CategoryService : ICategoryService { ... }
```

Crea interfaces solo cuando:

- Esperas múltiples implementaciones (`IRepository<T>` → `PostgresRepository`, `MongoRepository`)
- Necesitas mockear para tests
- Aplicas DIP (Clean Architecture): Domain/Application definen contratos, Infrastructure implementa

---

## 11. Meter toda la lógica en Controllers

```csharp
// ❌ Controller de 300 líneas
[HttpPost]
public async Task<IActionResult> Create(CreateRequest request)
{
    // validación manual
    // lógica de negocio
    // acceso a BD
    // envío de email
    // logging manual
    // ...
}
```

```csharp
// ✅ Controller delgado
[HttpPost]
public async Task<IActionResult> Create(CreateUserCommand command)
{
    var result = await _mediator.Send(command);
    return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
}
```

---

## 12. No entender Entity Framework

| Concepto | Impacto si se ignora |
|----------|---------------------|
| **Tracking vs NoTracking** | Lecturas innecesarias ralentizan el cambio de contexto |
| **Include / ThenInclude** | Consultas N+1 |
| **Lazy Loading** | Consultas N+1 automáticas (deshabilitar en APIs) |
| **Change Tracker** | Cambios no deseados persistidos automáticamente |
| **AsNoTracking** | En consultas de solo lectura, duplica rendimiento |
| **AsSplitQuery** | Evita productos cartesianos en joins múltiples |
| **Transactions** | Inconsistencia de datos si falla una operación |
| **Batch Operations** | `SaveChanges` por cada entidad en lugar de en lote |

```csharp
// ✅ Lectura: AsNoTracking + SplitQuery
var data = await _db.Orders
    .AsNoTracking()
    .Include(x => x.Items)
    .ThenInclude(x => x.Product)
    .AsSplitQuery()
    .ToListAsync(ct);

// ✅ Escritura: Tracking (default)
_db.Users.Add(newUser);
await _db.SaveChangesAsync(ct);
```

---

## 13. No paginar consultas

```csharp
// ❌ Trae todo a memoria — mata el sistema con millones de registros
var all = await _db.Users.ToListAsync(ct);
return all.Select(x => x.ToDto());
```

```csharp
// ✅ Siempre paginar
var query = _db.Users.AsNoTracking();

var totalCount = await query.CountAsync(ct);
var items = await query
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync(ct);

return new PagedResult<UserDto>
{
    Items = items.Select(x => x.ToDto()).ToList(),
    Page = page,
    PageSize = pageSize,
    TotalCount = totalCount
};
```

---

## 14. No usar `using` o `Dispose` en recursos no administrados

```csharp
// ❌ Conexiones abiertas que no se cierran
var conn = new NpgsqlConnection(connectionString);
conn.Open();

// ✅ using garantiza cierre incluso con excepciones
await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync(ct);
```

---

## 15. Logging excesivo o inexistente

```csharp
// ❌ Sin logging
public async Task<User> GetByIdAsync(Guid id)
{
    return await _db.Users.FindAsync(id);
}

// ❌ Logging excesivo en cada método
_logger.LogInformation("Entrando a GetByIdAsync con id {Id}", id);
var user = await _db.Users.FindAsync(id);
_logger.LogInformation("Saliendo de GetByIdAsync con resultado {User}", user);
```

```csharp
// ✅ Solo loguear errores, advertencias y eventos importantes
public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
{
    var user = await _db.Users.FindAsync(new object[] { id }, ct);
    if (user is null)
        _logger.LogWarning("Usuario {Id} no encontrado", id);
    return user;
}
```

---

## 16. No establecer timeout en operaciones externas

```csharp
// ❌ Llamada HTTP sin timeout — puede quedar colgada para siempre
var response = await _httpClient.GetAsync(url);

// ✅ Timeout explícito
using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
cts.CancelAfter(TimeSpan.FromSeconds(30));

var response = await _httpClient.GetAsync(url, cts.Token);
```

---

## 17. No validar entrada de datos

```csharp
// ❌ El controller acepta cualquier cosa
[HttpPost]
public async Task<IActionResult> Create(User user)
{
    await _userService.CreateAsync(user);
    return Ok();
}
```

```csharp
// ✅ Validación con FluentValidation + MediatR pipeline
public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).MinimumLength(8);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
```

---

## 18. No usar índices en la base de datos

```sql
-- ❌ Table Scan — recorre toda la tabla
SELECT * FROM Users WHERE Email = 'test@test.com';

-- ✅ Con índice
CREATE INDEX IX_Users_Email ON Users(Email);
```

Siempre analizar los queries generados por EF Core y agregar índices a columnas usadas en `WHERE`, `JOIN`, `ORDER BY`.

---

## Resumen rápido

| # | Anti-Pattern | Solución |
|---|-------------|----------|
| 1 | `async` sin I/O | Solo `async` si hay BD, HTTP, archivos, colas |
| 2 | `.Result` / `.Wait()` | Usar `await` siempre |
| 3 | Cortar la asincronía | Propagar `async` hacia arriba |
| 4 | `Task.Run` en ASP.NET Core | No enmascarar llamadas síncronas |
| 5 | Sin `CancellationToken` | Siempre propagarlo |
| 6 | `catch` vacío | Loguear o re-lanzar |
| 7 | N+1 | Usar `Include` / `ThenInclude` |
| 8 | DbContext en cualquier lado | Solo en repositorios |
| 9 | Repositorios genéricos gigantes | Repositorios específicos del dominio |
| 10 | Interfaces sin propósito | Solo si hay múltiples impl o mock |
| 11 | Controllers gordos | Delegar a MediatR handlers |
| 12 | Ignorar EF Core | Conocer Tracking, NoTracking, Include |
| 13 | Sin paginación | Siempre paginar listas |
| 14 | Recursos sin `Dispose` | Usar `using` |
| 15 | Sin logging o logging excesivo | Solo errores, warnings y eventos clave |
| 16 | Sin timeout | `CancellationTokenSource` con timeout |
| 17 | Sin validación | FluentValidation en commands |
| 18 | Sin índices | Analizar queries y crear índices |
