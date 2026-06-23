using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class SystemConfiguration : IEntityTypeConfiguration<SystemEntity>
{
    public void Configure(EntityTypeBuilder<SystemEntity> builder)
    {
        builder.ToTable("systems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasColumnName("code")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasColumnName("description")
            .HasMaxLength(255);

        builder.Property(x => x.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.HasIndex(x => x.Code).IsUnique();
    }
}

public sealed class ModuleConfiguration : IEntityTypeConfiguration<Module>
{
    public void Configure(EntityTypeBuilder<Module> builder)
    {
        builder.ToTable("modules");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SystemId).HasColumnName("system_id").IsRequired();
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(40).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.System)
            .WithMany(s => s.Modules)
            .HasForeignKey(x => x.SystemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.SystemId, x.Code }).IsUnique();
        builder.HasIndex(x => x.SystemId);
    }
}

public sealed class ViewConfiguration : IEntityTypeConfiguration<View>
{
    public void Configure(EntityTypeBuilder<View> builder)
    {
        builder.ToTable("views");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ModuleId).HasColumnName("module_id").IsRequired();
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(60).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.Route).HasColumnName("route").HasMaxLength(150);

        builder.HasOne(x => x.Module)
            .WithMany(m => m.Views)
            .HasForeignKey(x => x.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ModuleId, x.Code }).IsUnique();
        builder.HasIndex(x => x.ModuleId);
    }
}

public sealed class ComponentConfiguration : IEntityTypeConfiguration<Component>
{
    public void Configure(EntityTypeBuilder<Component> builder)
    {
        builder.ToTable("components");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ViewId).HasColumnName("view_id").IsRequired();
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(60).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();

        builder.HasOne(x => x.View)
            .WithMany(v => v.Components)
            .HasForeignKey(x => x.ViewId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.ViewId, x.Code }).IsUnique();
        builder.HasIndex(x => x.ViewId);
    }
}

public sealed class ActionConfiguration : IEntityTypeConfiguration<PermissionAction>
{
    public void Configure(EntityTypeBuilder<PermissionAction> builder)
    {
        builder.ToTable("actions");

        builder.HasKey(x => x.Code);
        builder.Ignore(x => x.Id);
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(30);
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(60).IsRequired();
    }
}

public sealed class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Key).HasColumnName("key").HasMaxLength(160).IsRequired();
        builder.Property(x => x.ResourceType).HasColumnName("resource_type").IsRequired();
        builder.Property(x => x.ResourceId).HasColumnName("resource_id").IsRequired();
        builder.Property(x => x.ModuleId).HasColumnName("module_id").IsRequired();
        builder.Property(x => x.ActionCode).HasColumnName("action_code").HasMaxLength(30).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(255);

        builder.HasOne(x => x.Module)
            .WithMany(m => m.Permissions)
            .HasForeignKey(x => x.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Action)
            .WithMany(a => a.Permissions)
            .HasForeignKey(x => x.ActionCode)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.Key).IsUnique();
        builder.HasIndex(x => new { x.ResourceType, x.ResourceId, x.ActionCode }).IsUnique();
        builder.HasIndex(x => x.ModuleId);
    }
}

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("companies");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(80).IsRequired();
        builder.Property(x => x.LegalName).HasColumnName("legal_name").HasMaxLength(200);
        builder.Property(x => x.LogoUrl).HasColumnName("logo_url").HasMaxLength(500);
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(150);
        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20);
        builder.Property(x => x.Website).HasColumnName("website").HasMaxLength(255);
        builder.Property(x => x.Address).HasColumnName("address").HasMaxLength(300);
        builder.Property(x => x.TaxId).HasColumnName("tax_id").HasMaxLength(20);
        builder.Property(x => x.TaxAddress).HasColumnName("tax_address").HasMaxLength(300);
        builder.Property(x => x.EconomicActivity).HasColumnName("economic_activity").HasMaxLength(255);
        builder.Property(x => x.TaxpayerType).HasColumnName("taxpayer_type").IsRequired().HasDefaultValue(1);
        builder.Property(x => x.AccountingRequired).HasColumnName("accounting_required").IsRequired().HasDefaultValue(false);
        builder.Property(x => x.SettlementCurrency).HasColumnName("settlement_currency").HasMaxLength(3).IsRequired().HasDefaultValue("PEN");
        builder.Property(x => x.Status).HasColumnName("status").IsRequired().HasDefaultValue(1);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");

        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.TaxId).IsUnique();
    }
}

public sealed class CompanyModuleAccessConfiguration : IEntityTypeConfiguration<CompanyModuleAccess>
{
    public void Configure(EntityTypeBuilder<CompanyModuleAccess> builder)
    {
        builder.ToTable("company_module_access");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.ModuleId).HasColumnName("module_id").IsRequired();
        builder.Property(x => x.GrantedAt).HasColumnName("granted_at").IsRequired();
        builder.Property(x => x.GrantedBy).HasColumnName("granted_by");

        builder.HasOne(x => x.Company)
            .WithMany(c => c.ModuleAccesses)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Module)
            .WithMany(m => m.CompanyAccesses)
            .HasForeignKey(x => x.ModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.CompanyId, x.ModuleId }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => x.ModuleId);
    }
}

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id");
        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
        builder.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
        builder.Property(x => x.FullName).HasColumnName("full_name").HasMaxLength(150).IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").IsRequired().HasDefaultValue(1);
        builder.Property(x => x.IsOwner).HasColumnName("is_owner").IsRequired().HasDefaultValue(false);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Company)
            .WithMany(c => c.Users)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.CompanyId, x.Email }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
    }
}

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(80).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(255);
        builder.Property(x => x.IsSystemTemplate).HasColumnName("is_system_template").IsRequired().HasDefaultValue(false);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Company)
            .WithMany(c => c.Roles)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.CompanyId, x.Name }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
    }
}

public sealed class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permissions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RoleId).HasColumnName("role_id").IsRequired();
        builder.Property(x => x.PermissionId).HasColumnName("permission_id").IsRequired();

        builder.HasOne(x => x.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(x => x.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.RoleId, x.PermissionId }).IsUnique();
        builder.HasIndex(x => x.PermissionId);
    }
}

public sealed class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(x => x.RoleId).HasColumnName("role_id").IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.UserId, x.RoleId }).IsUnique();
        builder.HasIndex(x => x.RoleId);
    }
}

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(x => x.TokenHash).HasColumnName("token_hash").HasMaxLength(255).IsRequired();
        builder.Property(x => x.ExpiresAt).HasColumnName("expires_at").IsRequired();
        builder.Property(x => x.RevokedAt).HasColumnName("revoked_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId);
    }
}
