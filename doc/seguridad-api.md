# Seguridad en APIs

Una API segura no es una sola técnica, sino una combinación de controles en varias capas. Asume que tu API **siempre va a ser atacada** — la seguridad es diseño, no parche.

---

## 1. Autenticación (quién eres)

Saber quién está llamando a la API. JWT es el estándar en ASP.NET Core.

```csharp
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "tu-api",
            ValidAudience = "tu-app",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")!))
        };
    });
```

```csharp
[Authorize]
[HttpGet]
public IActionResult GetData() => Ok();
```

Sin autenticación = API pública = riesgo alto.

---

## 2. Autorización (qué puedes hacer)

No basta con saber quién eres, también qué permisos tiene.

```csharp
[Authorize(Roles = "Admin")]
[HttpDelete("users/{id}")]
public IActionResult DeleteUser(Guid id) => Ok();
```

O con policies más flexibles:

```csharp
[Authorize(Policy = "CanDeleteUsers")]
```

---

## 3. Rate Limiting (anti abuso)

Evita fuerza bruta, scraping y spam. Ya documentado en `defensa-api.md`.

- X requests por IP
- X requests por usuario autenticado
- Obligatorio en APIs públicas

---

## 4. Validación de entrada (CRÍTICO)

Nunca confíes en el cliente. Validar **todo** antes de procesar.

```csharp
public class CreateUserDto
{
    [Required]
    [MaxLength(50)]
    public string Name { get; set; }

    [EmailAddress]
    public string Email { get; set; }

    [MinLength(8)]
    public string Password { get; set; }
}
```

**Reglas:**
- Nunca aceptar objetos sin validar (`[ApiController]` + `FluentValidation`)
- Nunca confiar en IDs enviados por el cliente (verificar pertenencia)
- Acotar tamaños máximos de strings y colecciones

---

## 5. Protección contra ataques comunes

### SQL Injection
Usar Entity Framework o parámetros. Nunca concatenar SQL.

```csharp
// ✅ Seguro
_db.Users.Where(u => u.Email == email);

// ❌ Peligroso
_db.Database.ExecuteSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'");
```

### XSS (Cross-Site Scripting)
- Devolver JSON puro, no HTML
- No renderizar texto sin escape si se devuelve HTML
- Sanitizar inputs con `HtmlSanitizer`

### CSRF (Cross-Site Request Forgery)
- Usar JWT en headers Authorization (sin cookies)
- Si usas cookies, implementar tokens anti-forgery

---

## 6. Control de errores (no filtrar información)

Nunca devolver detalles internos al cliente.

```json
// ❌ MAL — expone información interna
{
  "error": "Cannot insert duplicate key in table 'Users'. The statement has been terminated."
}
```

```json
// ✅ BIEN — mensaje genérico, detalle va a logs
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Conflict",
  "status": 409,
  "detail": "El recurso ya existe."
}
```

Los logs internos sí deben capturar el detalle completo (Serilog, Application Insights).

---

## 7. HTTPS obligatorio

Sin HTTPS, todo lo demás pierde sentido.

```csharp
app.UseHttpsRedirection();
```

Usar TLS 1.2+ siempre. Redirigir HTTP a HTTPS.

---

## 8. Protección contra DDoS / abuso

Documentado en detalle en `defensa-api.md`. Resumen:

- Rate limiting
- CDN (Cloudflare, Azure Front Door)
- WAF (Web Application Firewall)
- Caché Redis
- Paginación obligatoria
- Colas para escrituras pesadas
- Circuit Breaker

---

## 9. Secrets bien guardados

```csharp
// ❌ NUNCA en código
"Password=123"
```

Fuentes seguras de configuración:
| Entorno | Dónde guardar secrets |
|---------|----------------------|
| Desarrollo | `appsettings.Development.json` + User Secrets |
| Producción | Azure Key Vault / AWS Secrets Manager |
| Contenedores | Variables de entorno |
| CI/CD | Secrets del pipeline (GitHub Actions, Azure DevOps) |

---

## 10. Logging y monitoreo

Sin logs no sabes si te están atacando.

```csharp
// Serilog con Application Insights
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration)
        .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces));
```

**Alertas recomendadas:**
- Pico de 401/403 (ataque de fuerza bruta)
- Pico de 429 (rate limiting golpeando)
- Pico de 500 (posible exploit)
- Latencia anormal (DDoS o fuga de recursos)
- Caída de dependencias externas

---

## 11. Seguridad en dependencias externas

Cada llamada a un servicio externo es un punto de fallo.

```csharp
// Polly: circuit breaker + retries + timeout
builder.Services.AddHttpClient("external-api")
    .AddTransientHttpErrorPolicy(policy =>
        policy.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)))
    .AddTransientHttpErrorPolicy(policy =>
        policy.WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))));
```

---

## 12. Arquitectura segura (backend real)

```
Cliente
   │
   ▼
[CDN + WAF]  ← Cloudflare
   │
   ▼
[HTTPS / TLS 1.2+]
   │
   ▼
[Rate Limiter]  ← por IP + por usuario
   │
   ▼
[API Gateway]  ← (opcional) Azure API Management, YARP
   │
   ▼
[ASP.NET Core API]
   ├── JWT Auth
   ├── Roles / Policies
   ├── Validación estricta
   ├── Cache Redis
   └── Cola (RabbitMQ / Hangfire)
   │
   ▼
[PostgreSQL / MongoDB]  ← aislada, pool limitado
```

---

## Resumen mental

| Capa | Control |
|------|---------|
| **Identidad** | JWT / OAuth2 |
| **Acceso** | Roles + Policies |
| **Abuso** | Rate limit + WAF + CDN |
| **Inputs** | Validación estricta (FluentValidation) |
| **Infraestructura** | Caché + colas + circuit breaker |
| **Observabilidad** | Logs + métricas + alertas |
| **Secretos** | Key Vault / Env vars |
| **Transporte** | HTTPS / TLS 1.2+ |

> No existe API 100% segura. El objetivo es **subir el costo del ataque hasta que ya no sea rentable**.
