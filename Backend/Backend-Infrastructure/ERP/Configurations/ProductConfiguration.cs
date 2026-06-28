using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasColumnName("description").HasMaxLength(2000);
        builder.Property(x => x.Sku).HasColumnName("sku").HasMaxLength(50);
        builder.Property(x => x.Barcode).HasColumnName("barcode").HasMaxLength(50);
        builder.Property(x => x.CategoryId).HasColumnName("category_id");
        builder.Property(x => x.SubcategoryId).HasColumnName("subcategory_id");
        builder.Property(x => x.BrandId).HasColumnName("brand_id");
        builder.Property(x => x.SubbrandId).HasColumnName("subbrand_id");
        builder.Property(x => x.UnitOfMeasureId).HasColumnName("unit_of_measure_id");
        builder.Property(x => x.SalePrice).HasColumnName("sale_price").HasPrecision(18, 4);
        builder.Property(x => x.CostPrice).HasColumnName("cost_price").HasPrecision(18, 4);
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasOne(x => x.Category).WithMany(c => c.Products).HasForeignKey(x => x.CategoryId);
        builder.HasOne(x => x.Subcategory).WithMany(s => s.Products).HasForeignKey(x => x.SubcategoryId);
        builder.HasOne(x => x.Brand).WithMany(b => b.Products).HasForeignKey(x => x.BrandId);
        builder.HasOne(x => x.Subbrand).WithMany(s => s.Products).HasForeignKey(x => x.SubbrandId);
        builder.HasOne(x => x.UnitOfMeasure).WithMany().HasForeignKey(x => x.UnitOfMeasureId);

        builder.HasIndex(x => new { x.CompanyId, x.Sku }).IsUnique().HasFilter("\"sku\" IS NOT NULL");
        builder.HasIndex(x => x.CompanyId);
    }
}
