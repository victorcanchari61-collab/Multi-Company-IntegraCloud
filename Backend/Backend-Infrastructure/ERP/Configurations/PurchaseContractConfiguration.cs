using Backend.Domain.ERP.Entities.Compras;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class PurchaseContractConfiguration : IEntityTypeConfiguration<PurchaseContract>
{
    public void Configure(EntityTypeBuilder<PurchaseContract> builder)
    {
        builder.ToTable("purchase_contracts", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.SupplierId).HasColumnName("supplier_id").IsRequired();
        builder.Property(x => x.ContractNumber).HasColumnName("contract_number").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(300).IsRequired();
        builder.Property(x => x.StartDate).HasColumnName("start_date").IsRequired();
        builder.Property(x => x.EndDate).HasColumnName("end_date").IsRequired();
        builder.Property(x => x.Value).HasColumnName("value").HasPrecision(18, 2);
        builder.Property(x => x.Terms).HasColumnName("terms").HasMaxLength(4000);
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId);

        builder.HasIndex(x => new { x.CompanyId, x.ContractNumber }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
    }
}
