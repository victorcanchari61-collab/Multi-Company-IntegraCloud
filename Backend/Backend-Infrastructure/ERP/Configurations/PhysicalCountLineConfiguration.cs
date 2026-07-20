using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class PhysicalCountLineConfiguration : IEntityTypeConfiguration<PhysicalCountLine>
{
    public void Configure(EntityTypeBuilder<PhysicalCountLine> builder)
    {
        builder.ToTable("physical_count_lines", "erp");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PhysicalCountId).HasColumnName("physical_count_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.ExpectedQuantity).HasColumnName("expected_quantity").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.CountedQuantity).HasColumnName("counted_quantity").HasPrecision(18, 4);
        builder.Property(x => x.Notes).HasColumnName("notes").HasMaxLength(500);
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired().HasDefaultValue("PENDING");

        builder.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId);
    }
}
