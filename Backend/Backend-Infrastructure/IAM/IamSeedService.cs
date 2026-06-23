using Backend.Domain.IAM.Entities;
using Backend.Domain.IAM.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM;

public sealed class IamSeedService
{
    public static async Task SeedAsync(IamDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Users.AnyAsync())
            return;

        // ── Actions (catálogo de verbos) ──
        var actionRead = new PermissionAction(Guid.NewGuid(), "read", "Read");
        var actionCreate = new PermissionAction(Guid.NewGuid(), "create", "Create");
        var actionUpdate = new PermissionAction(Guid.NewGuid(), "update", "Update");
        var actionDelete = new PermissionAction(Guid.NewGuid(), "delete", "Delete");
        var actionExport = new PermissionAction(Guid.NewGuid(), "export", "Export");
        var actionApprove = new PermissionAction(Guid.NewGuid(), "approve", "Approve");

        context.Actions.AddRange(actionRead, actionCreate, actionUpdate, actionDelete, actionExport, actionApprove);

        // ── Systems ──
        var sysIam = new SystemEntity(Guid.NewGuid(), "IAM", "Identity & Access Management", "User and permission management");
        var sysErp = new SystemEntity(Guid.NewGuid(), "ERP", "Enterprise Resource Planning", "Core business management");
        var sysPos = new SystemEntity(Guid.NewGuid(), "POS", "Point of Sale", "Sales and transactions");
        var sysWms = new SystemEntity(Guid.NewGuid(), "WMS", "Warehouse Management", "Inventory and logistics");
        var sysRrhh = new SystemEntity(Guid.NewGuid(), "RRHH", "Recursos Humanos", "Human resources management");

        context.Systems.AddRange(sysIam, sysErp, sysPos, sysWms, sysRrhh);

        // ── Modules ──
        var modUsers = new Module(Guid.NewGuid(), sysIam.Id, "users", "Users");
        var modRoles = new Module(Guid.NewGuid(), sysIam.Id, "roles", "Roles");
        var modCompanies = new Module(Guid.NewGuid(), sysIam.Id, "companies", "Companies");
        var modPermissions = new Module(Guid.NewGuid(), sysIam.Id, "permissions", "Permissions");

        context.Modules.AddRange(modUsers, modRoles, modCompanies, modPermissions);
        await context.SaveChangesAsync();

        // ── Views ──
        var viewList = new View(Guid.NewGuid(), modUsers.Id, "list", "User List", "/iam/users");
        var viewDetail = new View(Guid.NewGuid(), modUsers.Id, "detail", "User Detail", "/iam/users/:id");
        context.Views.AddRange(viewList, viewDetail);
        await context.SaveChangesAsync();

        // ── Permissions ──
        var cats = new List<(string key, int resType, Guid resId, Guid modId, string action)>
        {
            ("iam.users.list", 3, viewList.Id, modUsers.Id, "read"),
            ("iam.users.create", 3, viewList.Id, modUsers.Id, "create"),
            ("iam.users.detail", 3, viewDetail.Id, modUsers.Id, "read"),
        };
        var permissions = cats.Select(c => new Permission(Guid.NewGuid(), c.key, c.resType, c.resId, c.modId, c.action, null)).ToList();
        context.Permissions.AddRange(permissions);

        // ── Company (por defecto) ──
        var defaultCompany = new Company(
            Guid.NewGuid(),
            "Mi Empresa",
            "mi-empresa",
            "Mi Empresa S.A.C.",
            null, null, null, null, null,
            "12345678901", null, null,
            2, false, "PEN",
            null);
        context.Companies.Add(defaultCompany);

        // ── Owner ──
        var owner = new User(
            Guid.NewGuid(),
            companyId: null,
            email: "admin@sistema.com",
            passwordHash: passwordHasher.Hash("Admin123!"),
            fullName: "Super Admin",
            isOwner: true);
        context.Users.Add(owner);

        await context.SaveChangesAsync();
    }
}
