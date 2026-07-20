using Backend.Domain.IAM.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.IAM.Configurations;

public sealed class CompanySystemAccessConfiguration : IEntityTypeConfiguration<CompanySystemAccess>
{
    public void Configure(EntityTypeBuilder<CompanySystemAccess> builder)
    {
        builder.ToTable("company_system_access", "platform");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.SystemId).HasColumnName("system_id").IsRequired();
        builder.Property(x => x.GrantedAt).HasColumnName("granted_at").IsRequired();
        builder.Property(x => x.GrantedBy).HasColumnName("granted_by");

        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<SystemEntity>()
            .WithMany()
            .HasForeignKey(x => x.SystemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.CompanyId, x.SystemId }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
    }
}
