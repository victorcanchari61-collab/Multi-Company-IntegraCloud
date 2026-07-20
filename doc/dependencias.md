# Dependencias del Backend

## Infraestructura requerida

| Dependencia  | Versión sugerida | Propósito                                  | Estado       |
|-------------|-----------------|---------------------------------------------|-------------|
| PostgreSQL  | 16+             | Base de datos relacional principal          | Pendiente   |
| Redis       | 7+              | Caché en memoria y mensajería/pub-sub       | Pendiente   |
| MongoDB     | 7+              | Base de datos NoSQL para documentos         | Pendiente   |
| .NET SDK    | 10.0            | Runtime y SDK para el backend               | Instalado   |

## Paquetes NuGet por proyecto

### Backend-API
| Paquete                             | Versión   | Propósito                               |
|-------------------------------------|-----------|-----------------------------------------|
| Swashbuckle.AspNetCore              | 6.6.2     | Documentación Swagger/OpenAPI           |
| Microsoft.AspNetCore.Authentication.JwtBearer | * | Autenticación JWT                     |
| Microsoft.AspNetCore.SignalR        | *         | WebSockets / comunicación en tiempo real|

### Backend-Application (pendientes)
| Paquete                     | Propósito                          |
|-----------------------------|------------------------------------|
| MediatR                     | CQRS / manejo de comandos/queries  |
| FluentValidation            | Validación de comandos/queries     |
| AutoMapper                  | Mapeo DTO <-> Entidades            |

### Backend-Infrastructure (pendientes)
| Paquete                             | Propósito                          |
|-------------------------------------|------------------------------------|
| Npgsql / EntityFrameworkCore        | ORM para PostgreSQL                |
| MongoDB.Driver                      | Driver oficial MongoDB             |
| StackExchange.Redis                 | Cliente Redis                      |
| Serilog.AspNetCore                  | Logging estructurado               |
| Serilog.Sinks.PostgreSQL            | Logs en PostgreSQL                 |
| System.IdentityModel.Tokens.Jwt     | Generación/validación de tokens JWT|

## Instalación local

### PostgreSQL
```bash
# Windows (Chocolatey)
choco install postgresql

# Linux (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
```

### Redis
```bash
# Windows (Chocolatey)
choco install redis

# Linux
sudo apt install redis-server

# macOS
brew install redis
```

### MongoDB
```bash
# Windows (Chocolatey)
choco install mongodb

# Linux
sudo apt install mongodb-org

# macOS
brew install mongodb-community
```
