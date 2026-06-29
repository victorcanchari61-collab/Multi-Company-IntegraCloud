using Backend.Domain.ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class ProductPriceConfiguration : IEntityTypeConfiguration<ProductPrice>
{
    public void Configure(EntityTypeBuilder<ProductPrice> builder)
    {
        builder.ToTable("product_prices", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.PresentationId).HasColumnName("presentation_id").IsRequired();
        builder.Property(x => x.PriceListId).HasColumnName("price_list_id").IsRequired();
        builder.Property(x => x.CurrencyId).HasColumnName("currency_id").IsRequired();
        builder.Property(x => x.PurchasePrice).HasColumnName("purchase_price").HasPrecision(18, 4);
        builder.Property(x => x.SalePrice).HasColumnName("sale_price").HasPrecision(18, 4);

        builder.HasOne(x => x.Product).WithMany(p => p.Prices).HasForeignKey(x => x.ProductId);
        builder.HasOne(x => x.Presentation).WithMany().HasForeignKey(x => x.PresentationId);
        builder.HasOne(x => x.PriceList).WithMany().HasForeignKey(x => x.PriceListId);
        builder.HasOne(x => x.Currency).WithMany().HasForeignKey(x => x.CurrencyId);

        builder.HasIndex(x => new { x.ProductId, x.PresentationId, x.PriceListId, x.CurrencyId }).IsUnique();
    }
}
