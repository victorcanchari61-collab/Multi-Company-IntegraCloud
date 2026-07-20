using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class CompanyModuleAccessConfiguration : IEntityTypeConfiguration<CompanyModuleAccess>
{
    public void Configure(EntityTypeBuilder<CompanyModuleAccess> builder)
    {
        builder.ToTable("company_module_access", "platform");

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
