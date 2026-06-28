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

        logger?.LogInformation("Seed: Completed successfully.");
    }
}
