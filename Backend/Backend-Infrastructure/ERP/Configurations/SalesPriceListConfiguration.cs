using Backend.Domain.ERP.Entities.Ventas;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.ERP.Configurations;

public sealed class SalesPriceListConfiguration : IEntityTypeConfiguration<SalesPriceList>
{
    public void Configure(EntityTypeBuilder<SalesPriceList> builder)
    {
        builder.ToTable("sales_price_lists", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(20).IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Currency).HasColumnName("currency").HasMaxLength(10);
        builder.Property(x => x.IsActive).HasColumnName("is_active").IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();

        builder.HasMany(x => x.Items).WithOne().HasForeignKey(x => x.SalesPriceListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.CompanyId, x.Code }).IsUnique();
        builder.HasIndex(x => x.CompanyId);
    }
}

public sealed class SalesPriceListItemConfiguration : IEntityTypeConfiguration<SalesPriceListItem>
{
    public void Configure(EntityTypeBuilder<SalesPriceListItem> builder)
    {
        builder.ToTable("sales_price_list_items", "erp");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SalesPriceListId).HasColumnName("sales_price_list_id").IsRequired();
        builder.Property(x => x.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(x => x.UnitPrice).HasColumnName("unit_price").HasPrecision(18, 4).IsRequired();
    }
}
