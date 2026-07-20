using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class ProductPresentationConfiguration : IEntityTypeConfiguration<ProductPresentation>
{
    public void Configure(EntityTypeBuilder<ProductPresentation> builder)
    {
        builder.ToTable("product_presentations", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(x => x.UnitOfMeasureId).HasColumnName("unit_of_measure_id");
        builder.Property(x => x.Factor).HasColumnName("factor").HasPrecision(18, 4).IsRequired();
        builder.Property(x => x.IsBase).HasColumnName("is_base").IsRequired().HasDefaultValue(false);
        builder.Property(x => x.SortOrder).HasColumnName("sort_order").IsRequired().HasDefaultValue(0);
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        builder.Property(x => x.ComplementaryProductId).HasColumnName("complementary_product_id");
        builder.Property(x => x.ComplementaryQuantity).HasColumnName("complementary_quantity").HasDefaultValue(0);
        builder.Property(x => x.MarkupPercentage).HasColumnName("markup_percentage").HasPrecision(18, 4).HasDefaultValue(0);

        builder.HasOne(x => x.Product).WithMany(p => p.Presentations).HasForeignKey(x => x.ProductId);
        builder.HasOne(x => x.UnitOfMeasure).WithMany().HasForeignKey(x => x.UnitOfMeasureId);
        builder.HasOne(x => x.ComplementaryProduct).WithMany().HasForeignKey(x => x.ComplementaryProductId).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => new { x.ProductId, x.Name }).IsUnique();
    }
}
