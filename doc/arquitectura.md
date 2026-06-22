# Arquitectura del Backend

## Clean Architecture (Arquitectura Limpia)

El backend sigue los principios de **Clean Architecture** para mantener separación de responsabilidades, testabilidad y bajo acoplamiento.

```
Backend/
├── Backend-API               (Presentación)
├── Backend-Application       (Casos de uso / Aplicación)
├── Backend-Domain            (Negocio / Dominio)
├── Backend-Infrastructure    (Infraestructura / Persistencia)
└── Backend-SharedKernel      (Código compartido base)
```

## Diagrama de dependencias

```
Backend-API
    │
    ├──► Backend-Application
    │       │
    │       └──► Backend-Domain
    │               │
    │               └──► Backend-SharedKernel
    │
    └──► Backend-Infrastructure
            │
            └──► Backend-Application
                    │
                    └──► Backend-Domain
                            │
                            └──► Backend-SharedKernel
```

## Organización por Sistemas

Cada capa se organiza internamente por **sistemas** (IAM, ERP, etc.). Dentro de cada sistema se separan **interfaces** e **implementaciones** en carpetas distintas.

```
Backend-API/
├── Controllers/
│   ├── IAM/
│   │   ├── AuthController.cs
│   │   └── UserController.cs
│   ├── ERP/
│   │   ├── ProductController.cs
│   │   └── OrderController.cs
│   └── ... (próximos sistemas)

Backend-Application/
├── IAM/
│   ├── Commands/
│   ├── Queries/
│   ├── DTOs/
│   ├── Validators/
│   ├── Mappings/
│   ├── Services/
│   │   ├── Interfaces/
│   │   │   └── IAuthService.cs
│   │   └── Implementations/
│   │       └── AuthService.cs          (lógica de aplicación pura)
│   └── EventHandlers/
├── ERP/
│   ├── Commands/
│   ├── Queries/
│   ├── DTOs/
│   ├── Validators/
│   ├── Mappings/
│   ├── Services/
│   │   ├── Interfaces/
│   │   └── Implementations/
│   └── EventHandlers/
└── Common/                             (compartido entre sistemas)
    ├── Behaviors/
    ├── Mappings/
    └── Interfaces/

Backend-Domain/
├── IAM/
│   ├── Entities/
│   │   ├── User.cs
│   │   └── Role.cs
│   ├── ValueObjects/
│   ├── Repositories/                   (solo interfaces)
│   │   └── IUserRepository.cs
│   ├── Services/                       (solo interfaces)
│   │   └── ITokenService.cs
│   └── Events/
│       └── UserRegisteredEvent.cs
├── ERP/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Repositories/
│   ├── Services/
│   └── Events/
└── Common/
    ├── Entities/
    └── ValueObjects/

Backend-Infrastructure/
├── IAM/
│   ├── Repositories/                   (implementaciones)
│   │   └── UserRepository.cs
│   ├── Services/                       (implementaciones)
│   │   ├── JwtTokenService.cs
│   │   └── HasherService.cs
│   └── Configurations/
│       └── IamDbContext.cs
├── ERP/
│   ├── Repositories/
│   │   └── ProductRepository.cs
│   ├── Services/
│   └── Configurations/
│       └── ErpDbContext.cs
└── Common/
    ├── Data/
    │   └── ApplicationDbContext.cs
    └── Middleware/
        ├── ExceptionMiddleware.cs
        └── WebSocketMiddleware.cs

Backend-SharedKernel/                    (no se organiza por sistema - es transversal)
├── Entities/
│   ├── Entity.cs                        (base para entidades con Id)
│   └── AggregateRoot.cs                 (base para aggregate roots)
├── ValueObjects/
│   └── ValueObject.cs                   (base para value objects)
├── Repositories/
│   └── IRepository.cs                   (interfaz genérica CRUD)
├── Events/
│   └── DomainEvent.cs                   (base para eventos de dominio)
├── Guards/
│   └── Guard.cs                         (precondiciones / guard clauses)
├── Results/
│   ├── Result.cs                        (mónada Result<T>)
│   └── Error.cs                         (registro de errores)
├── Specifications/
│   └── ISpecification.cs                (patrón especificación)
└── Extensions/
    └── StringExtensions.cs              (extension methods comunes)
```

## Responsabilidades de cada capa

### Backend-API (Capa de Presentación)
- **Rol:** Punto de entrada de la aplicación.
- **Responsabilidades:**
  - Recibir peticiones HTTP (REST).
  - Delegar la lógica a la capa de Aplicación (mediante MediatR u otros).
  - Configurar middleware (autenticación JWT, CORS, logging, Swagger, WebSockets).
  - Inyección de dependencias y configuración general del host.
  - Controladores organizados por sistema (`Controllers/IAM/`, `Controllers/ERP/`).
- **Dependencias:** Backend-Application, Backend-Infrastructure.
- **No debe contener:** Lógica de negocio, acceso directo a datos.

### Backend-Application (Capa de Aplicación)
- **Rol:** Orquestación de casos de uso.
- **Responsabilidades:**
  - Definir comandos, queries y sus handlers (CQRS) organizados por sistema.
  - Validar entrada de datos (FluentValidation).
  - Mapear DTOs ↔ Entidades de dominio (AutoMapper).
  - Coordinar la ejecución de reglas de negocio sin implementarlas.
  - Definir interfaces de servicios de aplicación (`Services/Interfaces/`).
  - Implementar servicios de aplicación que contengan lógica de orquestación pura (`Services/Implementations/`).
- **Dependencias:** Backend-Domain.
- **No debe contener:** Acceso a base de datos, HTTP, frameworks externos.

### Backend-Domain (Capa de Dominio)
- **Rol:** Corazón del negocio.
- **Responsabilidades:**
  - Entidades del dominio (Aggregate Roots) organizadas por sistema.
  - Value Objects.
  - Especificaciones y reglas de negocio.
  - Interfaces de repositorios (`Repositories/`) - solo contratos, sin implementación.
  - Interfaces de servicios de dominio (`Services/Interfaces/`) - solo contratos.
  - Eventos de dominio.
- **Dependencias:** Backend-SharedKernel.
- **No debe contener:** Referencias a infraestructura, bases de datos, frameworks.

### Backend-Infrastructure (Capa de Infraestructura)
- **Rol:** Implementación técnica de los contratos definidos en capas internas.
- **Responsabilidades:**
  - Implementar repositorios definidos en Domain (`Repositories/`).
  - Implementar servicios de dominio y aplicación (`Services/`).
  - Configurar persistencia (DbContext, conexiones) por sistema.
  - Implementar servicios externos (JWT, email, almacenamiento de archivos).
  - Configurar logging, caché (Redis), mensajería.
- **Dependencias:** Backend-Application.
- **No debe contener:** Lógica de negocio.

### Backend-SharedKernel
- **Rol:** Código base y abstracciones genéricas reutilizables.
- **Responsabilidades:**
  - Clases base (Entity, ValueObject, AggregateRoot).
  - Guard Clauses (precondiciones).
  - Interfaces genéricas (IRepository, IUnitOfWork).
  - Atributos y anotaciones base.
  - Extension methods comunes.
- **Dependencias:** Ninguna (framework puro .NET).
- **No debe contener:** Lógica de negocio específica.

## Patrón Service + Repository

### Repositorios
- **Interfaces** → se definen en `Domain/{Sistema}/Repositories/`.
- **Implementaciones** → se definen en `Infrastructure/{Sistema}/Repositories/`.
- Encapsulan el acceso a datos (PostgreSQL, MongoDB, etc.).
- Las interfaces son contratos que el dominio necesita; las implementaciones son detalles de infraestructura.

### Servicios
- **Servicios de Dominio:** Interfaces en `Domain/{Sistema}/Services/`, implementaciones en `Infrastructure/{Sistema}/Services/`. Contienen lógica de negocio que no encaja naturalmente en una entidad o value object.
- **Servicios de Aplicación:** Interfaces en `Application/{Sistema}/Services/Interfaces/`, implementaciones en `Application/{Sistema}/Services/Implementations/`. Orquestan casos de uso y coordinan repositorios + servicios de dominio.

```
Ejemplo: Gestión de usuarios (IAM)

Domain/IAM/Repositories/IUserRepository.cs          ← interface
Infrastructure/IAM/Repositories/UserRepository.cs    ← implementación (EF Core)

Domain/IAM/Services/ITokenService.cs                ← interface
Infrastructure/IAM/Services/JwtTokenService.cs       ← implementación (JWT)

Application/IAM/Services/Interfaces/IAuthService.cs         ← interface
Application/IAM/Services/Implementations/AuthService.cs     ← implementación (orquestación)
```

## Flujo típico de una petición

```
Cliente HTTP
    │
    ▼
[Backend-API] Controllers/IAM/AuthController.cs
    │
    ▼
[Backend-Application] IAM/Services/Implementations/AuthService.cs
    │
    ├──► Validación (FluentValidation)
    │
    ├──► [Backend-Domain] IAM/Entities/User.cs  ← reglas de negocio
    │
    ├──► [Backend-Infrastructure] IAM/Repositories/UserRepository.cs  ← EF Core
    │
    └──► [Backend-Infrastructure] IAM/Services/JwtTokenService.cs  ← JWT
    │
    ▼
[Backend-API] Response ← DTO
```

## Tecnologías principales

| Capa           | Tecnología                                  |
|----------------|---------------------------------------------|
| API            | ASP.NET Core 10.0, Swagger, SignalR/WebSocket|
| Application    | MediatR, FluentValidation, AutoMapper        |
| Domain         | .NET 10.0 (POCOs)                            |
| Infrastructure | EF Core + Npgsql, MongoDB.Driver             |
| SharedKernel   | .NET 10.0                                    |
| Autenticación  | JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer) |
| Caché          | Redis                                       |
| Logging        | Serilog                                     |
