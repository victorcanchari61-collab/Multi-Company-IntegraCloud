using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Infrastructure.IAM;

public sealed class IamSeedService
{
    public static async Task SeedAsync(IamDbContext context, IPasswordHasher passwordHasher, ILogger? logger = null, CancellationToken ct = default)
    {
        logger?.LogInformation("Seed: Starting data seed...");

        // ── Actions ──
        if (!await context.Actions.AnyAsync())
        {
            var actions = new List<PermissionAction>
            {
                new(Guid.NewGuid(), "view", "View"),
                new(Guid.NewGuid(), "read", "Read"),
                new(Guid.NewGuid(), "create", "Create"),
                new(Guid.NewGuid(), "update", "Update"),
                new(Guid.NewGuid(), "delete", "Delete"),
                new(Guid.NewGuid(), "export", "Export"),
                new(Guid.NewGuid(), "approve", "Approve"),
                new(Guid.NewGuid(), "assign_permissions", "Assign Permissions"),
                new(Guid.NewGuid(), "assign_roles", "Assign Roles"),
                new(Guid.NewGuid(), "manage_modules", "Manage Modules"),
            };
            context.Actions.AddRange(actions);
            logger?.LogInformation("Seed: Added actions");
        }

        // ── Systems & Modules ──
        if (!await context.Systems.AnyAsync())
        {
            var sysIam = new SystemEntity(Guid.NewGuid(), "IAM", "IAM", "User and permission management");
            context.Systems.AddRange(
                sysIam,
                new SystemEntity(Guid.NewGuid(), "ERP", "ERP", "Enterprise Resource Planning"),
                new SystemEntity(Guid.NewGuid(), "POS", "POS", "Point of Sale"),
                new SystemEntity(Guid.NewGuid(), "WMS", "WMS", "Warehouse Management"),
                new SystemEntity(Guid.NewGuid(), "RRHH", "RRHH", "Recursos Humanos")
            );

            context.Modules.AddRange(
                new Module(Guid.NewGuid(), sysIam.Id, "users", "Users"),
                new Module(Guid.NewGuid(), sysIam.Id, "roles", "Roles"),
                new Module(Guid.NewGuid(), sysIam.Id, "companies", "Companies"),
                new Module(Guid.NewGuid(), sysIam.Id, "permissions", "Permissions")
            );
            logger?.LogInformation("Seed: Added systems and modules");
        }

        await context.SaveChangesAsync(ct);

        // ── Permisos del catálogo (Module × Action) ──
        if (!await context.Permissions.AnyAsync(ct))
        {
            var modules = await context.Modules.Include(m => m.System).ToListAsync(ct);
            var actions = await context.Actions.ToListAsync(ct);
            var permissions = new List<Permission>();

            foreach (var module in modules)
            {
                var systemCode = module.System?.Code.ToLowerInvariant() ?? "iam";
                foreach (var action in actions)
                {
                    var key = $"{systemCode}.{module.Code}.{action.Code}";
                    permissions.Add(new Permission(
                        Guid.NewGuid(), key,
                        moduleId: module.Id,
                        actionCode: action.Code,
                        description: $"{action.Name} {module.Name}"));
                }
            }

            context.Permissions.AddRange(permissions);
            logger?.LogInformation("Seed: Added {Count} permissions", permissions.Count);
            await context.SaveChangesAsync(ct);
        }

        // ── Owner ──
        if (!await context.Users.AnyAsync(u => u.IsOwner, ct))
        {
            var hash = passwordHasher.Hash("Admin123!");
            var owner = new User(
                Guid.NewGuid(), companyId: null,
                email: "admin@sistema.com",
                passwordHash: hash,
                fullName: "Super Admin", isOwner: true);
            context.Users.Add(owner);
            logger?.LogInformation("Seed: Owner created with hash length {Len}", hash.Length);

            await context.SaveChangesAsync(ct);
        }
        else
        {
            logger?.LogInformation("Seed: Owner already exists, skipping.");
        }

        // ── Cleanup expired refresh tokens ──
        var cutoff = DateTime.UtcNow.AddDays(-30);
        var expiredTokens = await context.RefreshTokens
            .Where(t => t.ExpiresAt < DateTime.UtcNow || (t.RevokedAt != null && t.RevokedAt < cutoff))
            .ToListAsync(ct);
        if (expiredTokens.Count > 0)
        {
            context.RefreshTokens.RemoveRange(expiredTokens);
            await context.SaveChangesAsync(ct);
            logger?.LogInformation("Seed: Cleaned {Count} expired refresh tokens", expiredTokens.Count);
        }

        // ── Missing ERP/Compras module ──
        var erpSystem = await context.Systems.FirstOrDefaultAsync(s => s.Code == "ERP", ct);
        var comprasModule = await context.Modules
            .Include(m => m.System)
            .FirstOrDefaultAsync(m => m.System.Code == "ERP" && m.Code == "compras", ct);
        if (comprasModule == null && erpSystem != null)
        {
            comprasModule = new Module(Guid.NewGuid(), erpSystem.Id, "compras", "Compras");
            context.Modules.Add(comprasModule);
            await context.SaveChangesAsync(ct);
            logger?.LogInformation("Seed: Added ERP/Compras module");
        }
        if (comprasModule != null)
        {
            // ── Missing permissions for Compras ──
            var comprasActions = await context.Actions.ToListAsync(ct);
            foreach (var action in comprasActions)
            {
                var key = $"erp.compras.{action.Code}";
                var exists = await context.Permissions.AnyAsync(p => p.Key == key, ct);
                if (!exists)
                {
                    context.Permissions.Add(new Permission(
                        Guid.NewGuid(), key,
                        moduleId: comprasModule.Id,
                        actionCode: action.Code,
                        description: $"{action.Name} Compras"));
                }
            }
            await context.SaveChangesAsync(ct);

            var existingCompCodes = await context.Views
                .Where(v => v.ModuleId == comprasModule.Id)
                .Select(v => v.Code)
                .ToListAsync(ct);

            var missing = new (string Code, string Name, string Route)[]
            {
                ("ordenes-compra",      "Órdenes de compra",       "/erp/compras/ordenes-compra"),
                ("proveedores",         "Proveedores",              "/erp/compras/proveedores"),
                ("solicitudes",         "Solicitudes de compra",    "/erp/compras/solicitudes"),
                ("evaluacion",          "Evaluación de proveedores","/erp/compras/evaluacion"),
                ("contratos",           "Contratos de compra",      "/erp/compras/contratos"),
            }
            .Where(v => !existingCompCodes.Contains(v.Code))
            .Select(v => new View(Guid.NewGuid(), comprasModule.Id, v.Code, v.Name, v.Route))
            .ToList();

            if (missing.Count > 0)
            {
                context.Views.AddRange(missing);
                logger?.LogInformation("Seed: Added {Count} ERP/Compras views", missing.Count);
                await context.SaveChangesAsync(ct);
            }

            // ── Grant CompanyModuleAccess for Compras to existing companies ──
            var hasComprasAccess = await context.CompanyModuleAccesses
                .AnyAsync(cma => cma.ModuleId == comprasModule.Id, ct);
            if (!hasComprasAccess)
            {
                var companies = await context.Companies.ToListAsync(ct);
                foreach (var company in companies)
                {
                    context.CompanyModuleAccesses.Add(new CompanyModuleAccess(
                        Guid.NewGuid(), company.Id, comprasModule.Id, null));
                }
                await context.SaveChangesAsync(ct);
                logger?.LogInformation("Seed: Granted ERP/Compras access to {Count} companies", companies.Count);
            }
        }

        // ── Missing ERP/Ventas module ──
        var ventasModule = await context.Modules
            .Include(m => m.System)
            .FirstOrDefaultAsync(m => m.System.Code == "ERP" && m.Code == "ventas", ct);
        if (ventasModule == null && erpSystem != null)
        {
            ventasModule = new Module(Guid.NewGuid(), erpSystem.Id, "ventas", "Ventas");
            context.Modules.Add(ventasModule);
            await context.SaveChangesAsync(ct);
            logger?.LogInformation("Seed: Added ERP/Ventas module");
        }
        if (ventasModule != null)
        {
            // ── Missing permissions for Ventas ──
            var ventasActions = await context.Actions.ToListAsync(ct);
            foreach (var action in ventasActions)
            {
                var key = $"erp.ventas.{action.Code}";
                var exists = await context.Permissions.AnyAsync(p => p.Key == key, ct);
                if (!exists)
                {
                    context.Permissions.Add(new Permission(
                        Guid.NewGuid(), key,
                        moduleId: ventasModule.Id,
                        actionCode: action.Code,
                        description: $"{action.Name} Ventas"));
                }
            }
            await context.SaveChangesAsync(ct);

            var existingVentasCodes = await context.Views
                .Where(v => v.ModuleId == ventasModule.Id)
                .Select(v => v.Code)
                .ToListAsync(ct);

            var missingViews = new (string Code, string Name, string Route)[]
            {
                ("cotizaciones",            "Cotizaciones",             "/erp/ventas/cotizaciones"),
                ("ordenes-venta",           "Órdenes de venta",         "/erp/ventas/ordenes-venta"),
                ("clientes",                "Clientes",                 "/erp/ventas/clientes"),
                ("listas-precios",          "Listas de precios",        "/erp/ventas/listas-precios"),
                ("condiciones-comerciales", "Condiciones comerciales",  "/erp/ventas/condiciones-comerciales"),
                ("comisiones-vendedores",   "Comisiones de vendedores", "/erp/ventas/comisiones-vendedores"),
            }
            .Where(v => !existingVentasCodes.Contains(v.Code))
            .Select(v => new View(Guid.NewGuid(), ventasModule.Id, v.Code, v.Name, v.Route))
            .ToList();

            if (missingViews.Count > 0)
            {
                context.Views.AddRange(missingViews);
                logger?.LogInformation("Seed: Added {Count} ERP/Ventas views", missingViews.Count);
                await context.SaveChangesAsync(ct);
            }

            // ── Grant CompanyModuleAccess for Ventas to existing companies ──
            var hasVentasAccess = await context.CompanyModuleAccesses
                .AnyAsync(cma => cma.ModuleId == ventasModule.Id, ct);
            if (!hasVentasAccess)
            {
                var companies = await context.Companies.ToListAsync(ct);
                foreach (var company in companies)
                {
                    context.CompanyModuleAccesses.Add(new CompanyModuleAccess(
                        Guid.NewGuid(), company.Id, ventasModule.Id, null));
                }
                await context.SaveChangesAsync(ct);
                logger?.LogInformation("Seed: Granted ERP/Ventas access to {Count} companies", companies.Count);
            }
        }

        // ── Missing ERP/Inventario views ──
        var erpModule = await context.Modules
            .Include(m => m.System)
            .FirstOrDefaultAsync(m => m.System.Code == "ERP" && m.Code == "inventario", ct);
        if (erpModule != null)
        {
            var existingCodes = await context.Views
                .Where(v => v.ModuleId == erpModule.Id)
                .Select(v => v.Code)
                .ToListAsync(ct);

            var missing = new (string Code, string Name, string Route)[]
            {
                ("costo-promedio", "Costo promedio ponderado", "/erp/inventario/costo-promedio"),
                ("valorizacion",    "Valorización de stock",    "/erp/inventario/valorizacion"),
                ("reservas",        "Reservas de stock",        "/erp/inventario/reservas"),
                ("ajustes",         "Ajustes de inventario",    "/erp/inventario/ajustes"),
                ("reposicion",      "Niveles de reposición",    "/erp/inventario/reposicion"),
                ("kardex",          "Kárdex contable",          "/erp/inventario/kardex"),
            }
            .Where(v => !existingCodes.Contains(v.Code))
            .Select(v => new View(Guid.NewGuid(), erpModule.Id, v.Code, v.Name, v.Route))
            .ToList();

            if (missing.Count > 0)
            {
                context.Views.AddRange(missing);
                logger?.LogInformation("Seed: Added {Count} missing ERP/Inventario views", missing.Count);
            }

            // Actualiza rutas de vistas existentes que apuntan a la ruta antigua (duplicada)
            var updated = 0;
            var existing = await context.Views
                .Where(v => v.ModuleId == erpModule.Id)
                .ToListAsync(ct);
            foreach (var v in existing)
            {
                if (v.Code == "ajustes" && v.Route == "/erp/inventario/movimientos")
                {
                    v.SetRoute("/erp/inventario/ajustes");
                    updated++;
                }
                else if (v.Code == "costo-promedio" && v.Route == "/erp/inventario/kardex")
                {
                    v.SetRoute("/erp/inventario/costo-promedio");
                    updated++;
                }
            }
            if (updated > 0)
            {
                await context.SaveChangesAsync(ct);
                logger?.LogInformation("Seed: Updated {Count} ERP/Inventario view routes", updated);
            }
        }

        logger?.LogInformation("Seed: Completed successfully.");
    }
}
