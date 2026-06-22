# Defensa contra DDoS y Abuso de API

## ¿Qué es?

**DDoS (Distributed Denial of Service)** — ataque que satura un servidor con millones de peticiones hasta que colapsa CPU, memoria, ancho de banda o base de datos.

También conocido como:
- API flooding / Request flooding
- HTTP flood attack
- Botnet attack

---

## 1. Rate Limiting (limitador de peticiones)

ASP.NET Core 7+ trae rate limiting nativo. Corta el ataque antes de que llegue a tu lógica.

```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromSeconds(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.RejectionStatusCode = 429;
});

app.UseRateLimiter();
```

También se puede rate limitear por usuario (JWT claim), endpoint o por política personalizada.

---

## 2. Cola de fondo (desacoplar carga pesada)

**No procesar tareas pesadas dentro del request HTTP.** Las escribituras van a una cola y se procesan en background.

```csharp
// Opción simple con Channel (built-in)
public class BackgroundQueue
{
    private readonly Channel<Func<CancellationToken, Task>> _queue =
        Channel.CreateUnbounded<Func<CancellationToken, Task>>();

    public void Enqueue(Func<CancellationToken, Task> workItem)
        => _queue.Writer.TryWrite(workItem);

    public async Task<Func<CancellationToken, Task>> DequeueAsync(CancellationToken ct)
        => await _queue.Reader.ReadAsync(ct);
}
```

Para producción: **RabbitMQ** (alta escala) o **Hangfire** (tareas programadas + persistencia).

---

## 3. Caché con Redis

Evita pegarle a la base de datos en cada request, especialmente bajo ataque.

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
});
```

```csharp
public async Task<string> GetProductsAsync()
{
    var cacheKey = "products:list";
    var cached = await _cache.GetStringAsync(cacheKey);
    if (cached is not null) return cached;

    var data = await _db.Products.AsNoTracking().ToListAsync();
    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(data),
        new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        });

    return JsonSerializer.Serialize(data);
}
```

---

## 4. Paginación obligatoria

Nunca exponer endpoints sin paginación. Esto evita queries destructivas como `SELECT * FROM Products`.

```csharp
public async Task<PagedResult<ProductDto>> GetProductsAsync(int page = 1, int size = 20)
{
    size = Math.Min(size, 100);  // ← máximo 100 por página

    var query = _db.Products.AsNoTracking();
    var totalCount = await query.CountAsync();
    var items = await query.Skip((page - 1) * size).Take(size).ToListAsync();

    return new PagedResult<ProductDto> { Items = items, Page = page, PageSize = size, TotalCount = totalCount };
}
```

**Reglas:**
- Todo listado debe tener `Skip`/`Take`
- Tamaño máximo por página: 100
- Rechazar requests con `size` > 100 (400 Bad Request)

---

## 5. Circuit Breaker (Polly)

Protege contra servicios externos caídos. Si una API externa falla 5 veces seguidas, deja de llamarla por 30 segundos.

```csharp
builder.Services.AddHttpClient("api")
    .AddTransientHttpErrorPolicy(policy =>
        policy.CircuitBreakerAsync(
            handledEventsAllowedBeforeBreaking: 5,
            durationOfBreak: TimeSpan.FromSeconds(30)
        ));
```

---

## 6. Response Compression + CDN

Reduce el payload de las respuestas y sirve contenido estático desde edge.

```csharp
builder.Services.AddResponseCompression();
app.UseResponseCompression();
```

**CDN recomendados:** Cloudflare, Azure Front Door, AWS CloudFront.

---

## 7. Connection Pooling + Timeouts

Configuración en connection string de PostgreSQL:

```
Host=localhost;Database=db;Username=user;Password=pass;MaxPoolSize=100;Timeout=30;
```

**Buenas prácticas:**
- `MaxPoolSize` limitado (100-200)
- Timeout de conexión en 30s
- Siempre `async/await`
- Evitar queries bloqueantes
- Analizar queries lentos con `EXPLAIN ANALYZE`

---

## 8. WAF + DDoS Protection externo

Nada de lo anterior detiene un DDoS masivo por sí solo. Para ataques reales se necesita:

- Cloudflare / AWS Shield / Azure DDoS Protection
- Web Application Firewall (WAF) con reglas inteligentes
- Auto-scaling horizontal
- CAPTCHA o challenge-response para endpoints críticos

---

## Arquitectura de defensa en profundidad

```
Cliente
   │
   ▼
[CDN / WAF]  ← Cloudflare, CloudFront, Azure Front Door
   │
   ▼
[Rate Limiter]  ← ASP.NET Core (por IP o usuario)
   │
   ▼
[API Gateway]  ← (opcional) Azure API Management, YARP
   │
   ▼
[ASP.NET Core API]
   ├── [Cache Redis]  ← evita hits a BD
   ├── [Cola]         ← desacopla escrituras pesadas
   └── [Circuit Breaker]  ← protege contra dependencias caídas
   │
   ▼
[PostgreSQL / MongoDB]
   ├── Connection Pooling
   ├── Índices
   └── Paginación forzada
```

| Capa | Tecnología |
|------|-----------|
| CDN/WAF | Cloudflare, Azure Front Door |
| Rate Limiting | `System.Threading.RateLimiting` (built-in) |
| Caché | Redis (`StackExchange.Redis`) |
| Cola | RabbitMQ / Hangfire / `System.Threading.Channels` |
| Circuit Breaker | Polly |
| Compresión | `Microsoft.AspNetCore.ResponseCompression` |
| DDoS externo | AWS Shield, Azure DDoS Protection |
