using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class KardexEntryConfiguration : IEntityTypeConfiguration<KardexEntry>
{
    public void Configure(EntityTypeBuilder<KardexEntry> builder)
    {
        builder.ToTable("kardex_entries", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(x => x.MovementType).HasColumnName("movement_type").HasMaxLength(50).IsRequired();
        builder.Property(x => x.ReferenceType).HasColumnName("reference_type").HasMaxLength(50);
        builder.Property(x => x.ReferenceId).HasColumnName("reference_id");
        builder.Property(x => x.QuantityIn).HasColumnName("quantity_in").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.QuantityOut).HasColumnName("quantity_out").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.Balance).HasColumnName("balance").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.PreviousBalance).HasColumnName("previous_balance").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.UnitCost).HasColumnName("unit_cost").HasPrecision(18, 4);
        builder.Property(x => x.TotalCost).HasColumnName("total_cost").HasPrecision(18, 4);
        builder.Property(x => x.Notes).HasColumnName("notes").HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(x => x.CreatedBy).HasColumnName("created_by").IsRequired();

        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
        builder.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId);

        builder.HasIndex(x => new { x.CompanyId, x.ProductId, x.WarehouseId });
        builder.HasIndex(x => x.CreatedAt);
    }
}
