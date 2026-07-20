using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("stock", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(x => x.Quantity).HasColumnName("quantity").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.ReservedQuantity).HasColumnName("reserved_quantity").HasPrecision(18, 4).IsRequired().HasDefaultValue(0);
        builder.Property(x => x.UnitCost).HasColumnName("unit_cost").HasPrecision(18, 6);
        builder.Property(x => x.MinStock).HasColumnName("min_stock").HasPrecision(18, 4);
        builder.Property(x => x.MaxStock).HasColumnName("max_stock").HasPrecision(18, 4);
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId);

        builder.HasIndex(x => new { x.CompanyId, x.ProductId, x.WarehouseId }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
        builder.HasIndex(x => x.WarehouseId);
    }
}
