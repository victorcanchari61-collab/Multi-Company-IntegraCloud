using Backend.Domain.ERP.Entities.Ventas;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class SalesCommissionConfiguration : IEntityTypeConfiguration<SalesCommission>
{
    public void Configure(EntityTypeBuilder<SalesCommission> builder)
    {
        builder.ToTable("sales_commissions", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(20).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(x => x.SalesAgentName).HasColumnName("sales_agent_name").HasMaxLength(200);
        builder.Property(x => x.CommissionRate).HasColumnName("commission_rate").HasPrecision(5, 2).IsRequired();
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasIndex(x => new { x.CompanyId, x.Code }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
    }
}
