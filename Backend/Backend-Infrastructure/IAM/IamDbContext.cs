using Backend.Domain.ERP.Entities;
using Backend.Domain.IAM.Entities;
using Backend.Infrastructure.IAM.Configurations;
using Backend.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.IAM;

public sealed class IamDbContext : DbContext, IUnitOfWork
{
    public DbSet<SystemEntity> Systems => Set<SystemEntity>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<View> Views => Set<View>();
    public DbSet<Component> Components => Set<Component>();
    public DbSet<PermissionAction> Actions => Set<PermissionAction>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyModuleAccess> CompanyModuleAccesses => Set<CompanyModuleAccess>();
    public DbSet<CompanySystemAccess> CompanySystemAccesses => Set<CompanySystemAccess>();
    public DbSet<CompanyBillingCredential> CompanyBillingCredentials => Set<CompanyBillingCredential>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // ── ERP / Maestros ──
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();

    public IamDbContext(DbContextOptions<IamDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Ignore<DomainEvent>();

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IamDbContext).Assembly);

        modelBuilder.Entity<User>().HasQueryFilter(u => u.CompanyId != null || u.IsOwner);
        modelBuilder.Entity<Role>().HasQueryFilter(r => r.Company != null);
        modelBuilder.Entity<CompanyModuleAccess>().HasQueryFilter(c => c.Company != null);
    }
}
