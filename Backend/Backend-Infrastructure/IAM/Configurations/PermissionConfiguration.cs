using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions", "platform");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Key).HasColumnName("key").HasMaxLength(160).IsRequired();
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
        builder.HasIndex(x => new { x.ModuleId, x.ActionCode }).IsUnique();
        builder.HasIndex(x => x.ModuleId);
    }
}
