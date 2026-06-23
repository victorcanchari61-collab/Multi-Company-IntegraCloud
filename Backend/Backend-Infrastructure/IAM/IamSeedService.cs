using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Infrastructure.IAM;

public sealed class IamSeedService
{
    public static async Task SeedAsync(IamDbContext context, IPasswordHasher passwordHasher, ILogger? logger = null)
    {
        if (await context.Users.AnyAsync(u => u.IsOwner))
        {
            logger?.LogInformation("Seed: Owner already exists, skipping.");
            return;
        }

        logger?.LogInformation("Seed: Starting data seed...");

        if (!await context.Actions.AnyAsync())
        {
            var actions = new List<PermissionAction>
            {
                new(Guid.NewGuid(), "read", "Read"),
                new(Guid.NewGuid(), "create", "Create"),
                new(Guid.NewGuid(), "update", "Update"),
                new(Guid.NewGuid(), "delete", "Delete"),
                new(Guid.NewGuid(), "export", "Export"),
                new(Guid.NewGuid(), "approve", "Approve"),
            };
            context.Actions.AddRange(actions);
            logger?.LogInformation("Seed: Added actions");
        }

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

        await context.SaveChangesAsync();

        // ── Owner ──
        var hash = passwordHasher.Hash("Admin123!");
        var owner = new User(
            Guid.NewGuid(), companyId: null,
            email: "admin@sistema.com",
            passwordHash: hash,
            fullName: "Super Admin", isOwner: true);
        context.Users.Add(owner);
        logger?.LogInformation("Seed: Owner created with hash length {Len}", hash.Length);

        await context.SaveChangesAsync();
        logger?.LogInformation("Seed: Completed successfully.");
    }
}
