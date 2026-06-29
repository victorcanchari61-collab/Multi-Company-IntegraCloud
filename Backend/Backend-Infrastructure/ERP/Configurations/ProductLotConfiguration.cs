using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class ProductLotConfiguration : IEntityTypeConfiguration<ProductLot>
{
    public void Configure(EntityTypeBuilder<ProductLot> builder)
    {
        builder.ToTable("product_lots", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.Number).HasColumnName("number").HasMaxLength(100).IsRequired();
        builder.Property(x => x.ExpiryDate).HasColumnName("expiry_date").HasColumnType("date");
        builder.Property(x => x.InitialStock).HasColumnName("initial_stock").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Product).WithMany(p => p.Lots).HasForeignKey(x => x.ProductId);

        builder.HasIndex(x => new { x.ProductId, x.Number }).IsUnique();
    }
}
